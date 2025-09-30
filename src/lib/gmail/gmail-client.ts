// src/lib/gmail/gmail-client.ts

import axios, { AxiosError } from "axios"; // Import AxiosError for proper type checking
import { logger } from "@/utils/logger";
import { decodeBase64Url } from "@/utils/crypto";
import { formatBodyText } from "@/utils/text";

export interface GmailMessage {
  id: string;
  subject: string;
  body: string;
  sender: string;
  recipients: string[];
  unsubscribeLink?: string;
  dateReceived: Date;
  emailUrl: string;
  attachmentNames: string[];
}

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  filename?: string;
  body?: { data?: string; attachmentId?: string };
  mimeType?: string;
  parts?: GmailMessagePart[];
}

interface GmailApiMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: GmailMessageHeader[];
    parts?: GmailMessagePart[];
  };
}

// --- Type Guard for AxiosError ---
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

// --- Helper Functions (moved from route.ts) ---

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500,
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    let shouldRetry = false;
    let status: number | undefined;

    if (isAxiosError(error)) {
      status = error.response?.status;
      // Check for rate limit (429)
      if (status === 429) {
        shouldRetry = true;
      }
    } else if (
      // Check for generic connection reset error (common in NodeJS)
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ECONNRESET"
    ) {
      shouldRetry = true;
    }

    if (retries > 0 && shouldRetry) {
      logger.warn(
        `Rate limit exceeded (${status}) or connection reset. Retrying in ${delayMs}ms... (Retries left: ${
          retries - 1
        })`,
      );
      await delay(delayMs);
      return fetchWithRetry(fn, retries - 1, delayMs * 2);
    }
    // Re-throw if no retries left or not a retriable error
    throw error;
  }
}

async function fetchWithAdaptiveConcurrency<T, R>(
  items: T[],
  initialConcurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  let concurrency = initialConcurrency;
  const results: (R | null)[] = new Array(items.length).fill(null);
  let index = 0;
  const maxIndex = items.length;

  async function worker() {
    while (true) {
      let currentIndex: number; // Atomically increment index and check if we are done
      if (index < maxIndex) {
        currentIndex = index++;
      } else {
        break;
      }

      try {
        results[currentIndex] = await fn(items[currentIndex]);
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.status === 429) {
          // Only reduce concurrency once, then rely on backoff/retry
          concurrency = Math.max(1, concurrency - 1);
          logger.warn(
            `Concurrency reduced to ${concurrency} due to 429 error.`,
          );
          await delay(1000); // Wait before retrying
          index = currentIndex; // Decrement index to reprocess this item
        } else {
          results[currentIndex] = null;
          logger.error(
            `Error fetching message detail for item at index ${currentIndex}:`,
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

// --- Extraction Logic ---

/**
 * Extracts all relevant data fields from a raw Gmail API message object.
 * @param data The raw message data from the Gmail API.
 * @returns A formatted GmailMessage object.
 */
function parseGmailMessage(data: GmailApiMessage): GmailMessage {
  const getHeaderValue = (name: string) =>
    (data.payload.headers as GmailMessageHeader[]).find((h) => h.name === name)
      ?.value || "";

  const subject = getHeaderValue("Subject") || "No Subject";
  const sender = getHeaderValue("From") || "Unknown Sender";

  const toRecipients = getHeaderValue("To");
  const ccRecipients = getHeaderValue("Cc");
  const bccRecipients = getHeaderValue("Bcc");

  const recipients: string[] = [];
  if (toRecipients)
    recipients.push(...toRecipients.split(",").map((s: string) => s.trim()));
  if (ccRecipients)
    recipients.push(...ccRecipients.split(",").map((s: string) => s.trim()));
  if (bccRecipients)
    recipients.push(...bccRecipients.split(",").map((s: string) => s.trim()));

  const dateHeader = getHeaderValue("Date");
  let dateReceived = new Date();
  if (dateHeader) {
    const parsedDate = new Date(dateHeader);
    if (!isNaN(parsedDate.getTime())) {
      dateReceived = parsedDate;
    }
  }

  const attachmentNames: string[] = [];
  function extractAttachmentNames(payload: GmailMessagePart) {
    if (!payload) return;
    if (payload.filename && payload.body && payload.body.attachmentId) {
      attachmentNames.push(payload.filename);
    }
    if (payload.parts && Array.isArray(payload.parts)) {
      payload.parts.forEach(extractAttachmentNames);
    }
  }
  extractAttachmentNames(data.payload);

  let unsubscribeLink = getHeaderValue("List-Unsubscribe");
  let rawBodyHtml = "";
  let rawBodyPlain = "";

  function extractRawBodyParts(payload: GmailMessagePart) {
    if (!payload) return;
    if (payload.mimeType === "text/html" && payload.body?.data) {
      rawBodyHtml = decodeBase64Url(payload.body.data);
    } else if (payload.mimeType === "text/plain" && payload.body?.data) {
      rawBodyPlain = decodeBase64Url(payload.body.data);
    }
    if (payload.parts && Array.isArray(payload.parts)) {
      payload.parts.forEach(extractRawBodyParts);
    }
  }
  extractRawBodyParts(data.payload); // Enhance unsubscribe link extraction

  if (unsubscribeLink) {
    const match = unsubscribeLink.match(/<(https?:\/\/[^>]+)>/);
    if (match) {
      unsubscribeLink = match[1];
    } else {
      const mailtoMatch = unsubscribeLink.match(/<(mailto:[^>]+)>/);
      if (mailtoMatch) {
        unsubscribeLink = mailtoMatch[1];
      }
    }
  } else if (rawBodyHtml) {
    const unsubscribeRegex =
      /(<a[^>]+href=["'](https?:\/\/[^"']*\b(?:unsubscribe|optout|remove)\b[^"']*)["'][^>]*>(?:.*?unsubscribe.*?|.*?opt ?out.*?|.*?remove me.*?|.*?manage preferences.*?)<\/a>)/i;
    const match = rawBodyHtml.match(unsubscribeRegex);
    if (match && match[2]) {
      unsubscribeLink = match[2];
    }
  } // Prioritize plain text body, fall back to cleaned HTML, then snippet

  let body = rawBodyPlain;
  if (!body && rawBodyHtml) {
    body = formatBodyText(rawBodyHtml);
  }
  if (!body && data.snippet) {
    body = data.snippet;
  }

  return {
    id: data.id,
    subject,
    body,
    sender,
    recipients,
    unsubscribeLink,
    dateReceived,
    emailUrl: `https://mail.google.com/mail/u/0/#inbox/${data.threadId}`,
    attachmentNames,
  };
}

// --- Public API Functions ---

/**
 * Fetches a list of recent message IDs from the Gmail API.
 */
export async function fetchMessagePage(
  accessToken: string,
  pageToken?: string,
  batchSize = 100,
): Promise<{ messages: { id: string }[]; nextPageToken?: string }> {
  try {
    const response = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          maxResults: batchSize,
          q: "newer_than:3d", // Only check emails from the last 3 days
          pageToken,
        },
      },
    );
    return response.data;
  } catch (error) {
    logger.error("Failed to fetch message page from Gmail API.", error);
    throw error;
  }
}

/**
 * Fetches full details for a batch of messages using adaptive concurrency.
 */
export async function fetchFullMessageDetails(
  messageIds: string[],
  accessToken: string,
): Promise<GmailMessage[]> {
  const concurrencyLimit = 10;
  return fetchWithAdaptiveConcurrency<string, GmailMessage>(
    messageIds,
    concurrencyLimit,
    async (id: string) => {
      return fetchWithRetry(async () => {
        const response = await axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        return parseGmailMessage(response.data);
      });
    },
  );
}
