// src/routes/passengerRoutes.js
import { Router } from "express";
import { body, validationResult } from "express-validator";
import { authRequired } from "../middleware/auth.js";
import User from "../models/User.js";
import Flight from "../models/Flight.js";

const router = Router();

/**
 * Passenger checks into a flight
 */
router.post(
  "/checkin",
  authRequired(["passenger"]),
  [body("flightId").isMongoId().withMessage("Invalid flight ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { flightId } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ error: "Flight not found" });

    // attach passenger to the flight
    const passenger = await User.findById(req.user.sub);
    if (!passenger) return res.status(404).json({ error: "Passenger not found" });

    if (passenger.role !== "passenger") {
      return res.status(403).json({ error: "Only passengers can check in" });
    }

    // Add passenger to flight's manifest if not already added
    if (!flight.passengers) flight.passengers = [];
    if (!flight.passengers.includes(passenger._id)) {
      flight.passengers.push(passenger._id);
      await flight.save();
    }

    res.status(201).json({
      message: "Passenger checked in",
      flightId: flight._id,
    });
  }
);

/**
 * Get passenger's flights
 */
router.get("/my-flights", authRequired(["passenger"]), async (req, res) => {
  const flights = await Flight.find({ passengers: req.user.sub }).lean();
  res.json(flights);
});

export default router;
