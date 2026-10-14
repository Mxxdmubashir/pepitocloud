import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../db.js';
import { MenuItem, Category } from '../types.js';

export const menuRouter = Router();

// Get Categories (optionally filtered by brand)
menuRouter.get('/categories', (req: Request, res: Response) => {
  const { brand_id } = req.query;
  let sql = `SELECT c.*, b.name as brand_name FROM categories c JOIN brands b ON c.brand_id = b.id WHERE 1=1`;
  const params: any[] = [];

  if (brand_id) {
    sql += ` AND c.brand_id = ?`;
    params.push(brand_id);
  }

  sql += ` ORDER BY c.display_order ASC, c.name ASC`;
  const categories = queryAll<Category & { brand_name: string }>(sql, params);
  res.json({ categories });
});

// Create Category
menuRouter.post('/categories', (req: Request, res: Response): void => {
  const { brand_id, name, display_order } = req.body;
  if (!brand_id || !name) {
    res.status(400).json({ error: 'Brand ID and Category Name are required' });
    return;
  }

  const id = uuidv4();
  execute(`
    INSERT INTO categories (id, brand_id, name, display_order, is_active)
    VALUES (?, ?, ?, ?, 1)
  `, [id, brand_id, name, display_order || 0]);

  const cat = queryOne<Category>(`SELECT * FROM categories WHERE id = ?`, [id]);
  res.status(201).json({ category: cat });
});

// Get Menu Items (with category and brand info)
menuRouter.get('/items', (req: Request, res: Response) => {
  const { brand_id, category_id, search, available_only } = req.query;
  let sql = `
    SELECT m.*, b.name as brand_name, b.logo_url as brand_logo, c.name as category_name
    FROM menu_items m
    JOIN brands b ON m.brand_id = b.id
    JOIN categories c ON m.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (brand_id) {
    sql += ` AND m.brand_id = ?`;
    params.push(brand_id);
  }
  if (category_id) {
    sql += ` AND m.category_id = ?`;
    params.push(category_id);
  }
  if (available_only === 'true') {
    sql += ` AND m.is_available = 1 AND b.is_active = 1`;
  }
  if (search) {
    sql += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY b.name ASC, c.display_order ASC, m.name ASC`;
  const items = queryAll<MenuItem>(sql, params);
  res.json({ items });
});

// Get single menu item with modifiers
menuRouter.get('/items/:id', (req: Request, res: Response): void => {
  const item = queryOne<MenuItem>(`
    SELECT m.*, b.name as brand_name, c.name as category_name
    FROM menu_items m
    JOIN brands b ON m.brand_id = b.id
    JOIN categories c ON m.category_id = c.id
    WHERE m.id = ?
  `, [req.params.id]);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const modifiers = queryAll(`
    SELECT im.*, mg.name as group_name, mg.min_selection, mg.max_selection, mg.is_required
    FROM item_modifiers im
    JOIN modifier_groups mg ON im.group_id = mg.id
    WHERE im.menu_item_id = ? OR im.menu_item_id IS NULL
  `, [item.id]);

  res.json({ item, modifiers });
});

// Create Menu Item
menuRouter.post('/items', (req: Request, res: Response): void => {
  const {
    brand_id, category_id, name, description, base_price,
    image_url, is_veg, station, prep_time_minutes, swiggy_price, zomato_price
  } = req.body;

  if (!brand_id || !category_id || !name || base_price === undefined) {
    res.status(400).json({ error: 'Brand, Category, Name and Base Price are required' });
    return;
  }

  const id = uuidv4();
  execute(`
    INSERT INTO menu_items (
      id, brand_id, category_id, name, description, base_price, image_url,
      is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `, [
    id, brand_id, category_id, name, description || '', base_price,
    image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop',
    is_veg !== undefined ? is_veg : 1,
    station || 'Prep',
    prep_time_minutes || 12,
    swiggy_price || Math.round(base_price * 1.1),
    zomato_price || Math.round(base_price * 1.1)
  ]);

  const created = queryOne<MenuItem>(`SELECT * FROM menu_items WHERE id = ?`, [id]);
  res.status(201).json({ item: created });
});

// Update Menu Item
menuRouter.put('/items/:id', (req: Request, res: Response): void => {
  const {
    category_id, name, description, base_price,
    image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price
  } = req.body;

  const item = queryOne<MenuItem>(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  execute(`
    UPDATE menu_items
    SET category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        base_price = COALESCE(?, base_price),
        image_url = COALESCE(?, image_url),
        is_veg = COALESCE(?, is_veg),
        is_available = COALESCE(?, is_available),
        station = COALESCE(?, station),
        prep_time_minutes = COALESCE(?, prep_time_minutes),
        swiggy_price = COALESCE(?, swiggy_price),
        zomato_price = COALESCE(?, zomato_price)
    WHERE id = ?
  `, [category_id, name, description, base_price, image_url, is_veg, is_available, station, prep_time_minutes, swiggy_price, zomato_price, req.params.id]);

  const updated = queryOne<MenuItem>(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
  res.json({ item: updated });
});

// 86 Out of Stock toggle (Immediate kitchen & aggregator stock toggle)
menuRouter.patch('/items/:id/toggle-stock', (req: Request, res: Response): void => {
  const item = queryOne<MenuItem>(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const newStockStatus = item.is_available === 1 ? 0 : 1;
  execute(`UPDATE menu_items SET is_available = ? WHERE id = ?`, [newStockStatus, req.params.id]);

  // Emit event if socket is attached
  if ((req as any).io) {
    (req as any).io.emit('item:stock_changed', { itemId: item.id, is_available: newStockStatus, name: item.name });
  }

  res.json({ success: true, is_available: newStockStatus, itemId: item.id });
});

// Delete Menu Item
menuRouter.delete('/items/:id', (req: Request, res: Response): void => {
  execute(`DELETE FROM menu_items WHERE id = ?`, [req.params.id]);
  res.json({ success: true, message: 'Item deleted' });
});

