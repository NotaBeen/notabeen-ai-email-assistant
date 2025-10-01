// src/lib/startup.ts

import { initializeEmailQueue, shutdownEmailQueue } from "./gmail/email-queue";
import { logger } from "@/utils/logger";

/**
 * Application startup initialization
 * This should be called when the application starts
 */
export async function initializeApplication(): Promise<void> {
  try {
    logger.info("Initializing application services...");

    // Initialize the email processing queue
    initializeEmailQueue();
    logger.info("Email processing queue initialized");

    logger.info("Application initialization complete");
  } catch (error) {
    logger.error("Failed to initialize application:", error);
    throw error;
  }
}

/**
 * Application shutdown cleanup
 * This should be called when the application is shutting down
 */
export async function shutdownApplication(): Promise<void> {
  try {
    logger.info("Shutting down application services...");

    // Shutdown the email processing queue
    await shutdownEmailQueue();
    logger.info("Email processing queue shutdown complete");

    logger.info("Application shutdown complete");
  } catch (error) {
    logger.error("Error during application shutdown:", error);
  }
}

// Process cleanup for graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await shutdownApplication();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await shutdownApplication();
    process.exit(0);
  });
}