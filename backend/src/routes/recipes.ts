import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../db.js';
import { Recipe } from '../types.js';

export const recipesRouter = Router();

// Get recipe for a menu item
recipesRouter.get('/item/:menuItemId', (req: Request, res: Response) => {
  const recipes = queryAll<Recipe>(`
    SELECT r.*, ii.name as ingredient_name, ii.unit, ii.cost_per_unit
    FROM recipes r
    JOIN inventory_items ii ON r.inventory_item_id = ii.id
    WHERE r.menu_item_id = ?
  `, [req.params.menuItemId]);

  const totalCost = recipes.reduce((sum, r) => sum + (r.quantity_required * (r.cost_per_unit || 0)), 0);

  res.json({ recipes, estimated_food_cost: Math.round(totalCost * 100) / 100 });
});

// Add ingredient to recipe
recipesRouter.post('/', (req: Request, res: Response): void => {
  const { menu_item_id, inventory_item_id, quantity_required, notes } = req.body;

  if (!menu_item_id || !inventory_item_id || quantity_required === undefined) {
    res.status(400).json({ error: 'Menu Item, Inventory Item, and Quantity are required' });
    return;
  }

  const id = uuidv4();
  execute(`
    INSERT INTO recipes (id, menu_item_id, inventory_item_id, quantity_required, notes)
    VALUES (?, ?, ?, ?, ?)
  `, [id, menu_item_id, inventory_item_id, Number(quantity_required), notes || '']);

  const recipe = queryOne<Recipe>(`
    SELECT r.*, ii.name as ingredient_name, ii.unit, ii.cost_per_unit
    FROM recipes r
    JOIN inventory_items ii ON r.inventory_item_id = ii.id
    WHERE r.id = ?
  `, [id]);

  res.status(201).json({ recipe });
});

// Delete ingredient from recipe
recipesRouter.delete('/:id', (req: Request, res: Response): void => {
  execute(`DELETE FROM recipes WHERE id = ?`, [req.params.id]);
  res.json({ success: true, message: 'Ingredient removed from recipe' });
});

