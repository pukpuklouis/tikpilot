import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  logger.error('Unhandled error:', err);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
