import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../db.js';
import { Customer } from '../types.js';

export const customersRouter = Router();

// Search or list customers
customersRouter.get('/', (req: Request, res: Response) => {
  const { search } = req.query;
  let sql = `SELECT * FROM customers WHERE 1=1`;
  const params: any[] = [];

  if (search) {
    sql += ` AND (phone LIKE ? OR name LIKE ? OR email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY total_spent DESC LIMIT 50`;
  const customers = queryAll<Customer>(sql, params);
  res.json({ customers });
});

// Create or update customer
customersRouter.post('/', (req: Request, res: Response): void => {
  const { name, phone, email, address, city, notes } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: 'Name and phone are required' });
    return;
  }

  const existing = queryOne<Customer>(`SELECT * FROM customers WHERE phone = ?`, [phone]);
  if (existing) {
    execute(`
      UPDATE customers
      SET name = ?, email = COALESCE(?, email), address = COALESCE(?, address),
          city = COALESCE(?, city), notes = COALESCE(?, notes)
      WHERE id = ?
    `, [name, email, address, city, notes, existing.id]);

    const updated = queryOne<Customer>(`SELECT * FROM customers WHERE id = ?`, [existing.id]);
    res.json({ customer: updated });
    return;
  }

  const id = uuidv4();
  execute(`
    INSERT INTO customers (id, name, phone, email, address, city, notes, loyalty_points, total_orders, total_spent)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
  `, [id, name, phone, email || '', address || '', city || 'Bengaluru', notes || '']);

  const created = queryOne<Customer>(`SELECT * FROM customers WHERE id = ?`, [id]);
  res.status(201).json({ customer: created });
});

