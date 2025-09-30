// src/lib/gmail/batch-processor.ts

import { logger } from "@/utils/logger";
import { generateGeminiEmailPrecisPrompt } from "@/app/api/gmail/gemini-api/prompts/geminiEmailPrecisPrompt";
import { encrypt } from "@/utils/crypto";
import { GmailMessage } from "./gmail-client";
import { PrecisResult } from "./email-processor";
import { ObjectId } from "mongodb";
import { saveEmailAndIncrementCount } from "../database/user-db";
import { auth } from "@/auth";

const MAX_BATCH_SIZE = 5; // Conservative batch size for free tier
const BATCH_DELAY_MS = 1000; // Delay between batches

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
}

/**
 * Process emails in batches to better handle rate limits
 */
export async function processEmailsInBatches(
  messages: GmailMessage[],
): Promise<BatchProcessingResult> {
  const result: BatchProcessingResult = {
    successful: [],
    failed: []
  };

  logger.info(`Processing ${messages.length} emails in batches of ${MAX_BATCH_SIZE}`);

  for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
    const batch = messages.slice(i, i + MAX_BATCH_SIZE);
    logger.info(`Processing batch ${Math.floor(i / MAX_BATCH_SIZE) + 1}/${Math.ceil(messages.length / MAX_BATCH_SIZE)}`);

    try {
      const batchResult = await processBatch(batch);

      result.successful.push(...batchResult.successful);
      result.failed.push(...batchResult.failed);

      // If we hit rate limits, update the result and stop processing
      if (batchResult.rateLimitInfo?.quotaExceeded) {
        result.rateLimitInfo = batchResult.rateLimitInfo;
        logger.warn(`Rate limit hit in batch ${Math.floor(i / MAX_BATCH_SIZE) + 1}. Stopping further processing.`);
        break;
      }

      // Add delay between batches to avoid rate limits
      if (i + MAX_BATCH_SIZE < messages.length) {
        logger.info(`Waiting ${BATCH_DELAY_MS}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }

    } catch (error) {
      logger.error(`Batch ${Math.floor(i / MAX_BATCH_SIZE) + 1} failed:`, error);

      // Add all messages in this batch as failed
      batch.forEach(message => {
        result.failed.push({
          message,
          error: error as Error,
          isRateLimit: false
        });
      });
    }
  }

  logger.info(`Batch processing complete. Successful: ${result.successful.length}, Failed: ${result.failed.length}`);
  return result;
}

/**
 * Process a single batch of emails
 */
async function processBatch(
  messages: GmailMessage[],
): Promise<BatchProcessingResult> {
  const result: BatchProcessingResult = {
    successful: [],
    failed: []
  };

  // Process emails sequentially within the batch to avoid concurrent rate limit hits
  for (const message of messages) {
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
    }
  }

  return result;
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: contentToSend }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    logger.error(
      `Gemini API failed for email ${message.id}. Status: ${response.status}, Details: ${errorDetails}`,
    );

    // Parse rate limit errors
    if (response.status === 429) {
      try {
        const errorData = JSON.parse(errorDetails);
        const error = new Error(errorData.error?.message || 'Rate limit exceeded') as Error & {
          status?: number;
          retryAfter?: number;
          quotaInfo?: { quotaMetric?: string; quotaValue?: string };
        };
        error.status = response.status;

        // Extract retry delay
        const retryInfo = errorData.error?.details?.find((detail: { '@type': string; retryDelay?: string }) =>
          detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );
        if (retryInfo?.retryDelay) {
          const delayMatch = retryInfo.retryDelay.match(/(\d+\.?\d*)s/);
          if (delayMatch) {
            error.retryAfter = parseFloat(delayMatch[1]) * 1000;
          }
        }

        // Extract quota information
        const quotaFailure = errorData.error?.details?.find((detail: { '@type': string; violations?: { quotaMetric?: string; quotaValue?: string }[] }) =>
          detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure'
        );
        if (quotaFailure?.violations?.[0]) {
          error.quotaInfo = {
            quotaMetric: quotaFailure.violations[0].quotaMetric,
            quotaValue: quotaFailure.violations[0].quotaValue
          };
        }

        throw error;
      } catch {
        // If parsing fails, throw a generic error
      }
    }

    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

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