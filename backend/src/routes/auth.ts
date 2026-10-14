import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '../db.js';
import { User } from '../types.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pepito_super_secret_kitchen_jwt_key_2026';

// Staff Login
authRouter.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = queryOne<User & { password: string }>(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// Current User Profile
authRouter.get('/me', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = queryOne<User>(`SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?`, [decoded.id]);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// List all staff members
authRouter.get('/users', (_req: Request, res: Response) => {
  const users = queryAll<User>(`SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at ASC`);
  res.json({ users });
});

