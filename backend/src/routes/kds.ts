import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../db.js';

export const kdsRouter = Router();

// Get active kitchen tickets
kdsRouter.get('/tickets', (req: Request, res: Response) => {
  const { station, brand_id } = req.query;

  let sql = `
    SELECT o.id, o.order_number, o.brand_id, o.channel, o.status, o.created_at, o.accepted_at,
           o.special_instructions, o.prep_time_minutes,
           b.name as brand_name, b.banner_color, b.logo_url as brand_logo
    FROM orders o
    JOIN brands b ON o.brand_id = b.id
    WHERE o.status IN ('accepted', 'preparing')
  `;
  const params: any[] = [];

  if (brand_id && brand_id !== 'all') {
    sql += ` AND o.brand_id = ?`;
    params.push(brand_id);
  }

  sql += ` ORDER BY o.created_at ASC`;
  const tickets = queryAll(sql, params);

  if (tickets.length === 0) {
    res.json({ tickets: [] });
    return;
  }

  const orderIds = tickets.map(t => `'${t.id}'`).join(',');
  let itemSql = `
    SELECT oi.*, m.station
    FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE oi.order_id IN (${orderIds})
  `;

  if (station && station !== 'all') {
    itemSql += ` AND m.station = '${station}'`;
  }

  const items = queryAll(itemSql);
  const itemsByOrder: Record<string, any[]> = {};
  items.forEach(it => {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
    itemsByOrder[it.order_id].push(it);
  });

  // Filter out tickets that have no items matching this station (if station filtered)
  const populatedTickets = tickets
    .map(t => ({
      ...t,
      items: itemsByOrder[t.id] || []
    }))
    .filter(t => t.items.length > 0);

  res.json({ tickets: populatedTickets });
});

// Bump ticket (mark as READY from KDS)
kdsRouter.post('/bump/:orderId', (req: Request, res: Response): void => {
  const { orderId } = req.params;

  execute(`
    UPDATE orders
    SET status = 'ready', prepared_at = datetime('now')
    WHERE id = ?
  `, [orderId]);

  execute(`
    UPDATE order_items
    SET status = 'ready'
    WHERE order_id = ?
  `, [orderId]);

  if ((req as any).io) {
    (req as any).io.emit('kds:ticket_bumped', { orderId });
    (req as any).io.emit('order:updated', { orderId, status: 'ready' });
  }

  res.json({ success: true, message: 'Ticket bumped to Ready' });
});

// Toggle individual item readiness in KDS
kdsRouter.patch('/items/:itemId/toggle', (req: Request, res: Response): void => {
  const { itemId } = req.params;
  const item = queryOne<{ id: string; status: string; order_id: string }>(`
    SELECT id, status, order_id FROM order_items WHERE id = ?
  `, [itemId]);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const newStatus = item.status === 'ready' ? 'cooking' : 'ready';
  execute(`UPDATE order_items SET status = ? WHERE id = ?`, [newStatus, itemId]);

  if ((req as any).io) {
    (req as any).io.emit('kds:item_updated', { itemId, status: newStatus, orderId: item.order_id });
  }

  res.json({ success: true, status: newStatus });
});

