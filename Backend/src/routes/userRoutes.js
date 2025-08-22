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

/**
 * ✏️ Admin: Update a user by ID (name, email, role)
 */
router.patch(
  '/:id',
  authRequired(['admin']),
  [
    body('name').optional().isString().trim().isLength({ min: 2 }).withMessage('Name too short'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('role').optional().isIn(['airline', 'baggage', 'admin', 'passenger']).withMessage('Invalid role'), // Expanded roles for backend
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, email, role } = req.body;

      // Only allow updating name, email, role. Password update should be separate.
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (role) updateFields.role = role;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true } // Return new doc and run schema validators
      ).lean();

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * 🗑️ Admin: Delete a user by ID
 */
router.delete('/:id', authRequired(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id).lean();

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', _id: deletedUser._id });
  } catch (err) {
    next(err);
  }
});

export default router;
