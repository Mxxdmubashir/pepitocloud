import express, { Request, Response, NextFunction } from 'express';
import http from 'node:http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';

import { authRouter } from './routes/auth.js';
import { brandsRouter } from './routes/brands.js';
import { menuRouter } from './routes/menu.js';
import { ordersRouter } from './routes/orders.js';
import { kdsRouter } from './routes/kds.js';
import { inventoryRouter } from './routes/inventory.js';
import { recipesRouter } from './routes/recipes.js';
import { deliveryRouter } from './routes/delivery.js';
import { customersRouter } from './routes/customers.js';
import { analyticsRouter } from './routes/analytics.js';

dotenv.config();

// Ensure DB tables are ready
initDatabase();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Attach io instance to request for routes to broadcast real-time events
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).io = io;
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/kds', kdsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/customers', customersRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'Pepito Cloud Kitchen Enterprise Software',
    timestamp: new Date().toISOString()
  });
});

// Socket.io Handlers
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Realtime Kitchen Engine: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ======================================================
  🚀 PEPITO CLOUD KITCHEN MANAGEMENT ENGINE RUNNING
  📡 REST API:      http://localhost:${PORT}/api
  ⚡ WEBSOCKETS:    ws://localhost:${PORT}
  🏥 HEALTH CHECK:  http://localhost:${PORT}/api/health
  ======================================================
  `);
});

