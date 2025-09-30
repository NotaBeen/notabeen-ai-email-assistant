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

const loggingEnabled = true;
const MAX_TOKENS_PER_EMAIL = 100000;

interface PrecisResult {
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

// Re-implement the adaptive concurrency helper here for processing
async function fetchWithAdaptiveConcurrency<T, R>(
  items: T[],
  initialConcurrency: number,
  fn: (item: T) => Promise<R | null>,
): Promise<R[]> {
  let concurrency = initialConcurrency;
  const results: (R | null)[] = new Array(items.length).fill(null);
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
          concurrency = Math.max(1, concurrency - 1);
          logger.warn(
            `Concurrency reduced to ${concurrency} due to 429 error during précis generation.`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          index = currentIndex; // Decrement index to reprocess this item
        } else {
          results[currentIndex] = null;
          logger.error(
            `Error processing email at index ${currentIndex}:`,
            error,
          );
        }
      }
    }
  }
  const workers = Array(initialConcurrency)
    .fill(null)
    .map(() => worker());
  await Promise.all(workers);
  return results.filter((item): item is R => item !== null);
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
 */
export async function generatePrecisForNewMessages(
  messages: GmailMessage[],
): Promise<(GmailMessage & { precis: PrecisResult })[]> {
  try {
    if (loggingEnabled) {
      logger.info(
        `Starting précis generation for ${messages.length} messages...`,
      );
    }

    return (await fetchWithAdaptiveConcurrency(
      messages,
      5, // Concurrency limit for Gemini API calls
      async (message: GmailMessage) => {
        if (!message || !message.id) return null;
        const precis = await generateAndSavePrecis(message);

        if (!precis) return null;

        return { ...message, precis };
      },
    )) as (GmailMessage & { precis: PrecisResult })[];
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
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""; // --- Parsing Logic (Simplified) ---

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
      /("snippet":\s*)"(.*?)"(\s*,\s*\"[^\"]+\":\s*\[.*?\]|\s*,\s*\"[^\"]+\":\s*\".*?\"|\s*})$/s,
      (_match: string, prefix: string, value: string, suffix: string) => {
        // Escape non-escaped double quotes in the value
        const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
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
