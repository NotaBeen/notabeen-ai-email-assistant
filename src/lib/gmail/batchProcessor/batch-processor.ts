// src/lib/gmail/batchProcessor/batch-processor.ts - Refactored Core

import { logger } from "@/utils/logger";
import { GmailMessage } from "../gmail-client";
import { PrecisResult } from "../email-processor";
import {
  MAX_BATCH_SIZE,
  BASE_BATCH_DELAY_MS,
  BASE_EMAIL_DELAY_MS,
  BACKOFF_MULTIPLIER,
  MAX_DELAY_MS,
  USE_BATCH_API,
  CONCURRENT_LIMIT,
} from "./constants";
import { processSingleEmail } from "./email-processor-service";
import { processBatchWithAPI } from "./batch-api-processor";

// Interface remains in the core file as it defines the public contract
interface BatchProcessingResult {
  successful: (GmailMessage & { precis: PrecisResult })[];
  failed: {
    message: GmailMessage;
    error: Error;
    isRateLimit: boolean;
  }[];
  rateLimitInfo?: {
    quotaExceeded: boolean;
    retryAfter?: number;
    quotaMetric?: string;
    quotaLimit?: string;
  };
  adaptiveDelay?: {
    batchDelayMs: number;
    emailDelayMs: number;
  };
}

/**
 * Processes emails individually (fallback method) or when Batch API is disabled/not suitable.
 */
async function processBatchIndividually(
  messages: GmailMessage[],
  emailDelayMs: number,
  emailOwner: string
): Promise<BatchProcessingResult> {
  const result: BatchProcessingResult = {
    successful: [],
    failed: [],
  };

  const groups = [];
  for (let i = 0; i < messages.length; i += CONCURRENT_LIMIT) {
    groups.push(messages.slice(i, i + CONCURRENT_LIMIT));
  }

  logger.info(
    `Processing ${messages.length} emails in ${groups.length} groups (${CONCURRENT_LIMIT} concurrent per group)`
  );

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];

    logger.info(
      `Processing group ${groupIndex + 1}/${groups.length} with ${group.length} emails`
    );

    // processSingleEmail returns a union type that requires narrowing
    const promises = group.map((message) => processSingleEmail(message, emailOwner));
    const results = await Promise.allSettled(promises);

    let hasRateLimit = false;
    results.forEach((promiseResult, index) => {
      if (promiseResult.status === "fulfilled") {
        const value = promiseResult.value; // The union type

        // --- FIXED: Type Narrowing Check ---
        if (value.success) {
          // TypeScript now knows value is { success: true, precis: PrecisResult, ... }
          result.successful.push({ ...value.message, precis: value.precis });
        } else {
          // TypeScript now knows value is { success: false, error: Error, isRateLimit: boolean, ... }
          const { message, error, isRateLimit, retryAfter, quotaInfo } = value;

          result.failed.push({
            message,
            error: error || new Error("Processing failed"),
            isRateLimit: isRateLimit || false,
          });

          // Check if this was a rate limit error
          if (isRateLimit) {
            hasRateLimit = true;
            if (!result.rateLimitInfo) {
              result.rateLimitInfo = {
                quotaExceeded: true,
                retryAfter: retryAfter,
                quotaMetric: quotaInfo?.quotaMetric,
                quotaLimit: quotaInfo?.quotaValue,
              };
            }
          }
        }
      } else {
        // Promise rejected (should be rare with processSingleEmail wrapper)
        result.failed.push({
          message: group[index],
          error: new Error(`Promise rejected: ${promiseResult.reason}`),
          isRateLimit: false,
        });
      }
    });

    // If we hit a rate limit, stop processing further groups
    if (hasRateLimit) {
      logger.warn(
        "Rate limit hit in concurrent processing, stopping further processing"
      );
      break;
    }

    // Add delay between groups to avoid rate limiting
    if (groupIndex < groups.length - 1) {
      logger.info(`Waiting ${emailDelayMs}ms before next group...`);
      await new Promise((resolve) => setTimeout(resolve, emailDelayMs));
    }
  }

  return result;
}

/**
 * Process a single batch of emails using the selected method (API or individual).
 */
async function processBatch(
  messages: GmailMessage[],
  emailDelayMs: number,
  emailOwner: string
): Promise<BatchProcessingResult> {
  // Use batch API if enabled and we have enough messages
  if (USE_BATCH_API && messages.length >= 3) {
    logger.info(`Using Gemini Batch API for ${messages.length} emails`);
    const batchResult = await processBatchWithAPI(messages, emailOwner);

    // If Batch API fails, try falling back to individual processing with a safety delay
    if (batchResult.failed.length > 0 && messages.length > 0 && !batchResult.rateLimitInfo?.quotaExceeded) {
        logger.warn("Batch API failed for some/all messages. Falling back to individual processing with 2000ms delay.");
        return await processBatchIndividually(messages, 2000, emailOwner);
    }
    return batchResult;
  } else {
    logger.info(`Using individual processing for ${messages.length} emails`);
    return await processBatchIndividually(messages, emailDelayMs, emailOwner);
  }
}

/**
 * Main function: Process emails in batches with adaptive backoff to handle rate limits.
 */
export async function processEmailsInBatches(
  messages: GmailMessage[],
  emailOwner: string
): Promise<BatchProcessingResult> {
  let batchDelayMs = BASE_BATCH_DELAY_MS;
  let emailDelayMs = BASE_EMAIL_DELAY_MS;

  const result: BatchProcessingResult = {
    successful: [],
    failed: [],
    adaptiveDelay: {
      batchDelayMs,
      emailDelayMs,
    },
  };

  logger.info(
    `Processing ${messages.length} emails in batches of ${MAX_BATCH_SIZE} with adaptive delays`
  );

  for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
    const batch = messages.slice(i, i + MAX_BATCH_SIZE);
    const batchNumber = Math.floor(i / MAX_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(messages.length / MAX_BATCH_SIZE);
    let shouldBreak = false;

    logger.info(
      `Processing batch ${batchNumber}/${totalBatches} with delays: batch=${batchDelayMs}ms, email=${emailDelayMs}ms`
    );

    try {
      const batchResult = await processBatch(batch, emailDelayMs, emailOwner);

      result.successful.push(...batchResult.successful);
      result.failed.push(...batchResult.failed);

      // --- Adaptive Backoff Logic ---

      if (batchResult.rateLimitInfo?.quotaExceeded) {
        result.rateLimitInfo = batchResult.rateLimitInfo;
        
        // Apply exponential backoff
        batchDelayMs = Math.min(
          MAX_DELAY_MS,
          batchDelayMs * BACKOFF_MULTIPLIER
        );
        emailDelayMs = Math.min(
          MAX_DELAY_MS,
          emailDelayMs * BACKOFF_MULTIPLIER
        );

        logger.warn(
          `Rate limit hit in batch ${batchNumber}. Applying backoff: batch=${batchDelayMs}ms, email=${emailDelayMs}ms. Stopping further processing.`
        );
        shouldBreak = true; // Stop processing further batches
      } else {
        // Reset backoff on successful batch (gradual reduction)
        batchDelayMs = Math.max(
          BASE_BATCH_DELAY_MS,
          Math.floor(batchDelayMs / BACKOFF_MULTIPLIER)
        );
        emailDelayMs = Math.max(
          BASE_EMAIL_DELAY_MS,
          Math.floor(emailDelayMs / BACKOFF_MULTIPLIER)
        );
      }
    } catch (error) {
      logger.error(`Batch ${batchNumber} failed:`, error);
      
      // Apply backoff on general errors too
      batchDelayMs = Math.min(MAX_DELAY_MS, batchDelayMs * BACKOFF_MULTIPLIER);
      emailDelayMs = Math.min(MAX_DELAY_MS, emailDelayMs * BACKOFF_MULTIPLIER);

      // Add all messages in this batch as failed (if not already handled by inner processBatch)
      batch.forEach((message) => {
        if (!result.failed.find(f => f.message.id === message.id)) {
          result.failed.push({
            message,
            error: error as Error,
            isRateLimit: false,
          });
        }
      });
    }

    // Update adaptive delay info
    result.adaptiveDelay = { batchDelayMs, emailDelayMs };
    
    if (shouldBreak) {
        break;
    }

    // Add delay between batches
    if (i + MAX_BATCH_SIZE < messages.length) {
      logger.info(`Waiting ${batchDelayMs}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, batchDelayMs));
    }
  }

  logger.info(
    `Batch processing complete. Successful: ${result.successful.length}, Failed: ${result.failed.length}, Final delays: batch=${batchDelayMs}ms, email=${emailDelayMs}ms`
  );
  return result;
}