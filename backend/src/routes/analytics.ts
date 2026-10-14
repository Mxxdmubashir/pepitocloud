import { Router, Request, Response } from 'express';
import { queryAll, queryOne } from '../db.js';

export const analyticsRouter = Router();

// Dashboard Summary Stats
analyticsRouter.get('/dashboard', (_req: Request, res: Response) => {
  // 1. Overall Today Stats
  const todayStats = queryOne<{ total_revenue: number; total_orders: number; avg_ticket: number }>(`
    SELECT
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COUNT(id) as total_orders,
      COALESCE(AVG(total_amount), 0) as avg_ticket
    FROM orders
    WHERE DATE(created_at) = DATE('now')
  `) || { total_revenue: 0, total_orders: 0, avg_ticket: 0 };

  // 2. Active Orders Live Count
  const activeOrders = queryOne<{ count: number }>(`
    SELECT COUNT(id) as count
    FROM orders
    WHERE status IN ('pending', 'accepted', 'preparing', 'ready', 'dispatched')
  `)?.count || 0;

  // 3. Revenue by Brand
  const brandSales = queryAll<{ brand_id: string; brand_name: string; banner_color: string; revenue: number; order_count: number }>(`
    SELECT
      b.id as brand_id,
      b.name as brand_name,
      b.banner_color,
      COALESCE(SUM(o.total_amount), 0) as revenue,
      COUNT(o.id) as order_count
    FROM brands b
    LEFT JOIN orders o ON b.id = o.brand_id AND o.status != 'cancelled'
    GROUP BY b.id
    ORDER BY revenue DESC
  `);

  // 4. Breakdown by Channel (Aggregators vs Direct)
  const channelBreakdown = queryAll<{ channel: string; order_count: number; total_sales: number }>(`
    SELECT
      channel,
      COUNT(id) as order_count,
      COALESCE(SUM(total_amount), 0) as total_sales
    FROM orders
    WHERE status != 'cancelled'
    GROUP BY channel
    ORDER BY order_count DESC
  `);

  // 5. Top 5 Best-Selling Menu Items
  const topItems = queryAll<{ item_name: string; total_quantity: number; total_sales: number }>(`
    SELECT
      item_name,
      SUM(quantity) as total_quantity,
      SUM(total_price) as total_sales
    FROM order_items
    GROUP BY item_name
    ORDER BY total_quantity DESC
    LIMIT 5
  `);

  // 6. Low stock items count
  const lowStockCount = queryOne<{ count: number }>(`
    SELECT COUNT(id) as count FROM inventory_items WHERE current_stock <= min_threshold
  `)?.count || 0;

  res.json({
    today: {
      revenue: Math.round(todayStats.total_revenue * 100) / 100,
      orders: todayStats.total_orders,
      avg_ticket: Math.round(todayStats.avg_ticket * 100) / 100,
      active_orders: activeOrders
    },
    brand_sales: brandSales,
    channel_breakdown: channelBreakdown,
    top_items: topItems,
    low_stock_count: lowStockCount
  });
});

// Comprehensive Sales Report & Z-Report
analyticsRouter.get('/sales-report', (req: Request, res: Response) => {
  const { from_date, to_date } = req.query;

  let dateFilter = `WHERE o.status != 'cancelled'`;
  const params: any[] = [];

  if (from_date && to_date) {
    dateFilter += ` AND DATE(o.created_at) BETWEEN ? AND ?`;
    params.push(from_date, to_date);
  }

  // Summary by payment method
  const paymentSummary = queryAll(`
    SELECT payment_method, COUNT(id) as count, SUM(total_amount) as total
    FROM orders o
    ${dateFilter}
    GROUP BY payment_method
  `, params);

  // Financial aggregates
  const financials = queryOne<{
    gross_sales: number;
    discounts: number;
    net_sales: number;
    tax_collected: number;
    packaging_fees: number;
    delivery_fees: number;
    final_total: number;
  }>(`
    SELECT
      COALESCE(SUM(subtotal), 0) as gross_sales,
      COALESCE(SUM(discount_amount), 0) as discounts,
      COALESCE(SUM(subtotal - discount_amount), 0) as net_sales,
      COALESCE(SUM(tax_amount), 0) as tax_collected,
      COALESCE(SUM(packaging_fee), 0) as packaging_fees,
      COALESCE(SUM(delivery_fee), 0) as delivery_fees,
      COALESCE(SUM(total_amount), 0) as final_total
    FROM orders o
    ${dateFilter}
  `, params);

  res.json({
    financials,
    payment_methods: paymentSummary,
    generated_at: new Date().toISOString()
  });
});

