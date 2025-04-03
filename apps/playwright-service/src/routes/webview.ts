import { Router } from 'express';
import { z } from 'zod';
import { BrowserManager } from '../services/browser-manager.js';
import { validateRequest } from '../middleware/validate-request.js';
import logger from '../utils/logger.js';

const router = Router();

// Schema for WebView connection request
const webViewConnectionSchema = z.object({
  url: z.string().url(),
  useFingerprinting: z.boolean().optional().default(true),
});

// Schema for WebView action request
const webViewActionSchema = z.object({
  pageId: z.string(),
});

// Map to store WebView pages
const webViewPages = new Map<string, any>();

// Create a new WebView connection
router.post(
  '/connect',
  validateRequest({ body: webViewConnectionSchema }),
  async (req, res) => {
    try {
      const { url, useFingerprinting } = req.body;
      const browserManager = BrowserManager.getInstance();
      const page = await browserManager.createWebViewConnection({
        url,
        useFingerprinting,
      });

      const pageId = Math.random().toString(36).substring(7);
      webViewPages.set(pageId, page);

      logger.info('Created new WebView connection', { pageId, url });
      res.json({ success: true, pageId });
    } catch (error) {
      logger.error('Failed to create WebView connection:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create WebView connection',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

// Close a WebView connection
router.post(
  '/disconnect',
  validateRequest({ body: webViewActionSchema }),
  async (req, res) => {
    try {
      const { pageId } = req.body;
      const page = webViewPages.get(pageId);

      if (!page) {
        return res.status(404).json({
          status: 'error',
          message: 'WebView not found',
        });
      }

      await page.close();
      webViewPages.delete(pageId);

      logger.info('Closed WebView connection', { pageId });
      res.json({ success: true });
    } catch (error) {
      logger.error('Failed to close WebView connection:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to close WebView connection',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

// Get WebView information
router.get(
  '/info/:pageId',
  async (req, res) => {
    try {
      const { pageId } = req.params;
      const page = webViewPages.get(pageId);

      if (!page) {
        return res.status(404).json({
          status: 'error',
          message: 'WebView not found',
        });
      }

      const url = page.url();
      const title = await page.title();
      const viewport = page.viewportSize();

      logger.info('Retrieved WebView information', { pageId, url, title });
      res.json({
        success: true,
        info: {
          url,
          title,
          viewport,
        },
      });
    } catch (error) {
      logger.error('Failed to get WebView information:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get WebView information',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default router;
