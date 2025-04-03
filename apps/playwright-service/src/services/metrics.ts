import client from 'prom-client';
import logger from '../utils/logger.js';

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const browserActionsCounter = new client.Counter({
  name: 'playwright_browser_actions_total',
  help: 'Total number of browser actions performed',
  labelNames: ['action_type'],
});

const browserActionDuration = new client.Histogram({
  name: 'playwright_browser_action_duration_seconds',
  help: 'Duration of browser actions in seconds',
  labelNames: ['action_type'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const activeWebViews = new client.Gauge({
  name: 'playwright_active_webviews',
  help: 'Number of active WebView connections',
});

// Register custom metrics
register.registerMetric(browserActionsCounter);
register.registerMetric(browserActionDuration);
register.registerMetric(activeWebViews);

export const metrics = {
  register,
  browserActionsCounter,
  browserActionDuration,
  activeWebViews,
  
  // Helper function to measure action duration
  async measureActionDuration<T>(actionType: string, action: () => Promise<T>): Promise<T> {
    const end = browserActionDuration.startTimer({ action_type: actionType });
    try {
      const result = await action();
      browserActionsCounter.inc({ action_type: actionType });
      return result;
    } finally {
      end();
    }
  },

  // Update WebView count
  updateWebViewCount(count: number): void {
    activeWebViews.set(count);
    logger.debug('Updated active WebView count', { count });
  },
};
