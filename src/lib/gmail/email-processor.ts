// src/lib/gmail/email-processor.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateGeminiEmailPrecisPrompt } from "@/app/api/gmail/gemini-api/prompts/geminiEmailPrecisPrompt";
import { logger } from "@/utils/logger";
import { encrypt } from "@/utils/crypto";
import { GmailMessage } from "./gmail-client";
import {
  isEmailProcessed,
  saveEmailAndIncrementCount,
} from "../database/user-db";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { processEmailsInBatches } from "./batch-processor";
import { queueEmails, getQueueStats } from "./email-queue";
import { GoogleGenAI } from "@google/genai";

const loggingEnabled = true;
const MAX_TOKENS_PER_EMAIL = 100000;

// Rate limiting and retry configuration
const GEMINI_RATE_LIMITS = {
  FREE_TIER_REQUESTS_PER_MINUTE: 15,
  RETRY_DELAY_BASE_MS: 1000,
  MAX_RETRY_DELAY_MS: 60000,
  MAX_RETRIES: 3,
};

// Enhanced error types for better handling
interface GeminiRateLimitError extends Error {
  status: number;
  retryAfter?: number;
  quotaInfo?: {
    quotaMetric: string;
    quotaValue: string;
    retryDelay: string;
  };
}

export interface PrecisResult {
  summary: string;
  urgencyScore: number;
  action: string;
  classification?: string;
  keywords?: string[];
  extractedEntities?: {
    senderName: string;
    recipientNames: string[];
    subjectTerms: string[];
    date: string;
    attachmentNames: string[];
    snippet: string;
  } | null;
}

// Enhanced error handling for Gemini API responses
function parseGeminiError(response: Response, errorText: string): GeminiRateLimitError | Error {
  try {
    const errorData = JSON.parse(errorText);

    if (response.status === 429 && errorData.error) {
      const rateLimitError: GeminiRateLimitError = new Error(errorData.error.message || 'Rate limit exceeded') as GeminiRateLimitError;
      rateLimitError.status = response.status;

      // Extract retry delay from response
      const retryInfo = errorData.error.details?.find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
      if (retryInfo?.retryDelay) {
        const delayMatch = retryInfo.retryDelay.match(/(\d+\.?\d*)s/);
        if (delayMatch) {
          rateLimitError.retryAfter = parseFloat(delayMatch[1]) * 1000;
        }
      }

      // Extract quota information
      const quotaFailure = errorData.error.details?.find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure');
      if (quotaFailure?.violations?.[0]) {
        rateLimitError.quotaInfo = {
          quotaMetric: quotaFailure.violations[0].quotaMetric || 'unknown',
          quotaValue: quotaFailure.violations[0].quotaValue || 'unknown',
          retryDelay: retryInfo?.retryDelay || 'unknown'
        };
      }

      return rateLimitError;
    }

    return new Error(errorData.error?.message || `Gemini API failed with status ${response.status}`);
  } catch (e) {
    return new Error(`Gemini API failed with status ${response.status}: ${errorText}`);
  }
}

// Exponential backoff retry function
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = GEMINI_RATE_LIMITS.MAX_RETRIES,
  baseDelay: number = GEMINI_RATE_LIMITS.RETRY_DELAY_BASE_MS,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Check if this is a retryable error
      if ('status' in error && (error.status === 429 || error.status === 503)) {
        const rateLimitError = error as GeminiRateLimitError;
        let delayMs = baseDelay * Math.pow(2, attempt);

        // Use retry-after if available, otherwise use calculated delay
        if (rateLimitError.retryAfter) {
          delayMs = Math.min(rateLimitError.retryAfter, GEMINI_RATE_LIMITS.MAX_RETRY_DELAY_MS);
        } else {
          delayMs = Math.min(delayMs, GEMINI_RATE_LIMITS.MAX_RETRY_DELAY_MS);
        }

        logger.warn(`Gemini API rate limited, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})`);

        // Add user-friendly quota information if available
        if (rateLimitError.quotaInfo) {
          logger.info(`Quota info: ${rateLimitError.quotaInfo.quotaMetric} limit: ${rateLimitError.quotaInfo.quotaValue}`);
        }

        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // Non-retryable error, don't retry
        break;
      }
    }
  }

  throw lastError!;
}

// Re-implement the adaptive concurrency helper here for processing
async function fetchWithAdaptiveConcurrency<T, R>(
  items: T[],
  initialConcurrency: number,
  fn: (item: T) => Promise<R | null>,
): Promise<{ results: R[]; errors: { item: T; error: Error }[] }> {
  let concurrency = Math.min(initialConcurrency, GEMINI_RATE_LIMITS.FREE_TIER_REQUESTS_PER_MINUTE);
  const results: (R | null)[] = new Array(items.length).fill(null);
  const errors: { item: T; error: Error }[] = [];
  let index = 0;
  const maxIndex = items.length;

  async function worker() {
    while (true) {
      let currentIndex: number;
      if (index < maxIndex) {
        currentIndex = index++;
      } else {
        break;
      }

      try {
        results[currentIndex] = await fn(items[currentIndex]);
      } catch (error: any) {
        if (error.status === 429) {
          // For rate limits, reduce concurrency more aggressively and wait longer
          concurrency = Math.max(1, Math.floor(concurrency / 2));
          const waitTime = error.retryAfter || 30000; // Default to 30 seconds
          logger.warn(
            `Rate limit hit. Concurrency reduced to ${concurrency}. Waiting ${waitTime}ms before retrying...`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          index = currentIndex; // Decrement index to reprocess this item
        } else {
          results[currentIndex] = null;
          errors.push({ item: items[currentIndex], error });
          logger.error(
            `Error processing email at index ${currentIndex}:`,
            error,
          );
        }
      }
    }
  }

  const workers = Array(concurrency)
    .fill(null)
    .map(() => worker());
  await Promise.all(workers);

  return {
    results: results.filter((item): item is R => item !== null),
    errors
  };
}

// --- Core Processing Functions ---

/**
 * Filters a list of fetched Gmail messages, keeping only those not already in the database.
 */
export async function filterNewMessages(
  messages: GmailMessage[],
): Promise<GmailMessage[]> {
  try {
    if (loggingEnabled) {
      logger.info(`Filtering ${messages.length} messages for new ones...`);
    }
    const filteredMessages = await Promise.all(
      messages.map(async (message) => {
        if (!message || !message.id) return null;
        const exists = await isEmailProcessed(message.id);
        return exists ? null : message;
      }),
    );
    const newMessages = filteredMessages.filter(Boolean) as GmailMessage[];
    if (loggingEnabled) {
      logger.info(`Found ${newMessages.length} new messages.`);
    }
    return newMessages;
  } catch (error) {
    logger.error("Error filtering new messages from the database.", error);
    throw new Error("Error filtering new messages from the database");
  }
}

/**
 * Generates a precis for all new messages and saves them to the database.
 * Uses queue-based processing for large volumes to respect rate limits.
 */
export async function generatePrecisForNewMessages(
  messages: GmailMessage[],
): Promise<{
  processedMessages: (GmailMessage & { precis: PrecisResult })[];
  errors: {
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
  queueStats?: {
    total: number;
    pending: number;
    processing: number;
    averageWaitTime: number;
  };
}> {
  try {
    if (loggingEnabled) {
      logger.info(
        `Starting précis generation for ${messages.length} messages...`,
      );
    }

    // For small batches, use direct processing
    if (messages.length <= 4) {
      logger.info(`Small batch (${messages.length} emails), using direct processing`);
      const batchResult = await processEmailsInBatches(messages);

      const processedErrors = batchResult.failed.map(({ message, error, isRateLimit }) => ({
        message,
        error,
        isRateLimit
      }));

      if (loggingEnabled) {
        logger.info(
          `Completed précis generation using direct processing. Successfully processed: ${batchResult.successful.length}, Errors: ${processedErrors.length}`
        );
      }

      return {
        processedMessages: batchResult.successful,
        errors: processedErrors,
        rateLimitInfo: batchResult.rateLimitInfo
      };
    }

    // For larger batches, queue them for background processing
    logger.info(`Large batch (${messages.length} emails), adding to processing queue`);
    const queueResult = await queueEmails(messages);
    const stats = getQueueStats();

    if (loggingEnabled) {
      logger.info(
        `Added ${queueResult.accepted} emails to queue, rejected ${queueResult.rejected}. Queue size: ${stats.total}`
      );
    }

    return {
      processedMessages: [], // No immediate processing for large batches
      errors: messages.slice(0, queueResult.rejected).map(message => ({
        message,
        error: new Error('Queue full - email rejected'),
        isRateLimit: false
      })),
      queueStats: stats
    };
  } catch (error) {
    logger.error("Error generating précis for new messages:", error);
    throw new Error("Error generating précis for new messages");
  }
}

// --- Sub-functions for Precis Generation and Saving ---

function countTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

/**
 * Internal function to generate précis from Gemini, save to DB, and return result.
 */
async function generateAndSavePrecis(
  message: GmailMessage,
): Promise<PrecisResult | null> {
  const session = await auth();
  if (!session || !session.user?.id) {
    logger.error("Attempted précis generation without valid session.");
    return null;
  }
  const emailOwner = session.user.id;

  if (loggingEnabled) {
    logger.info(`Starting précis for email: ${message.id}`);
  }

  const tokenCount = countTokens(message.body);
  if (tokenCount > MAX_TOKENS_PER_EMAIL) {
    logger.warn(
      `Email ${message.id} exceeds token limit. Count: ${tokenCount}.`,
    );
    return null; // Skip this email
  }

  const formattedDate =
    message.dateReceived instanceof Date &&
    !isNaN(message.dateReceived.getTime())
      ? message.dateReceived.toISOString().split("T")[0]
      : "unknown date";

  const contentToSend = generateGeminiEmailPrecisPrompt({
    sender: message.sender,
    recipients: message.recipients.join(", ") || "none",
    unsubscribeLinkPresent: message.unsubscribeLink ? "Yes" : "No",
    attachmentNames: message.attachmentNames?.join(", ") || "none",
    formattedDate,
    text: message.body,
  });

  const response = await retryWithBackoff(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contentToSend,
      });
      return result;
    } catch (error: any) {
      logger.error(
        `Gemini SDK failed for email ${message.id}. Error:`, error,
      );

      // Convert SDK errors to our expected format
      const errorObj = error as Error & {
        status?: number;
        retryAfter?: number;
        quotaInfo?: { quotaMetric?: string; quotaValue?: string };
      };

      // Check for rate limit errors in SDK responses
      if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        errorObj.status = 429;

        // Try to extract retry information from error message
        const retryMatch = error.message.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|s)/i);
        if (retryMatch) {
          errorObj.retryAfter = parseFloat(retryMatch[1]) * 1000;
        }

        // Try to extract quota information
        const quotaMatch = error.message.match(/quota.*?(\w+)/i);
        if (quotaMatch) {
          errorObj.quotaInfo = {
            quotaMetric: 'unknown',
            quotaValue: quotaMatch[1]
          };
        }
      }

      throw errorObj;
    }
  });

  const content = response.text; // --- Parsing Logic (Simplified) ---

  const summaryMatch = content.match(
    /\s*Summary:\s*([\s\S]*?)(?=\n\s*Urgency Score:|$)/,
  );
  const urgencyScoreMatch = content.match(/\s*Urgency Score:\s*(\d+)/);
  const actionMatch = content.match(
    /\s*Action:\s*([\s\S]*?)(?=\n\s*Classification:|$)/,
  );
  const classificationMatch = content.match(/\s*Classification:\s*(\w+)/);
  const keywordsMatch = content.match(
    /\s*Keywords:\s*([\s\S]*?)(?=\n\s*ExtractedEntities:|$)/,
  );
  const extractedEntitiesMatch = content.match(
    /\s*ExtractedEntities:\s*(\{[\s\S]*?\})/,
  );

  const precisResult: PrecisResult = {
    summary: summaryMatch ? summaryMatch[1].trim() : "",
    urgencyScore: urgencyScoreMatch
      ? parseInt(urgencyScoreMatch[1].trim(), 10)
      : 0,
    action: actionMatch ? actionMatch[1].trim() : "",
    classification: classificationMatch
      ? classificationMatch[1].trim()
      : "Uncategorized",
    keywords: keywordsMatch
      ? keywordsMatch[1]
          .trim()
          .split(",")
          .map((k: string) => k.trim())
      : [],
    extractedEntities: parseExtractedEntities(
      message.id,
      extractedEntitiesMatch ? extractedEntitiesMatch[1] : null,
    ),
  }; // --- Saving Logic ---

  await saveProcessedEmail(message, precisResult, emailOwner);

  return precisResult;
}

/**
 * Handles the robust JSON parsing logic for ExtractedEntities.
 */
function parseExtractedEntities(
  emailId: string,
  rawJsonString: string | null,
): PrecisResult["extractedEntities"] {
  if (!rawJsonString) return null;

  let cleanedJsonString = rawJsonString;

  try {
    // Clean up single quotes and newlines
    cleanedJsonString = cleanedJsonString.replace(/'/g, '"');
    cleanedJsonString = cleanedJsonString.replace(/[\r\n\t]/g, ""); // Remove trailing commas before the closing brace/bracket
    cleanedJsonString = cleanedJsonString.replace(/,\s*([}\]])/g, "$1"); // Robustly escape double quotes inside string values (like 'snippet')

    cleanedJsonString = cleanedJsonString.replace(
      /("snippet":\s*)"(.*?)"(\s*,\s*\"[^\"]+\":\s*\[.*?\]|\s*,\s*\"[^\"]+\":\s*\".*?\"|\s*})$/,
      (_match: string, prefix: string, value: string, suffix: string) => {
        // Escape non-escaped double quotes in the value
        const escapedValue = value.replace(/"/g, '\\"');
        return `${prefix}"${escapedValue}"${suffix}`;
      },
    );

    const parsedData = JSON.parse(cleanedJsonString); // Basic structure validation (can be more rigorous)

    if (
      typeof parsedData === "object" &&
      parsedData !== null &&
      "senderName" in parsedData
    ) {
      return {
        senderName: String(parsedData.senderName || ""),
        date: String(parsedData.date || ""),
        snippet: String(parsedData.snippet || ""),
        recipientNames: Array.isArray(parsedData.recipientNames)
          ? parsedData.recipientNames
              .map((s: any) => String(s).trim())
              .filter(Boolean)
          : [],
        subjectTerms: Array.isArray(parsedData.subjectTerms)
          ? parsedData.subjectTerms
              .map((s: any) => String(s).trim())
              .filter(Boolean)
          : [],
        attachmentNames: Array.isArray(parsedData.attachmentNames)
          ? parsedData.attachmentNames
              .map((s: any) => String(s).trim())
              .filter(Boolean)
          : [],
      };
    } else {
      logger.warn(
        `Parsed JSON for email ${emailId} does not match expected ExtractedEntities structure.`,
      );
      return null;
    }
  } catch (e) {
    logger.error(
      `Error parsing ExtractedEntities JSON for email ${emailId}. Malformed string: ${cleanedJsonString}`,
      e,
    );
    return null;
  }
}

/**
 * Encrypts and saves the processed email data to the MongoDB 'emails' collection.
 */
async function saveProcessedEmail(
  message: GmailMessage,
  precis: PrecisResult,
  emailOwner: string,
): Promise<void> {
  const {
    id: emailId,
    sender,
    dateReceived,
    subject,
    emailUrl,
    recipients,
    unsubscribeLink,
  } = message;
  const {
    summary,
    urgencyScore,
    action,
    classification,
    keywords,
    extractedEntities,
  } = precis;

  const encryptedSender = encrypt(sender);
  const encryptedSubject = encrypt(subject);
  const encryptedEmailUrl = encrypt(emailUrl);
  const encryptedSummary = encrypt(summary);
  const encryptedUrgencyScore = encrypt(urgencyScore.toString());
  const encryptedAction = encrypt(action);

  const encryptedRecipients = encrypt(JSON.stringify(recipients));
  let encryptedUnsubscribeLink = null;
  let unsubscribeLinkAuthTag = null;
  if (unsubscribeLink) {
    const encryptedLink = encrypt(unsubscribeLink);
    encryptedUnsubscribeLink = encryptedLink.encryptedData;
    unsubscribeLinkAuthTag = encryptedLink.authTag;
  }

  let encryptedClassification = null;
  let classificationAuthTag = null;
  if (classification) {
    const encryptedClass = encrypt(classification);
    encryptedClassification = encryptedClass.encryptedData;
    classificationAuthTag = encryptedClass.authTag;
  }

  let encryptedKeywords = null;
  let keywordsAuthTag = null;
  if (keywords && keywords.length > 0) {
    const encryptedKw = encrypt(keywords.join(", "));
    encryptedKeywords = encryptedKw.encryptedData;
    keywordsAuthTag = encryptedKw.authTag;
  }

  let encryptedExtractedEntities = null;
  let extractedEntitiesAuthTag = null;
  if (extractedEntities) {
    const encryptedEe = encrypt(JSON.stringify(extractedEntities));
    encryptedExtractedEntities = encryptedEe.encryptedData;
    extractedEntitiesAuthTag = encryptedEe.authTag;
  }

  const parsedDate = new Date(dateReceived);
  const safeDateReceived = isNaN(parsedDate.getTime())
    ? new Date()
    : parsedDate;

  // Import ObjectId at the top of the file if not already imported:
  // import { ObjectId } from "mongodb";

  const emailDocument = {
    provider: "gmail",
    emailOwner, // NextAuth User ID (MongoDB ObjectId string)
    userId: new ObjectId(emailOwner), // Add userId as required by EmailDocument interface
    emailId,
    sender: encryptedSender.encryptedData,
    senderAuthTag: encryptedSender.authTag,
    dateReceived: safeDateReceived,
    subject: encryptedSubject.encryptedData,
    emailUrl: encryptedEmailUrl.encryptedData,
    emailUrlAuthTag: encryptedEmailUrl.authTag,
    subjectAuthTag: encryptedSubject.authTag,
    summary: encryptedSummary.encryptedData,
    summaryAuthTag: encryptedSummary.authTag,
    urgencyScore: encryptedUrgencyScore.encryptedData,
    urgencyScoreAuthTag: encryptedUrgencyScore.authTag,
    action: encryptedAction.encryptedData,
    actionAuthTag: encryptedAction.authTag,
    recipients: encryptedRecipients.encryptedData,
    recipientsAuthTag: encryptedRecipients.authTag,
    unsubscribeLink: encryptedUnsubscribeLink,
    unsubscribeLinkAuthTag: unsubscribeLinkAuthTag,
    classification: encryptedClassification,
    classificationAuthTag: classificationAuthTag,
    keywords: encryptedKeywords,
    keywordsAuthTag: keywordsAuthTag,
    extractedEntities: encryptedExtractedEntities,
    extractedEntitiesAuthTag: extractedEntitiesAuthTag,
    received_at: new Date(),
    read: false,
    processed_at: new Date(),
  };

  await saveEmailAndIncrementCount(emailDocument, emailOwner);
  if (loggingEnabled) {
    logger.info(`Successfully saved email ${emailId} to the database.`);
  }
}
