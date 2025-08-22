import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import Flight from '../models/Flight.js';
import { producer } from '../config/kafka.js';
import { redis } from '../config/redis.js';

const router = Router();

/**
 * ✈️ Create new flight
 */
router.post('/',
  authRequired(['admin', 'airline']),
  body('flightNo').notEmpty(),
  body('origin').notEmpty(),
  body('destination').notEmpty(),
  body('status').optional().toLowerCase().isIn(['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled']),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const payload = { ...req.body, createdBy: req.user.sub };
      const f = await Flight.create(payload);

      await producer.send({
        topic: 'flight-events',
        messages: [{
          key: f.flightNo,
          value: JSON.stringify({
            type: 'flight',
            subtype: 'created',
            flightId: f._id,
            flightNo: f.flightNo,
            payload
          })
        }]
      });

      await redis.set(`flight:${f._id}:status`, JSON.stringify({
        flightNo: f.flightNo,
        gate: f.gate,
        status: f.status,
        scheduledDep: f.scheduledDep,
        scheduledArr: f.scheduledArr
      }), { EX: 3600 });

      res.status(201).json({ message: 'Flight created', flightId: f._id });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * 📋 Get all flights
 */
router.get('/', authRequired(['admin', 'airline', 'baggage', 'passenger']), async (req, res, next) => {
  try {
    const flights = await Flight.find().sort({ createdAt: -1 }).lean();
    res.json(flights);
  } catch (err) {
    next(err);
  }
});

/**
 * 🔎 Search flight by flightNo (case-insensitive, cached)
 */
router.get('/search/:flightNo', authRequired(['admin', 'airline', 'baggage', 'passenger']), async (req, res, next) => {
  try {
    const { flightNo } = req.params;

    // Check cache
    const cached = await redis.get(`flightNo:${flightNo.toUpperCase()}`);
    if (cached) return res.json(JSON.parse(cached));

    // Case-insensitive search
    const flight = await Flight.findOne({ flightNo: new RegExp(`^${flightNo}$`, "i") }).lean();
    if (!flight) return res.status(404).json({ error: 'Flight not found' });

    // Save to cache
    await redis.set(`flightNo:${flight.flightNo.toUpperCase()}`, JSON.stringify(flight), { EX: 600 });

    res.json(flight);
  } catch (err) {
    next(err);
  }
});

/**
 * ✏️ Update flight
 */
router.patch('/:id',
  authRequired(['admin', 'airline']),
  body('status').optional().isIn(['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled']),
  body('gate').optional().trim().escape(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { id } = req.params;
      const updates = { ...req.body };

      ['flightNo', 'createdBy', '_id'].forEach(field => delete updates[field]);

      const updatedFlight = await Flight.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!updatedFlight) return res.status(404).json({ error: 'Flight not found' });

      await producer.send({
        topic: 'flight-events',
        messages: [{
          key: updatedFlight.flightNo,
          value: JSON.stringify({
            type: 'flight',
            subtype: 'updated',
            flightId: updatedFlight._id,
            flightNo: updatedFlight.flightNo,
            payload: updates,
            timestamp: new Date().toISOString()
          })
        }]
      });

      await redis.set(
        `flight:${updatedFlight._id}:status`,
        JSON.stringify({
          flightNo: updatedFlight.flightNo,
          gate: updatedFlight.gate,
          status: updatedFlight.status,
          scheduledDep: updatedFlight.scheduledDep?.toISOString(),
          scheduledArr: updatedFlight.scheduledArr?.toISOString(),
          lastUpdated: new Date().toISOString()
        }),
        { EX: 3600 }
      );

      await redis.del(`flightNo:${updatedFlight.flightNo.toUpperCase()}`);

      res.json({ message: 'Flight updated successfully', flightId: updatedFlight._id });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * ❌ Delete flight
 */
router.delete('/:id', authRequired(['admin','airline']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedFlight = await Flight.findByIdAndDelete(id);

    if (!deletedFlight) return res.status(404).json({ error: 'Flight not found' });

    await producer.send({
      topic: 'flight-events',
      messages: [{
        key: deletedFlight.flightNo,
        value: JSON.stringify({
          type: 'flight',
          subtype: 'deleted',
          flightId: deletedFlight._id,
          flightNo: deletedFlight.flightNo,
          timestamp: new Date().toISOString()
        })
      }]
    });

    await redis.del(`flight:${deletedFlight._id}:status`);
    await redis.del(`flightNo:${deletedFlight.flightNo.toUpperCase()}`);

    res.json({
      message: 'Flight deleted successfully',
      flightNo: deletedFlight.flightNo,
      deletedAt: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export default router;
