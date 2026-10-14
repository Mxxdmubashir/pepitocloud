import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../db.js';
import { Brand } from '../types.js';

export const brandsRouter = Router();

// Get all virtual brands
brandsRouter.get('/', (_req: Request, res: Response) => {
  const brands = queryAll<Brand & { item_count: number }>(`
    SELECT b.*, COUNT(m.id) as item_count
    FROM brands b
    LEFT JOIN menu_items m ON b.id = m.brand_id
    GROUP BY b.id
    ORDER BY b.created_at ASC
  `);
  res.json({ brands });
});

// Get single brand
brandsRouter.get('/:id', (req: Request, res: Response): void => {
  const brand = queryOne<Brand>(`SELECT * FROM brands WHERE id = ?`, [req.params.id]);
  if (!brand) {
    res.status(404).json({ error: 'Brand not found' });
    return;
  }
  res.json({ brand });
});

// Create new brand
brandsRouter.post('/', (req: Request, res: Response): void => {
  const { name, tagline, cuisine, logo_url, banner_color, outlet_id } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Brand name is required' });
    return;
  }

  const id = uuidv4();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const outlet = outlet_id || queryOne<{ id: string }>(`SELECT id FROM outlets LIMIT 1`)?.id;

  execute(`
    INSERT INTO brands (id, outlet_id, name, slug, tagline, cuisine, logo_url, banner_color, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `, [id, outlet, name, `${slug}-${Date.now().toString().slice(-4)}`, tagline || '', cuisine || 'Multi-Cuisine', logo_url || '', banner_color || '#3B82F6']);

  const newBrand = queryOne<Brand>(`SELECT * FROM brands WHERE id = ?`, [id]);
  res.status(201).json({ brand: newBrand });
});

// Update brand
brandsRouter.put('/:id', (req: Request, res: Response): void => {
  const { name, tagline, cuisine, logo_url, banner_color, is_active } = req.body;
  const brand = queryOne<Brand>(`SELECT * FROM brands WHERE id = ?`, [req.params.id]);
  if (!brand) {
    res.status(404).json({ error: 'Brand not found' });
    return;
  }

  execute(`
    UPDATE brands
    SET name = COALESCE(?, name),
        tagline = COALESCE(?, tagline),
        cuisine = COALESCE(?, cuisine),
        logo_url = COALESCE(?, logo_url),
        banner_color = COALESCE(?, banner_color),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `, [name, tagline, cuisine, logo_url, banner_color, is_active, req.params.id]);

  const updated = queryOne<Brand>(`SELECT * FROM brands WHERE id = ?`, [req.params.id]);
  res.json({ brand: updated });
});

// Toggle Brand Active Status
brandsRouter.patch('/:id/toggle', (req: Request, res: Response): void => {
  const brand = queryOne<Brand>(`SELECT * FROM brands WHERE id = ?`, [req.params.id]);
  if (!brand) {
    res.status(404).json({ error: 'Brand not found' });
    return;
  }

  const newStatus = brand.is_active === 1 ? 0 : 1;
  execute(`UPDATE brands SET is_active = ? WHERE id = ?`, [newStatus, req.params.id]);
  res.json({ success: true, is_active: newStatus });
});

