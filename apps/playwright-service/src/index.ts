import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import BrowserManager from './services/browser-manager.js';

const startServer = async (): Promise<void> => {
  try {
    // Initialize browser manager
    await BrowserManager.getInstance().initialize();

    // Start the server
    app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async (): Promise<void> => {
      logger.info('Shutting down server...');
      await BrowserManager.getInstance().close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
