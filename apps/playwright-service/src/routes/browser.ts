import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { BrowserManager } from '../services/browser-manager.js';
import { validateRequest } from '../middleware/validate-request.js';
import { BadRequestError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const router = Router();

// Validation schemas
const navigationSchema = z.object({
  url: z.string().url(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
});

const scrollSchema = z.object({
  selector: z.string().optional(),
  distance: z.number().optional(),
  direction: z.enum(['up', 'down']).default('down'),
  behavior: z.enum(['smooth', 'auto']).default('smooth'),
});

const clickSchema = z.object({
  selector: z.string(),
  button: z.enum(['left', 'right', 'middle']).default('left'),
  clickCount: z.number().min(1).max(3).default(1),
});

const typeSchema = z.object({
  selector: z.string(),
  text: z.string(),
  delay: z.number().min(0).max(1000).default(50),
});

// Routes
router.post(
  '/navigate',
  validateRequest({ body: navigationSchema }),
  asyncHandler(async (req, res) => {
    const { url, waitUntil } = req.body;
    logger.info(`Navigating to ${url}`);
    
    const page = await BrowserManager.getInstance().getPage();
    
    try {
      await page.goto(url, { waitUntil });
      logger.info(`Successfully navigated to ${url}`);
      res.json({ success: true, url });
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Failed to navigate to ${url}:`, error);
      throw new BadRequestError(`Failed to navigate to ${url}: ${error.message}`);
    }
  })
);

router.post(
  '/scroll',
  validateRequest({ body: scrollSchema }),
  asyncHandler(async (req, res) => {
    const { selector, distance, direction, behavior } = req.body;
    logger.info(`Scrolling ${direction} ${distance || 'viewport height'}${selector ? ` on element ${selector}` : ''}`);
    
    const page = await BrowserManager.getInstance().getPage();
    
    try {
      if (selector) {
        await page.evaluate(
          ({ selector, behavior }) => {
            const element = document.querySelector(selector);
            if (!element) throw new Error(`Element not found: ${selector}`);
            element.scrollIntoView({ behavior });
          },
          { selector, behavior }
        );
      } else {
        await page.evaluate(
          ({ distance, direction, behavior }) => {
            window.scrollBy({
              top: direction === 'down' ? distance || window.innerHeight : -(distance || window.innerHeight),
              behavior,
            });
          },
          { distance, direction, behavior }
        );
      }
      logger.info('Scroll completed successfully');
      res.json({ success: true });
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('Failed to scroll:', error);
      throw new BadRequestError(`Failed to scroll: ${error.message}`);
    }
  })
);

router.post(
  '/click',
  validateRequest({ body: clickSchema }),
  asyncHandler(async (req, res) => {
    const { selector, button, clickCount } = req.body;
    logger.info(`Clicking ${selector} with ${button} button ${clickCount} time(s)`);
    
    const page = await BrowserManager.getInstance().getPage();
    
    try {
      await page.click(selector, { button, clickCount });
      logger.info(`Successfully clicked ${selector}`);
      res.json({ success: true, selector });
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Failed to click ${selector}:`, error);
      throw new BadRequestError(`Failed to click ${selector}: ${error.message}`);
    }
  })
);

router.post(
  '/type',
  validateRequest({ body: typeSchema }),
  asyncHandler(async (req, res) => {
    const { selector, text, delay } = req.body;
    logger.info(`Typing into ${selector} with delay ${delay}ms`);
    
    const page = await BrowserManager.getInstance().getPage();
    
    try {
      await page.type(selector, text, { delay });
      logger.info(`Successfully typed into ${selector}`);
      res.json({ success: true, selector });
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Failed to type into ${selector}:`, error);
      throw new BadRequestError(`Failed to type into ${selector}: ${error.message}`);
    }
  })
);

export default router;
