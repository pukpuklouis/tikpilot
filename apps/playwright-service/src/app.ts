import express, { Request, Response } from 'express';
import cors from 'cors';
import config from './config/index.js';
import { errorHandler } from './middleware/error-handler.js';
import browserRouter from './routes/browser.js';
import webViewRouter from './routes/webview.js';
import { metrics } from './services/metrics.js';
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

// Metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metricsData = await metrics.register.metrics();
    res.set('Content-Type', metrics.register.contentType);
    res.end(metricsData);
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

// API Routes
app.use('/api/browser', browserRouter);
app.use('/api/webview', webViewRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;
