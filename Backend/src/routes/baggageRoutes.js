import { Router } from "express";
import { body, validationResult } from "express-validator";
import { authRequired } from "../middleware/auth.js";
import Baggage from "../models/Baggage.js";
import Flight from "../models/Flight.js";
import { producer } from "../config/kafka.js";
import { redis } from "../config/redis.js";

const router = Router();

/**
 * List all baggage (with optional filters)
 */
router.get("/", authRequired(["admin", "baggage", "airline", "passenger"]), async (req, res, next) => {
  try {
    const { tagId, flightId } = req.query;
    const query = {};
    if (tagId) query.tagId = tagId;
    if (flightId) query.flightId = flightId;

    const baggage = await Baggage.find(query).populate("flightId", "flightNo origin destination");

    res.json(baggage);
  } catch (err) {
    next(err);
  }
});

/**
 * Assign baggage to a flight
 */
router.post(
  "/",
  authRequired(["admin", "baggage", "airline", "passenger"]),
  [
    body("tagId").notEmpty().isAlphanumeric().trim().escape(),
    body("flightId")
      .notEmpty()
      .isMongoId()
      .custom(async (value) => {
        const flight = await Flight.findById(value);
        if (!flight) throw new Error("Flight not found");
        return true;
      }),
    body("weight").optional().isFloat({ min: 0.1, max: 100 }),
    body("status").optional().isIn(["checkin", "loaded", "inTransit", "unloaded", "atBelt", "lost"]),
    body("lastLocation").optional().trim().escape(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const baggage = await Baggage.create({
        ...req.body,
        createdBy: req.user.sub,
      });

      // Kafka event
      await producer.send({
        topic: "baggage-events",
        messages: [
          {
            key: baggage.tagId,
            value: JSON.stringify({
              type: "baggage",
              subtype: "created",
              baggageId: baggage._id,
              tagId: baggage.tagId,
              flightId: baggage.flightId,
              status: baggage.status,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });

      // Redis cache
      await redis.set(
        `baggage:${baggage.tagId}`,
        JSON.stringify({
          flightId: baggage.flightId,
          status: baggage.status,
          lastLocation: baggage.lastLocation,
          updatedAt: baggage.updatedAt,
        }),
        { EX: 7200 }
      );

      res.status(201).json({
        message: "Baggage successfully assigned",
        baggageId: baggage._id,
        tagId: baggage.tagId,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: "Baggage tag ID already exists" });
      }
      next(err);
    }
  }
);

/**
 * Update baggage status
 */
router.patch(
  "/:id",
  authRequired(["admin", "baggage", "passenger"]),
  [
    body("status").optional().isIn(["checkin", "loaded", "inTransit", "unloaded", "atBelt", "lost"]),
    body("lastLocation").optional().trim().escape(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { id } = req.params;
      const updates = req.body;

      const baggage = await Baggage.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!baggage) return res.status(404).json({ error: "Baggage not found" });

      // Kafka event
      await producer.send({
        topic: "baggage-events",
        messages: [
          {
            key: baggage.tagId,
            value: JSON.stringify({
              type: "baggage",
              subtype: "statusChanged",
              baggageId: baggage._id,
              tagId: baggage.tagId,
              flightId: baggage.flightId,
              status: baggage.status,
              lastLocation: baggage.lastLocation,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });

      // Redis update
      await redis.set(
        `baggage:${baggage.tagId}`,
        JSON.stringify({
          flightId: baggage.flightId,
          status: baggage.status,
          lastLocation: baggage.lastLocation,
          updatedAt: baggage.updatedAt,
        }),
        { EX: 7200 }
      );

      res.json({
        message: "Baggage updated successfully",
        tagId: baggage.tagId,
        status: baggage.status,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Delete baggage
 */
router.delete("/:id", authRequired(["admin", "baggage", "passenger"]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const baggage = await Baggage.findByIdAndDelete(id);

    if (!baggage) return res.status(404).json({ error: "Baggage not found" });

    // Remove from Redis cache
    await redis.del(`baggage:${baggage.tagId}`);

    // Kafka event for deletion
    await producer.send({
      topic: "baggage-events",
      messages: [
        {
          key: baggage.tagId,
          value: JSON.stringify({
            type: "baggage",
            subtype: "deleted",
            baggageId: baggage._id,
            tagId: baggage.tagId,
            flightId: baggage.flightId,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    res.json({ message: "Baggage deleted successfully", tagId: baggage.tagId });
  } catch (err) {
    next(err);
  }
});

export default router;
