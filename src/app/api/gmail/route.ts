// src/app/api/gmail/route.ts

import { NextResponse, NextRequest } from "next/server";
import { CustomError, handleApiError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";
import { auth } from "@/auth";
// Import modularized components
import {
  fetchMessagePage,
  fetchFullMessageDetails,
} from "@/lib/gmail/gmail-client";
import {
  filterNewMessages,
  generatePrecisForNewMessages,
} from "@/lib/gmail/email-processor";

// set logging to true to enable logging for debugging
const loggingEnabled = true;

/**
 * Helper to validate user session and return session object.
 */
async function validateUserSession() {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new CustomError("Unauthorized: Session or User ID is missing.", 401);
  }
  return session;
}

/**
 * Interface for processed email data.
 */
interface ProcessedEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  precis: string; // Add other relevant fields as needed
}

interface ProcessingError {
  messageId: string;
  subject: string;
  error: string;
  isRateLimit: boolean;
}

interface RateLimitInfo {
  quotaExceeded: boolean;
  retryAfter?: number;
  quotaMetric?: string;
  quotaLimit?: string;
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  averageWaitTime: number;
}

/**
 * Main function to fetch, process, and save emails.
 * This function MUST be defined outside of the GET export to be globally accessible.
 */
async function getAndProcessGmailEmails(
  accessToken: string,
  pageSize = 100,
  pageToken?: string,
): Promise<{
  emails: ProcessedEmail[];
  nextPageToken?: string;
  processingErrors?: {
    count: number;
    errors: ProcessingError[];
  };
  rateLimitInfo?: RateLimitInfo;
  queueStats?: QueueStats;
}> {
  try {
    // 1. Fetch the list of messages from Gmail API (list messages)
    const page = await fetchMessagePage(accessToken, pageToken, pageSize);
    const messageIds = (page.messages || []).map((m) => m.id);

    if (loggingEnabled) {
      logger.info(`Fetched ${messageIds.length} message IDs from Gmail.`);
    } // 2. Fetch full message details for the batch

    const messages = await fetchFullMessageDetails(messageIds, accessToken);

    if (loggingEnabled) {
      logger.info(`Fetched full details for ${messages.length} messages.`);
    } // 3. Filter out messages that have already been processed

    const newMessages = await filterNewMessages(messages); // 4. Generate precis, save to DB, and return the processed emails

    const result = await generatePrecisForNewMessages(newMessages); // Map to ProcessedEmail shape

    const processedEmails: ProcessedEmail[] = result.processedMessages.map((msg) => ({
      id: msg.id,
      subject: msg.subject,
      from: msg.sender || "", // Use the correct property for sender
      date:
        msg.dateReceived instanceof Date
          ? msg.dateReceived.toISOString()
          : msg.dateReceived || "",
      precis:
        typeof msg.precis === "string"
          ? msg.precis
          : (msg.precis?.summary ?? ""),
    }));

    // Return enhanced response with error and rate limit information
    return {
      emails: processedEmails,
      nextPageToken: page.nextPageToken,
      processingErrors: result.errors.length > 0 ? {
        count: result.errors.length,
        errors: result.errors.map(e => ({
          messageId: e.message.id,
          subject: e.message.subject,
          error: e.error.message,
          isRateLimit: e.isRateLimit
        }))
      } : undefined,
      rateLimitInfo: result.rateLimitInfo,
      queueStats: result.queueStats
    };
  } catch (error) {
    logger.error("Error in getAndProcessGmailEmails:", error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateUserSession(); // Use the user's MongoDB ObjectId as the ID

    const userId = session.user.id as string;
    if (loggingEnabled) {
      logger.info(`API request received from authenticated user: ${userId}`);
    }

    const { searchParams } = new URL(req.url);
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "100", 10),
      200,
    );
    const pageToken = searchParams.get("pageToken") || undefined; // 🔑 FIX: Retrieve the token from the session, where it is plaintext.

    if (loggingEnabled) {
      logger.info(
        `Retrieving Google access token from session for user: ${userId}.`,
      );
    }
    const idpAccessToken = session.googleAccessToken; // This holds the plaintext token

    if (loggingEnabled) {
      const tokenStatus = idpAccessToken
        ? "present (token length: " + idpAccessToken.length + ")"
        : "NULL/undefined";
      logger.info(
        `[TOKEN_CHECK] Access token state from session: ${tokenStatus}`,
      );
    }

    if (!idpAccessToken) {
      logger.warn(
        `Google access token not found in session for user: ${userId}.`,
      );
      return NextResponse.json(
        { message: "Google access token not found. Please re-authenticate." },
        { status: 400 },
      );
    } // ✅ Success log

    if (loggingEnabled) {
      logger.info(`Successfully retrieved Google access token.`);
      logger.info(
        `Starting email fetching and processing for user: ${userId}.`,
      );
    }

    // This line is now correctly referencing the function defined above
    const result = await getAndProcessGmailEmails(
      idpAccessToken,
      pageSize,
      pageToken,
    );

    const { emails, nextPageToken, processingErrors, rateLimitInfo, queueStats } = result;

    if (loggingEnabled) {
      logger.info(
        `Finished processing. Found ${emails.length} new emails for user: ${userId}.`,
      );
      if (processingErrors) {
        logger.warn(`${processingErrors.count} emails failed to process during this batch.`);
      }
      if (rateLimitInfo?.quotaExceeded) {
        logger.warn(`Rate limits were exceeded during processing.`);
      }
    }

    // Construct appropriate response message based on results
    let message = "Emails fetched and processed successfully.";
    let status = 200;

    if (queueStats) {
      // Large batch was queued for background processing
      message = `${emails.length} emails processed immediately. ${queueStats.total} emails queued for background processing (pending: ${queueStats.pending}, processing: ${queueStats.processing}).`;
      if (queueStats.averageWaitTime > 0) {
        message += ` Average wait time: ${Math.round(queueStats.averageWaitTime / 1000)}s.`;
      }
    } else if (rateLimitInfo?.quotaExceeded) {
      message = `Partial success: ${emails.length} emails processed. Rate limits exceeded. Please try again later.`;
      if (rateLimitInfo.retryAfter) {
        message += ` Retry in ${Math.ceil(rateLimitInfo.retryAfter / 1000)} seconds.`;
      }
      status = 429; // Too Many Requests
    } else if (processingErrors && processingErrors.count > 0) {
      message = `Partial success: ${emails.length} emails processed, ${processingErrors.count} failed.`;
      status = 207; // Multi-Status (some successes, some failures)
    } else if (emails.length === 0) {
      message = "No new emails found or all emails have been processed already.";
    }

    return NextResponse.json(
      {
        message,
        emails,
        nextPageToken,
        processingErrors,
        rateLimitInfo,
        queueStats,
      },
      { status },
    );
  } catch (error) {
    logger.error(`Error in GET /api/gmail:`, error);
    return handleApiError(error, "GET /api/emails");
  }
}
