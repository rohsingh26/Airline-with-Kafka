import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import Flight from '../models/Flight.js';
import { producer } from '../config/kafka.js';
import { redis } from '../config/redis.js';
const router = Router();
router.post('/',
  authRequired(['admin','airline']),
  body('flightNo').notEmpty(),
  body('origin').notEmpty(),
  body('destination').notEmpty(),
  body('status').optional().toLowerCase().isIn(['scheduled','boarding','departed','arrived','delayed','cancelled']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const payload = { ...req.body, createdBy: req.user.sub };
    const f = await Flight.create(payload);
    await producer.send({
      topic: 'flight-events',
      messages: [{ key: f.flightNo, value: JSON.stringify({ type:'flight', subtype:'created', flightId: f._id, flightNo: f.flightNo, payload }) }]
    });
    // cache quick status
    await redis.set(`flight:${f._id}:status`, JSON.stringify({
      flightNo: f.flightNo, gate: f.gate, status: f.status,
      scheduledDep: f.scheduledDep, scheduledArr: f.scheduledArr
    }), { EX: 3600 });
    res.status(201).json({ message: 'Flight created', flightId: f._id });
  }
);
router.get('/', authRequired(['admin','airline','baggage']), async (req, res) => {
  const flights = await Flight.find().sort({ createdAt: -1 }).lean();
  res.json(flights);
});
router.patch('/:id',
  authRequired(['admin','airline']),
  body('status').optional().isIn(['scheduled','boarding','departed','arrived','delayed','cancelled']),
  body('gate').optional().trim().escape(),
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const updates = req.body;
      // Prevent modification of protected fields
      const protectedFields = ['flightNo', 'createdBy', '_id'];
      protectedFields.forEach(field => delete updates[field]);
      // Update flight
      const updatedFlight = await Flight.findByIdAndUpdate(
        id, 
        updates, 
        { new: true, runValidators: true }
      );
      if (!updatedFlight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      // Publish Kafka event
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
      // Update Redis cache
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
        { EX: 3600 } // Expire after 1 hour
      );
      res.json({ 
        message: 'Flight updated successfully',
        flightId: updatedFlight._id 
      });
    } catch (error) {
      next(error); // Pass to error handler middleware
    }
  }
);
//delete Flight
router.delete('/:id',
  authRequired(['admin']), // Only admin can delete flights
  async (req, res, next) => {
    try {
      const { id } = req.params;
      // Find and delete the flight
      const deletedFlight = await Flight.findByIdAndDelete(id);
      
      if (!deletedFlight) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      // Publish deletion event to Kafka
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
      // Remove from Redis cache
      await redis.del(`flight:${deletedFlight._id}:status`);
      res.json({ 
        message: 'Flight deleted successfully',
        flightNo: deletedFlight.flightNo,
        deletedAt: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);
export default router;
