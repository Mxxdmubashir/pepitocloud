import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../db.js';
import { DeliveryRider } from '../types.js';

export const deliveryRouter = Router();

// Get all riders
deliveryRouter.get('/riders', (_req: Request, res: Response) => {
  const riders = queryAll<DeliveryRider>(`
    SELECT * FROM delivery_riders
    ORDER BY status ASC, name ASC
  `);
  res.json({ riders });
});

// Create rider
deliveryRouter.post('/riders', (req: Request, res: Response): void => {
  const { name, phone, vehicle_type, vehicle_number } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: 'Name and phone are required' });
    return;
  }

  const id = uuidv4();
  execute(`
    INSERT INTO delivery_riders (id, name, phone, vehicle_type, vehicle_number, status, current_orders_count, total_deliveries)
    VALUES (?, ?, ?, ?, ?, 'available', 0, 0)
  `, [id, name, phone, vehicle_type || 'Bike', vehicle_number || '']);

  const rider = queryOne<DeliveryRider>(`SELECT * FROM delivery_riders WHERE id = ?`, [id]);
  res.status(201).json({ rider });
});

// Update rider status
deliveryRouter.patch('/riders/:id/status', (req: Request, res: Response): void => {
  const { status } = req.body;
  execute(`UPDATE delivery_riders SET status = ? WHERE id = ?`, [status, req.params.id]);

  const updated = queryOne<DeliveryRider>(`SELECT * FROM delivery_riders WHERE id = ?`, [req.params.id]);
  res.json({ rider: updated });
});

