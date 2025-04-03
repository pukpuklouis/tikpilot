import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error-handler.js';
import browserRouter from './routes/browser.js';
import config from './config/index.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/browser', browserRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found',
  });
});

export default app;
