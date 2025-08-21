import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

/**
 * 👤 Get current user
 */
router.get('/me', authRequired(), async (req, res, next) => {
  try {
    const u = await User.findById(req.user.sub).lean();
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ _id: u._id, name: u.name, email: u.email, role: u.role });
  } catch (err) {
    next(err);
  }
});

/**
 * ✏️ Update current user's name
 */
router.patch(
  '/me',
  authRequired(),
  body('name').isString().trim().isLength({ min: 2 }).withMessage('Name too short'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const updated = await User.findByIdAndUpdate(
        req.user.sub,
        { name: req.body.name },
        { new: true }
      ).lean();

      res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * 📋 Admin: Get all users
 */
router.get('/', authRequired(['admin']), async (req, res, next) => {
  try {
    const users = await User.find().select('_id name email role').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

export default router;
