import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { BrowserManager } from '../services/browser-manager.js';
import { validateRequest } from '../middleware/validate-request.js';

const router = Router();

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
    const page = await BrowserManager.getInstance().getPage();
    await page.goto(url, { waitUntil });
    res.json({ success: true, url });
  })
);

router.post(
  '/scroll',
  validateRequest({ body: scrollSchema }),
  asyncHandler(async (req, res) => {
    const { selector, distance, direction, behavior } = req.body;
    const page = await BrowserManager.getInstance().getPage();
    
    if (selector) {
      await page.evaluate(
        ({ selector, behavior }) => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior });
          }
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
    
    res.json({ success: true });
  })
);

router.post(
  '/click',
  validateRequest({ body: clickSchema }),
  asyncHandler(async (req, res) => {
    const { selector, button, clickCount } = req.body;
    const page = await BrowserManager.getInstance().getPage();
    await page.click(selector, { button, clickCount });
    res.json({ success: true, selector });
  })
);

router.post(
  '/type',
  validateRequest({ body: typeSchema }),
  asyncHandler(async (req, res) => {
    const { selector, text, delay } = req.body;
    const page = await BrowserManager.getInstance().getPage();
    await page.type(selector, text, { delay });
    res.json({ success: true, selector });
  })
);

export default router;
