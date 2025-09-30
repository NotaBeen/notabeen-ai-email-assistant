// src/lib/gmail/email-queue.ts

import { logger } from "@/utils/logger";
import { GmailMessage } from "./gmail-client";
import { processEmailsInBatches } from "./batch-processor";

/**
 * Queue-based email processing system for handling large volumes of emails
 * over extended periods while respecting API rate limits
 */

interface QueuedEmail extends GmailMessage {
  id: string;
  addedAt: Date;
  retryCount: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  priority: 'high' | 'medium' | 'low';
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
}

class EmailProcessingQueue {
  private queue: Map<string, QueuedEmail> = new Map();
  private processing = false;
  private isShuttingDown = false;
  private processingTimer?: NodeJS.Timeout;
  private statsInterval?: NodeJS.Timeout;

  // Queue configuration
  private readonly MAX_RETRIES = 3;
  private readonly BASE_RETRY_DELAY = 60000; // 1 minute
  private readonly MAX_RETRY_DELAY = 300000; // 5 minutes
  private readonly PROCESSING_INTERVAL = 5000; // Process every 5 seconds for faster queue clearing
  private readonly STATS_INTERVAL = 60000; // Update stats every minute
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly BATCH_SIZE = 5; // Process 5 emails at a time for faster queue clearing

  constructor() {
    this.startProcessing();
    this.startStatsReporting();
  }

  /**
   * Add emails to the processing queue
   */
  async addEmails(messages: GmailMessage[]): Promise<{ accepted: number; rejected: number }> {
    let accepted = 0;
    let rejected = 0;

    for (const message of messages) {
      if (this.queue.size >= this.MAX_QUEUE_SIZE) {
        logger.warn(`Queue is full (${this.MAX_QUEUE_SIZE} emails). Rejecting new emails.`);
        rejected++;
        continue;
      }

      if (this.queue.has(message.id)) {
        logger.debug(`Email ${message.id} already in queue. Skipping.`);
        continue;
      }

      const queuedEmail: QueuedEmail = {
        ...message,
        addedAt: new Date(),
        retryCount: 0,
        priority: this.calculatePriority(message)
      };

      this.queue.set(message.id, queuedEmail);
      accepted++;
    }

    logger.info(`Added ${accepted} emails to queue. Rejected ${rejected} due to capacity limits.`);
    this.logStats();

    return { accepted, rejected };
  }

  /**
   * Calculate processing priority based on email characteristics
   */
  private calculatePriority(message: GmailMessage): 'high' | 'medium' | 'low' {
    // High priority: recent emails (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (message.dateReceived > oneDayAgo) {
      return 'high';
    }

    // Medium priority: emails from last week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (message.dateReceived > oneWeekAgo) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Start the background processing loop
   */
  private startProcessing(): void {
    if (this.processing) {
      return;
    }

    this.processing = true;
    logger.info('Starting email queue processing...');

    const processLoop = async () => {
      if (this.isShuttingDown) {
        return;
      }

      try {
        await this.processBatch();
      } catch (error) {
        logger.error('Error in queue processing loop:', error);
      }

      // Schedule next processing
      this.processingTimer = setTimeout(processLoop, this.PROCESSING_INTERVAL);
    };

    // Start the loop
    processLoop();
  }

  /**
   * Process a batch of emails from the queue
   */
  private async processBatch(): Promise<void> {
    const readyEmails = this.getReadyEmails();
    if (readyEmails.length === 0) {
      return;
    }

    // Limit batch size and sort by priority
    const emailsToProcess = readyEmails
      .slice(0, this.BATCH_SIZE)
      .sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a));

    logger.info(`Processing batch of ${emailsToProcess.length} emails from queue`);

    for (const queuedEmail of emailsToProcess) {
      queuedEmail.lastAttemptAt = new Date();
    }

    try {
      const result = await processEmailsInBatches(emailsToProcess);

      // Handle successful processing
      for (const successful of result.successful) {
        this.queue.delete(successful.id);
      }

      // Handle failed processing
      for (const { message, error, isRateLimit } of result.failed) {
        this.handleFailedEmail(message as QueuedEmail, error, isRateLimit);
      }

      logger.info(`Batch processing complete: ${result.successful.length} successful, ${result.failed.length} failed`);

    } catch (error) {
      logger.error('Batch processing failed:', error);

      // Mark all emails in batch as failed
      for (const queuedEmail of emailsToProcess) {
        this.handleFailedEmail(queuedEmail, error as Error, false);
      }
    }
  }

  /**
   * Get emails that are ready for processing
   */
  private getReadyEmails(): QueuedEmail[] {
    const now = new Date();
    return Array.from(this.queue.values()).filter(email =>
      !email.nextRetryAt || email.nextRetryAt <= now
    );
  }

  /**
   * Get numeric score for priority sorting
   */
  private getPriorityScore(email: QueuedEmail): number {
    switch (email.priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  /**
   * Handle failed email processing
   */
  private handleFailedEmail(email: QueuedEmail, error: Error, isRateLimit: boolean): void {
    email.retryCount++;

    if (email.retryCount >= this.MAX_RETRIES) {
      logger.error(`Email ${email.id} failed after ${email.retryCount} attempts. Removing from queue.`, error);
      this.queue.delete(email.id);
      return;
    }

    // Calculate next retry time with exponential backoff
    let retryDelay = this.BASE_RETRY_DELAY * Math.pow(2, email.retryCount - 1);

    // If rate limit, use longer delay
    if (isRateLimit) {
      retryDelay = Math.max(retryDelay, 5 * 60 * 1000); // At least 5 minutes for rate limits
    }

    retryDelay = Math.min(retryDelay, this.MAX_RETRY_DELAY);

    email.nextRetryAt = new Date(Date.now() + retryDelay);

    logger.warn(`Email ${email.id} failed (attempt ${email.retryCount}/${this.MAX_RETRIES}). Retrying in ${Math.round(retryDelay / 1000)} seconds.`);
  }

  /**
   * Start periodic statistics reporting
   */
  private startStatsReporting(): void {
    this.statsInterval = setInterval(() => {
      this.logStats();
    }, this.STATS_INTERVAL);
  }

  /**
   * Log current queue statistics
   */
  private logStats(): void {
    const stats = this.getStats();
    logger.info(`Queue stats: Total: ${stats.total}, Pending: ${stats.pending}, Processing: ${stats.processing}, Completed: ${stats.completed}, Failed: ${stats.failed}, Avg wait: ${Math.round(stats.averageWaitTime / 1000)}s`);
  }

  /**
   * Get current queue statistics
   */
  getStats(): QueueStats {
    const now = new Date();
    const emails = Array.from(this.queue.values());

    const pending = emails.filter(e => !e.lastAttemptAt).length;
    const processing = emails.filter(e => e.lastAttemptAt && !e.nextRetryAt).length;

    const totalWaitTime = emails.reduce((sum, email) => {
      return sum + (now.getTime() - email.addedAt.getTime());
    }, 0);

    return {
      total: emails.length,
      pending,
      processing,
      completed: 0, // We don't track completed separately since they're removed from queue
      failed: 0, // We don't track failed separately since they're removed from queue
      averageWaitTime: emails.length > 0 ? totalWaitTime / emails.length : 0
    };
  }

  /**
   * Gracefully shutdown the queue
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down email processing queue...');
    this.isShuttingDown = true;

    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    this.processing = false;
    logger.info('Email processing queue shutdown complete.');
  }

  /**
   * Clear the queue (useful for testing or manual intervention)
   */
  clearQueue(): number {
    const size = this.queue.size;
    this.queue.clear();
    logger.info(`Cleared ${size} emails from queue.`);
    return size;
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.size;
  }

  /**
   * Check if queue is full
   */
  isFull(): boolean {
    return this.queue.size >= this.MAX_QUEUE_SIZE;
  }
}

// Singleton instance
let emailQueue: EmailProcessingQueue | null = null;

/**
 * Get or create the email processing queue singleton
 */
export function getEmailQueue(): EmailProcessingQueue {
  if (!emailQueue) {
    emailQueue = new EmailProcessingQueue();
  }
  return emailQueue;
}

/**
 * Initialize the email queue (call this during application startup)
 */
export function initializeEmailQueue(): EmailProcessingQueue {
  return getEmailQueue();
}

/**
 * Add emails to the processing queue
 */
export async function queueEmails(messages: GmailMessage[]): Promise<{ accepted: number; rejected: number }> {
  const queue = getEmailQueue();
  return await queue.addEmails(messages);
}

/**
 * Get queue statistics
 */
export function getQueueStats(): QueueStats {
  const queue = getEmailQueue();
  return queue.getStats();
}

/**
 * Shutdown the email queue (call this during application shutdown)
 */
export async function shutdownEmailQueue(): Promise<void> {
  if (emailQueue) {
    await emailQueue.shutdown();
    emailQueue = null;
  }
}