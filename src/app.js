import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { sendError } from './utils/response.js';
import pool from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use('/api', rateLimiter);

// Health Check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
    });
  }
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`\nFinance Dashboard API running`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health\n`);
});

export default app;
