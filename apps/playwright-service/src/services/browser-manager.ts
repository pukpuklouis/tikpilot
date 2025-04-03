import { Browser, chromium, Page, BrowserContext } from 'playwright';
import logger from '../utils/logger.js';
import { FingerprintManager } from './fingerprint-manager.js';

export interface WebViewOptions {
  url: string;
  useFingerprinting?: boolean;
}

class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private context: BrowserContext | null = null;
  private fingerprintManager: FingerprintManager;

  private constructor() {
    this.fingerprintManager = FingerprintManager.getInstance();
  }

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
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();
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

  public async getContext(): Promise<BrowserContext> {
    if (!this.context) {
      const browser = await this.getBrowser();
      this.context = await browser.newContext();
    }
    return this.context;
  }

  public async getPage(): Promise<Page> {
    if (!this.page) {
      const context = await this.getContext();
      this.page = await context.newPage();
    }
    return this.page;
  }

  public async createWebViewConnection({ url, useFingerprinting = true }: WebViewOptions): Promise<Page> {
    try {
      const context = await this.getContext();
      const page = await context.newPage();

      if (useFingerprinting) {
        const fingerprint = this.fingerprintManager.generateFingerprint();
        await this.fingerprintManager.applyFingerprint(page, fingerprint);
        logger.info('Applied fingerprint to WebView', { fingerprint });
      }

      await page.goto(url);
      logger.info('Successfully created WebView connection', { url });
      return page;
    } catch (error) {
      logger.error('Failed to create WebView connection:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export { BrowserManager };
