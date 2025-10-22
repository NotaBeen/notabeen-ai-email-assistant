// src/lib/gmail/batchProcessor/email-processor-service.ts

import { logger } from "@/utils/logger";
import { GoogleGenAI } from "@google/genai";
import { GmailMessage } from "../gmail-client";
import { PrecisResult } from "../email-processor";
import { generateGeminiEmailPrecisPrompt } from "@/app/api/gmail/gemini-api/prompts/geminiEmailPrecisPrompt";
import { parseGeminiResponse } from "./response-parser";
import { saveProcessedEmail } from "./data-persister";
import { MAX_TOKENS_PER_EMAIL } from "./constants";

// --- Custom Interfaces to avoid 'any' ---
interface QuotaInfo {
  quotaMetric?: string;
  quotaValue?: string;
  quotaLimit?: string;
  retryDelay?: string;
  helpUrl?: string;
}

interface ApiErrorDetails {
  status?: number;
  retryAfter?: number;
  quotaInfo?: QuotaInfo;
}

interface Violation {
  quotaMetric?: string;
  quotaValue?: string;
}

interface QuotaFailure {
  "@type"?: string;
  violations?: Violation[];
}

interface RetryInfo {
  "@type"?: string;
  retryDelay?: string;
}

// --- End Custom Interfaces ---

/**
 * Format the Gemini API error to include detailed quota information.
 * @param error The original error object.
 * @returns An error object with rate limit/quota details.
 */
function formatGeminiApiError(error: Error): Error & ApiErrorDetails {
  const errorObj = error as Error & ApiErrorDetails;

  // Default status for rate limiting/API errors
  if (!errorObj.status) {
    errorObj.status = error.message.includes("429") || error.message.includes("quota") || error.message.includes("rate limit") ? 429 : 500;
  }

  // Attempt to parse detailed JSON from ApiError message
  if (error.message.includes("ApiError") && (error.message.includes("429") || errorObj.status === 429)) {
    try {
      const jsonMatch = error.message.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // We use 'unknown' for parsed data and assert structure when accessing known fields.
        const errorData: { error?: { code?: number; details?: Array<RetryInfo | QuotaFailure> } } = JSON.parse(jsonMatch[0]);

        if (errorData.error) {
          errorObj.status = errorData.error.code || errorObj.status;

          // Extract RetryInfo
          const retryInfo = errorData.error.details?.find((d): d is RetryInfo =>
            d["@type"]?.includes("RetryInfo") ?? false
          );
          if (retryInfo?.retryDelay) {
            const delayMatch = retryInfo.retryDelay.match(/(\d+)/);
            if (delayMatch) {
              errorObj.retryAfter = parseInt(delayMatch[1]) * 1000;
            }
            errorObj.quotaInfo = { ...errorObj.quotaInfo, retryDelay: retryInfo.retryDelay };
          }

          // Extract QuotaFailure
          const quotaFailure = errorData.error.details?.find((d): d is QuotaFailure =>
            d["@type"]?.includes("QuotaFailure") ?? false
          );
          if (quotaFailure?.violations?.[0]) {
            const violation = quotaFailure.violations[0];
            errorObj.quotaInfo = {
              ...errorObj.quotaInfo,
              quotaMetric: violation.quotaMetric || "unknown",
              quotaValue: violation.quotaValue || "unknown",
              quotaLimit: `${violation.quotaValue} requests`,
            };
          }
        }
      }
    } catch (parseError) {
      logger.error("Failed to parse ApiError JSON:", parseError);
    }
  }

  // Fallback regex for retryAfter if JSON parsing failed
  if (errorObj.status === 429 && !errorObj.retryAfter) {
    const retryMatch = error.message.match(
      /(\d+(?:\.\d+)?)\s*(?:seconds?|s)/i
    );
    if (retryMatch) {
      errorObj.retryAfter = parseFloat(retryMatch[1]) * 1000;
    }
  }

  return errorObj;
}

/**
 * Generates précis for a single email, calls the Gemini API, and saves to DB.
 */
export async function generateAndSavePrecis(
  message: GmailMessage,
  emailOwner: string
): Promise<PrecisResult | null> {

  logger.info(`Starting précis for email: ${message.id}`);

  // 1. Pre-flight checks (Token Limit)
  const tokenCount = Math.ceil(message.body.length / 4);
  if (tokenCount > MAX_TOKENS_PER_EMAIL) {
    logger.warn(
      `Email ${message.id} exceeds token limit. Count: ${tokenCount}. Skipping.`
    );
    return null;
  }

  // 2. Prepare Prompt
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

  // 3. Call Gemini API
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  let content: string = "";
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contentToSend,
    });
    content = result.text ?? "";
  } catch (error: unknown) {
    logger.error(`Gemini SDK failed for email ${message.id}. Error:`, error);
    // Re-throw the formatted error to be caught by the batch processor
    throw formatGeminiApiError(error as Error);
  }

  // 4. Parse Response
  const precisResult = parseGeminiResponse(content, message.id);

  if (!precisResult) {
    logger.error(`Failed to parse precis for email ${message.id}.`);
    return null;
  }

  // 5. Save to Database
  await saveProcessedEmail(message, precisResult, emailOwner);

  return precisResult;
}

/**
 * Utility function for processBatchIndividually to handle the async result structure.
 * Returns a discriminated union type.
 */
export async function processSingleEmail(message: GmailMessage, emailOwner: string): Promise<
  { success: true; message: GmailMessage; precis: PrecisResult } |
  { success: false; message: GmailMessage; error: Error; isRateLimit: boolean; retryAfter?: number; quotaInfo?: QuotaInfo }
> {
  try {
    const precis = await generateAndSavePrecis(message, emailOwner);
    if (precis) {
      return { success: true, message, precis };
    }
    return {
      success: false,
      message,
      error: new Error("No precis generated or skipped due to token limit"),
      isRateLimit: false,
    };
  } catch (error: unknown) {
    const errorObj = error as ApiErrorDetails; 

    const isRateLimit = errorObj.status === 429 || errorObj.status === 503;

    // The return type is defined with quotaInfo as QuotaInfo, so we align the extracted object.
    return {
      success: false,
      message,
      error: error as Error,
      isRateLimit,
      retryAfter: errorObj.retryAfter,
      quotaInfo: errorObj.quotaInfo,
    };
  }
}