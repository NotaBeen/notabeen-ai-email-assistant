// src/lib/gmail/batch-processor.ts

import { logger } from "@/utils/logger";
import { generateGeminiEmailPrecisPrompt } from "@/app/api/gmail/gemini-api/prompts/geminiEmailPrecisPrompt";
import { encrypt } from "@/utils/crypto";
import { GmailMessage } from "./gmail-client";
import { PrecisResult } from "./email-processor";
import { ObjectId } from "mongodb";
import { saveEmailAndIncrementCount } from "../database/user-db";
import { auth } from "@/auth";
import { GoogleGenAI } from "@google/genai";

const MAX_BATCH_SIZE = 5; // Optimized for concurrent processing without overwhelming rate limits
const BASE_BATCH_DELAY_MS = 1000; // Reduced delay between batches (1 second)
const BASE_EMAIL_DELAY_MS = 500; // Reduced delay between individual emails in batch
const BACKOFF_MULTIPLIER = 2; // Multiplier for backoff when rate limits are hit
const MAX_DELAY_MS = 60000; // Maximum delay (1 minute)
const USE_BATCH_API = false; // Disable batch API - requires GCS setup, not suitable for real-time queue processing

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
 * Process emails in batches to better handle rate limits
 */
export async function processEmailsInBatches(
  messages: GmailMessage[],
): Promise<BatchProcessingResult> {
  let batchDelayMs = BASE_BATCH_DELAY_MS;
  let emailDelayMs = BASE_EMAIL_DELAY_MS;
  let consecutiveRateLimits = 0;

  const result: BatchProcessingResult = {
    successful: [],
    failed: [],
    adaptiveDelay: {
      batchDelayMs,
      emailDelayMs
    }
  };

  logger.info(`Processing ${messages.length} emails in batches of ${MAX_BATCH_SIZE} with adaptive delays`);

  for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
    const batch = messages.slice(i, i + MAX_BATCH_SIZE);
    const batchNumber = Math.floor(i / MAX_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(messages.length / MAX_BATCH_SIZE);

    logger.info(`Processing batch ${batchNumber}/${totalBatches} with delays: batch=${batchDelayMs}ms, email=${emailDelayMs}ms`);

    try {
      const batchResult = await processBatch(batch, emailDelayMs);

      result.successful.push(...batchResult.successful);
      result.failed.push(...batchResult.failed);

      // Reset backoff on successful batch
      if (!batchResult.rateLimitInfo?.quotaExceeded) {
        consecutiveRateLimits = 0;
        batchDelayMs = Math.max(BASE_BATCH_DELAY_MS, Math.floor(batchDelayMs / BACKOFF_MULTIPLIER));
        emailDelayMs = Math.max(BASE_EMAIL_DELAY_MS, Math.floor(emailDelayMs / BACKOFF_MULTIPLIER));
      }

      // If we hit rate limits, update the result and apply backoff
      if (batchResult.rateLimitInfo?.quotaExceeded) {
        result.rateLimitInfo = batchResult.rateLimitInfo;
        consecutiveRateLimits++;

        // Apply exponential backoff
        batchDelayMs = Math.min(MAX_DELAY_MS, batchDelayMs * BACKOFF_MULTIPLIER);
        emailDelayMs = Math.min(MAX_DELAY_MS, emailDelayMs * BACKOFF_MULTIPLIER);

        logger.warn(`Rate limit hit in batch ${batchNumber}. Applying backoff: batch=${batchDelayMs}ms, email=${emailDelayMs}ms. Stopping further processing.`);
        break;
      }

      // Update adaptive delay info
      result.adaptiveDelay = { batchDelayMs, emailDelayMs };

      // Add delay between batches to avoid rate limits
      if (i + MAX_BATCH_SIZE < messages.length) {
        logger.info(`Waiting ${batchDelayMs}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, batchDelayMs));
      }

    } catch (error) {
      logger.error(`Batch ${batchNumber} failed:`, error);

      // Apply backoff on general errors too
      consecutiveRateLimits++;
      batchDelayMs = Math.min(MAX_DELAY_MS, batchDelayMs * BACKOFF_MULTIPLIER);
      emailDelayMs = Math.min(MAX_DELAY_MS, emailDelayMs * BACKOFF_MULTIPLIER);

      // Add all messages in this batch as failed
      batch.forEach(message => {
        result.failed.push({
          message,
          error: error as Error,
          isRateLimit: false
        });
      });

      // Update adaptive delay info
      result.adaptiveDelay = { batchDelayMs, emailDelayMs };

      // Add delay between batches even after errors
      if (i + MAX_BATCH_SIZE < messages.length) {
        logger.info(`Waiting ${batchDelayMs}ms before next batch due to error...`);
        await new Promise(resolve => setTimeout(resolve, batchDelayMs));
      }
    }
  }

  logger.info(`Batch processing complete. Successful: ${result.successful.length}, Failed: ${result.failed.length}, Final delays: batch=${batchDelayMs}ms, email=${emailDelayMs}ms`);
  return result;
}

/**
 * Process a single batch of emails using Gemini Batch API
 */
async function processBatchWithAPI(
  messages: GmailMessage[],
): Promise<BatchProcessingResult> {
  const result: BatchProcessingResult = {
    successful: [],
    failed: []
  };

  const session = await auth();
  if (!session || !session.user?.id) {
    logger.error("Attempted batch processing without valid session.");
    messages.forEach(message => {
      result.failed.push({
        message,
        error: new Error("No valid session"),
        isRateLimit: false
      });
    });
    return result;
  }
  const emailOwner = session.user.id;

  // Prepare batch requests
  const batchRequests = messages.map(message => {
    const formattedDate = message.dateReceived instanceof Date && !isNaN(message.dateReceived.getTime())
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

    return {
      contents: [{ parts: [{ text: contentToSend }] }],
      // Store email metadata for later processing
      _emailMetadata: {
        id: message.id,
        sender: message.sender,
        dateReceived: message.dateReceived,
        subject: message.subject,
        emailUrl: message.emailUrl,
        recipients: message.recipients,
        unsubscribeLink: message.unsubscribeLink,
        attachmentNames: message.attachmentNames
      }
    };
  });

  try {
    logger.info(`Creating batch job for ${batchRequests.length} emails`);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // Create batch job
    const batchJob = await ai.batches.create({
      model: 'gemini-2.0-flash',
      src: batchRequests.map(req => ({
        contents: req.contents
      })),
      config: {
        displayName: `email-processing-${Date.now()}`,
        // Add any additional configuration
      }
    });

    logger.info(`Created batch job: ${batchJob.name}`);

    // Poll for completion (in a real implementation, you might want to do this asynchronously)
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes max wait
    const pollInterval = 30000; // 30 seconds polling
    let elapsed = 0;

    while (elapsed < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      elapsed += pollInterval;

      const jobStatus = await ai.batches.get({ name: batchJob.name });

      logger.info(`Batch job status: ${jobStatus.state}, progress: ${jobStatus.completedCount || 0}/${batchRequests.length}`);

      if (jobStatus.state === 'SUCCEEDED') {
        // Get results
        const results = await ai.batches.results({ name: batchJob.name });

        // Process results
        for (let i = 0; i < results.responses.length; i++) {
          const response = results.responses[i];
          const originalMessage = messages[i];

          try {
            const content = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const precis = parseGeminiResponse(content, originalMessage.id);

            if (precis) {
              // Save to database
              await saveProcessedEmail(originalMessage, precis, emailOwner);
              result.successful.push({ ...originalMessage, precis });
            } else {
              result.failed.push({
                message: originalMessage,
                error: new Error("Failed to parse Gemini response"),
                isRateLimit: false
              });
            }
          } catch (error) {
            result.failed.push({
              message: originalMessage,
              error: error as Error,
              isRateLimit: false
            });
          }
        }

        logger.info(`Batch processing complete: ${result.successful.length} successful, ${result.failed.length} failed`);
        return result;

      } else if (jobStatus.state === 'FAILED') {
        throw new Error(`Batch job failed: ${jobStatus.error?.message || 'Unknown error'}`);
      } else if (jobStatus.state === 'CANCELLED') {
        throw new Error("Batch job was cancelled");
      }
    }

    // Timeout reached - mark all as failed
    throw new Error("Batch processing timed out after 10 minutes");

  } catch (error: Error) {
    logger.error("Batch API processing failed:", error);

    // Fallback to individual processing
    logger.info("Falling back to individual email processing");
    return await processBatchIndividually(messages, 2000); // Use 2s delays
  }
}

/**
 * Parse Gemini response content into PrecisResult
 */
function parseGeminiResponse(content: string, emailId: string): PrecisResult | null {
  try {
    const summaryMatch = content.match(/\s*Summary:\s*([\s\S]*?)(?=\n\s*Urgency Score:|$)/);
    const urgencyScoreMatch = content.match(/\s*Urgency Score:\s*(\d+)/);
    const actionMatch = content.match(/\s*Action:\s*([\s\S]*?)(?=\n\s*Classification:|$)/);
    const classificationMatch = content.match(/\s*Classification:\s*(\w+)/);
    const keywordsMatch = content.match(/\s*Keywords:\s*([\s\S]*?)(?=\n\s*ExtractedEntities:|$)/);
    const extractedEntitiesMatch = content.match(/\s*ExtractedEntities:\s*(\{[\s\S]*?\})/);

    const precisResult: PrecisResult = {
      summary: summaryMatch ? summaryMatch[1].trim() : "",
      urgencyScore: urgencyScoreMatch ? parseInt(urgencyScoreMatch[1].trim(), 10) : 0,
      action: actionMatch ? actionMatch[1].trim() : "",
      classification: classificationMatch ? classificationMatch[1].trim() : "Uncategorized",
      keywords: keywordsMatch ? keywordsMatch[1].trim().split(",").map((k: string) => k.trim()) : [],
      extractedEntities: parseExtractedEntities(emailId, extractedEntitiesMatch ? extractedEntitiesMatch[1] : null)
    };

    return precisResult;
  } catch (error) {
    logger.error(`Failed to parse Gemini response for email ${emailId}:`, error);
    return null;
  }
}

/**
 * Process emails individually (fallback method)
 */
async function processBatchIndividually(
  messages: GmailMessage[],
  emailDelayMs: number,
): Promise<BatchProcessingResult> {
  const result: BatchProcessingResult = {
    successful: [],
    failed: []
  };

  // Process emails sequentially within the batch to avoid concurrent rate limit hits
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    try {
      const precis = await generateAndSavePrecis(message);
      if (precis) {
        result.successful.push({ ...message, precis });
      }
    } catch (error: unknown) {
      const errorObj = error as { status?: number; retryAfter?: number; quotaInfo?: { quotaMetric?: string; quotaValue?: string } };
      const isRateLimit = errorObj.status === 429 || errorObj.status === 503;

      result.failed.push({
        message,
        error: error as Error,
        isRateLimit
      });

      // If we hit a rate limit, capture the info and stop processing this batch
      if (isRateLimit) {
        result.rateLimitInfo = {
          quotaExceeded: true,
          retryAfter: errorObj.retryAfter,
          quotaMetric: errorObj.quotaInfo?.quotaMetric,
          quotaLimit: errorObj.quotaInfo?.quotaValue
        };
        break;
      }

      // Add delay between individual emails (except after the last one or rate limit)
      if (i < messages.length - 1 && !isRateLimit) {
        logger.info(`Waiting ${emailDelayMs}ms before next email...`);
        await new Promise(resolve => setTimeout(resolve, emailDelayMs));
      }
    }
  }

  return result;
}

/**
 * Process a single batch of emails
 */
async function processBatch(
  messages: GmailMessage[],
  emailDelayMs: number,
): Promise<BatchProcessingResult> {
  // Use batch API if enabled and we have enough messages
  if (USE_BATCH_API && messages.length >= 3) {
    logger.info(`Using Gemini Batch API for ${messages.length} emails`);
    return await processBatchWithAPI(messages);
  } else {
    logger.info(`Using individual processing for ${messages.length} emails`);
    return await processBatchIndividually(messages, emailDelayMs);
  }
}

/**
 * Generate and save precis for a single email (extracted from email-processor.ts)
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

  logger.info(`Starting précis for email: ${message.id}`);

  const MAX_TOKENS_PER_EMAIL = 100000;
  const tokenCount = Math.ceil(message.body.length / 4);
  if (tokenCount > MAX_TOKENS_PER_EMAIL) {
    logger.warn(
      `Email ${message.id} exceeds token limit. Count: ${tokenCount}.`,
    );
    return null;
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

  // Use Gemini SDK instead of direct fetch
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  let content: string;
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contentToSend,
    });
    content = result.text;
  } catch (error: Error) {
    logger.error(
      `Gemini SDK failed for email ${message.id}. Error:`, error,
    );

    // Convert SDK errors to our expected format
    const errorObj = error as Error & {
      status?: number;
      retryAfter?: number;
      quotaInfo?: {
        quotaMetric?: string;
        quotaValue?: string;
        quotaLimit?: string;
        retryDelay?: string;
      };
    };

    // Parse ApiError JSON response for detailed quota information
    if (error.message.includes('ApiError') && error.message.includes('429')) {
      try {
        // Extract JSON from error message
        const jsonMatch = error.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const errorData = JSON.parse(jsonMatch[0]);

          if (errorData.error) {
            errorObj.status = errorData.error.code || 429;

            // Extract retry delay from RetryInfo
            const retryInfo = errorData.error.details?.find((d: any) => d['@type']?.includes('RetryInfo'));
            if (retryInfo?.retryDelay) {
              const delayMatch = retryInfo.retryDelay.match(/(\d+)/);
              if (delayMatch) {
                errorObj.retryAfter = parseInt(delayMatch[1]) * 1000;
                errorObj.quotaInfo = {
                  ...errorObj.quotaInfo,
                  retryDelay: retryInfo.retryDelay
                };
              }
            }

            // Extract detailed quota information
            const quotaFailure = errorData.error.details?.find((d: any) => d['@type']?.includes('QuotaFailure'));
            if (quotaFailure?.violations?.[0]) {
              const violation = quotaFailure.violations[0];
              errorObj.quotaInfo = {
                quotaMetric: violation.quotaMetric || 'unknown',
                quotaValue: violation.quotaValue || 'unknown',
                quotaLimit: `${violation.quotaValue} requests`,
                retryDelay: errorObj.quotaInfo?.retryDelay
              };
            }

            // Extract helpful links
            const helpLink = errorData.error.details?.find((d: any) => d['@type']?.includes('Help'));
            if (helpLink?.links?.[0]) {
              errorObj.quotaInfo = {
                ...errorObj.quotaInfo,
                helpUrl: helpLink.links[0].url
              };
            }
          }
        }
      } catch (parseError) {
        logger.error('Failed to parse ApiError JSON:', parseError);
      }
    }

    // Fallback to regex parsing if JSON parsing fails
    if (!errorObj.status && (error.message?.includes('rate limit') || error.message?.includes('quota'))) {
      errorObj.status = 429;

      const retryMatch = error.message.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|s)/i);
      if (retryMatch) {
        errorObj.retryAfter = parseFloat(retryMatch[1]) * 1000;
      }
    }

    throw errorObj;
  }

  // Parse the response
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
  };

  // Save to database
  await saveProcessedEmail(message, precisResult, emailOwner);

  return precisResult;
}

/**
 * Parse extracted entities from JSON string
 */
function parseExtractedEntities(
  emailId: string,
  rawJsonString: string | null,
): PrecisResult["extractedEntities"] {
  if (!rawJsonString) return null;

  try {
    // Try to parse as-is first (in case it's valid JSON)
    return JSON.parse(rawJsonString) as PrecisResult["extractedEntities"];
  } catch {
    // If direct parsing fails, try cleaning and parsing
    try {
      const cleaned = cleanJsonString(rawJsonString);
      return JSON.parse(cleaned) as PrecisResult["extractedEntities"];
    } catch (error) {
      // Final fallback: try to extract basic info with regex
      return extractEntitiesWithRegex(emailId, rawJsonString);
    }
  }
}

/**
 * Clean malformed JSON string from AI responses
 */
function cleanJsonString(jsonString: string): string {
  let cleaned = jsonString;

  // Replace single quotes with double quotes (but keep escaped quotes)
  cleaned = cleaned.replace(/(?<!\\)'/g, '"');

  // Remove newlines and tabs
  cleaned = cleaned.replace(/[\r\n\t]/g, ' ');

  // Fix trailing commas before closing brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  // Fix missing commas between array elements
  cleaned = cleaned.replace(/(\])\s*(\[)/g, '],$2');

  // Handle special case for snippet with quotes
  cleaned = cleaned.replace(
    /("snippet":\s*)"(.*?)"/g,
    (match, prefix, value) => {
      // Escape any unescaped quotes in the snippet value
      const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
      return `${prefix}"${escapedValue}"`;
    }
  );

  // Fix common JSON issues
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Fallback regex-based extraction when JSON parsing fails
 */
function extractEntitiesWithRegex(
  emailId: string,
  content: string
): PrecisResult["extractedEntities"] {
  try {
    const result: PrecisResult["extractedEntities"] = {
      senderName: "",
      date: "",
      snippet: "",
      recipientNames: [],
      subjectTerms: [],
      attachmentNames: []
    };

    // Extract senderName
    const senderMatch = content.match(/"senderName":\s*"([^"]+)"/);
    if (senderMatch) result.senderName = senderMatch[1];

    // Extract date
    const dateMatch = content.match(/"date":\s*"([^"]+)"/);
    if (dateMatch) result.date = dateMatch[1];

    // Extract snippet (handle quotes carefully)
    const snippetMatch = content.match(/"snippet":\s*"(.+?)"/s);
    if (snippetMatch) result.snippet = snippetMatch[1].replace(/\\"/g, '"');

    // Extract recipientNames
    const recipientMatch = content.match(/"recipientNames":\s*\[(.*?)\]/s);
    if (recipientMatch) {
      const recipients = recipientMatch[1]
        .split(',')
        .map(r => r.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
      result.recipientNames = recipients;
    }

    // Extract subjectTerms
    const subjectMatch = content.match(/"subjectTerms":\s*\[(.*?)\]/s);
    if (subjectMatch) {
      const subjects = subjectMatch[1]
        .split(',')
        .map(s => s.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
      result.subjectTerms = subjects;
    }

    // Extract attachmentNames
    const attachmentMatch = content.match(/"attachmentNames":\s*\[(.*?)\]/s);
    if (attachmentMatch) {
      const attachments = attachmentMatch[1]
        .split(',')
        .map(a => a.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
      result.attachmentNames = attachments;
    }

    logger.info(`Successfully extracted entities using regex fallback for email ${emailId}`);
    return result;
  } catch (error) {
    logger.error(
      `Failed to extract entities with regex for email ${emailId}. Content: ${content.substring(0, 200)}...`,
      error
    );
    return null;
  }
}

/**
 * Save processed email to database
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

  const emailDocument = {
    provider: "gmail",
    emailOwner,
    userId: new ObjectId(emailOwner),
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
  logger.info(`Successfully saved email ${emailId} to the database.`);
}