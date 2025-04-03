import app from './app.js';
import config from './config/index.js';
import { BrowserManager } from './services/browser-manager.js';
import logger from './utils/logger.js';

const port = 3001; // Changed port to avoid conflict

async function startServer() {
  try {
    // Initialize browser instance
    await BrowserManager.getInstance().initialize();

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
