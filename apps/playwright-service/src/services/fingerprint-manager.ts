import { Browser, Page } from 'playwright';
import logger from '../utils/logger.js';

interface Fingerprint {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor: number;
  locale: string;
  timezone: string;
  platform: string;
  webGL: {
    vendor: string;
    renderer: string;
  };
}

export class FingerprintManager {
  private static instance: FingerprintManager;
  private readonly userAgents: string[];
  private readonly viewports: Array<{ width: number; height: number }>;
  private readonly locales: string[];
  private readonly timezones: string[];
  private readonly platforms: string[];

  private constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    ];

    this.viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
    ];

    this.locales = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES'];
    this.timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
    this.platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
  }

  public static getInstance(): FingerprintManager {
    if (!FingerprintManager.instance) {
      FingerprintManager.instance = new FingerprintManager();
    }
    return FingerprintManager.instance;
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  public generateFingerprint(): Fingerprint {
    return {
      userAgent: this.getRandomItem(this.userAgents),
      viewport: this.getRandomItem(this.viewports),
      deviceScaleFactor: Math.random() < 0.7 ? 1 : 2,
      locale: this.getRandomItem(this.locales),
      timezone: this.getRandomItem(this.timezones),
      platform: this.getRandomItem(this.platforms),
      webGL: {
        vendor: 'Google Inc. (NVIDIA)',
        renderer: 'ANGLE (NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)',
      },
    };
  }

  public async applyFingerprint(page: Page, fingerprint: Fingerprint): Promise<void> {
    try {
      await page.setViewportSize(fingerprint.viewport);
      await page.setExtraHTTPHeaders({
        'Accept-Language': fingerprint.locale,
      });

      // Override navigator properties
      await page.addInitScript(`
        Object.defineProperties(navigator, {
          platform: { get: () => '${fingerprint.platform}' },
          userAgent: { get: () => '${fingerprint.userAgent}' },
          language: { get: () => '${fingerprint.locale}' },
          languages: { get: () => ['${fingerprint.locale}'] },
        });

        // Override WebGL vendor and renderer
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445) return '${fingerprint.webGL.vendor}';
          if (parameter === 37446) return '${fingerprint.webGL.renderer}';
          return getParameter.apply(this, arguments);
        };
      `);

      logger.info('Successfully applied browser fingerprint', {
        viewport: fingerprint.viewport,
        locale: fingerprint.locale,
        platform: fingerprint.platform,
      });
    } catch (error) {
      logger.error('Failed to apply browser fingerprint:', error);
      throw error;
    }
  }
}
