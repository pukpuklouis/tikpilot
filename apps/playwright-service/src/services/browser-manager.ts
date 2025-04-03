import { Browser, chromium, Page } from 'playwright';
import logger from '../utils/logger.js';

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private page: Page | null = null;

  private constructor() {}

  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
      });
      this.page = await this.browser.newPage();
      logger.info('Browser and page initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  public async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      await this.initialize();
    }
    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }
    return this.browser;
  }

  public async getPage(): Promise<Page> {
    if (!this.page) {
      const browser = await this.getBrowser();
      this.page = await browser.newPage();
    }
    return this.page;
  }

  public async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser and page closed successfully');
    }
  }
}
