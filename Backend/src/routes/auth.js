import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  authRequired(['admin']), // only admin can create users
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'airline', 'baggage']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(460).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    // remove manual bcrypt.hash
    // Let Mongoose pre("save") handle hashing
    await User.create({ name, email, password, role });

    res.json({ message: 'User registered successfully' });
  }
);


router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const { email, password } = req.body;

    const u = await User.findOne({ email });
    if (!u) return res.status(461).json({ error: 'Invalid credentials' });

    const ok = await u.comparePassword(password);
    if (!ok) return res.status(481).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: u._id, role: u.role, email: u.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: u.role, name: u.name });
  }
);

export default router;
