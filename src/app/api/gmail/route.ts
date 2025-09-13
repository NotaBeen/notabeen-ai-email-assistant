/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { MongoClient } from "mongodb";
import { generateGeminiEmailPrecisPrompt } from "@/app/api/gmail/gemini-api/prompts/geminiEmailPrecisPrompt";
import { CustomError, handleApiError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";
import { encrypt, decodeBase64Url } from "@/utils/crypto";
import { validateUserSession } from "@/utils/auth";

//set logging to true to enable logging for debugging
const loggingEnabled = true;

// --- MongoDB Setup ---
const uri = process.env.MONGODB_URI ?? "";
const collectionName = process.env.MONGO_CLIENT ?? "";
const client = new MongoClient(uri);
const clientPromise = uri
  ? client.connect()
  : Promise.reject(new Error("MONGODB_URI is not defined"));

// --- Auth0 Environment Variables ---
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`;

function formatBodyText(body: string): string {
  if (!body) return "";
  let cleanedBody = body.replace(/<\/?[^>]+(>|$)/g, "");
  cleanedBody = cleanedBody.replace(/https?:\/\/[^\s]+/g, "[Link Removed]");
  return cleanedBody.trim();
}

async function getManagementApiToken(): Promise<string> {
  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: AUDIENCE,
      grant_type: "client_credentials",
      scope: "read:users",
    });
    return response.data.access_token;
  } catch (error) {
    logger.error("Error fetching Management API token:", error);
    throw new CustomError("Failed to get Management API token", 500, false);
  }
}

interface UserProfile {
  identities?: { access_token?: string; refresh_token?: string }[];
}

async function fetchUserProfile(
  managementToken: string,
  userId: string,
): Promise<UserProfile> {
  const url = `https://${AUTH0_DOMAIN}/api/v2/users/${userId}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${managementToken}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error fetching user profile:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Error fetching user profile:", (error as Error).message);
    }
    throw new Error("Failed to fetch user profile");
  }
}

interface GmailMessage {
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

interface UserDocument {
  sub: string;
}

async function fetchUserFromDatabase(
  sub: string,
): Promise<UserDocument | null> {
  try {
    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("user");
    return (await collection.findOne({ sub })) as UserDocument | null;
  } catch (error) {
    logger.error("Error fetching user from database:", error);
    throw new Error("Error fetching user from database");
  }
}

async function getGmailEmails(
  accessToken: string,
  pageSize = 100,
  pageToken?: string,
): Promise<{ emails: GmailMessage[]; nextPageToken?: string }> {
  try {
    const session = await validateUserSession();
    const user = await fetchUserFromDatabase(session.user.sub);
    if (!user) {
      return { emails: [], nextPageToken: undefined };
    }
    const currentPageToken: string | undefined = pageToken;
    const page = await fetchMessagePage(
      accessToken,
      currentPageToken,
      pageSize,
    );
    const messageIds = (page.messages || []).map((m) => m.id);
    const messages = await fetchFullMessageDetails(messageIds, accessToken);

    const newMessages = await filterNewMessages(messages);
    const messagesWithPrecis = await generatePrecisForNewMessages(newMessages);

    return { emails: messagesWithPrecis, nextPageToken: page.nextPageToken };
  } catch (error) {
    logger.error("Error in getGmailEmails:", error);
    throw error;
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMessagePage(
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
          q: "newer_than:3d",
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

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500,
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (
      retries > 0 &&
      (error.response?.status === 429 || error.code === "ECONNRESET")
    ) {
      logger.warn(
        `Rate limit exceeded or connection reset. Retrying in ${delayMs}ms... (Retries left: ${retries - 1})`,
      );
      await delay(delayMs);
      return fetchWithRetry(fn, retries - 1, delayMs * 2);
    }
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

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      try {
        results[currentIndex] = await fn(items[currentIndex]);
      } catch (error: any) {
        if (error.response?.status === 429) {
          concurrency = Math.max(1, concurrency - 1);
          logger.warn(
            `Concurrency reduced to ${concurrency} due to 429 error.`,
          );
          await delay(1000);
          index--;
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

  const workers = Array(concurrency)
    .fill(null)
    .map(() => worker());
  await Promise.all(workers);
  return results.filter((item): item is R => item !== null);
}

async function fetchFullMessageDetails(
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
        const data = response.data;

        const getHeaderValue = (name: string) =>
          (data.payload.headers as { name: string; value: string }[]).find(
            (h) => h.name === name,
          )?.value || "";

        const subject = getHeaderValue("Subject") || "No Subject";
        const sender = getHeaderValue("From") || "Unknown Sender";

        const toRecipients = getHeaderValue("To");
        const ccRecipients = getHeaderValue("Cc");
        const bccRecipients = getHeaderValue("Bcc");

        const recipients: string[] = [];
        if (toRecipients)
          recipients.push(
            ...toRecipients.split(",").map((s: string) => s.trim()),
          );
        if (ccRecipients)
          recipients.push(
            ...ccRecipients.split(",").map((s: string) => s.trim()),
          );
        if (bccRecipients)
          recipients.push(
            ...bccRecipients.split(",").map((s: string) => s.trim()),
          );

        const dateHeader = getHeaderValue("Date");
        let dateReceived = new Date();
        if (dateHeader) {
          const parsedDate = new Date(dateHeader);
          if (!isNaN(parsedDate.getTime())) {
            dateReceived = parsedDate;
          }
        }

        const attachmentNames: string[] = [];
        type PayloadPart = {
          filename?: string;
          body?: { attachmentId?: string };
          parts?: PayloadPart[];
        };
        function extractAttachmentNames(payload: PayloadPart) {
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
        }

        let rawBodyHtml = "";
        let rawBodyPlain = "";

        function extractRawBodyParts(
          payload: PayloadPart & {
            mimeType?: string;
            body?: { data?: string };
            parts?: PayloadPart[];
          },
        ) {
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
        extractRawBodyParts(data.payload);

        if (!unsubscribeLink && rawBodyHtml) {
          const unsubscribeRegex =
            /(<a[^>]+href=["'](https?:\/\/[^"']*\b(?:unsubscribe|optout|remove)\b[^"']*)["'][^>]*>(?:.*?unsubscribe.*?|.*?opt ?out.*?|.*?remove me.*?|.*?manage preferences.*?)<\/a>)/i;
          const match = rawBodyHtml.match(unsubscribeRegex);
          if (match && match[2]) {
            unsubscribeLink = match[2];
          }
        }

        let body = rawBodyPlain;
        if (!body && rawBodyHtml) {
          body = formatBodyText(rawBodyHtml);
        }
        if (!body && data.snippet) {
          body = data.snippet;
        }

        return {
          id,
          subject,
          body,
          sender,
          recipients,
          unsubscribeLink,
          dateReceived,
          emailUrl: `https://mail.google.com/mail/u/0/#inbox/${data.threadId}`,
          attachmentNames,
        };
      });
    },
  );
}

async function filterNewMessages(
  messages: GmailMessage[],
): Promise<GmailMessage[]> {
  try {
    const emailCollection = (await clientPromise)
      .db(collectionName)
      .collection("emails");

    const filteredMessages = await Promise.all(
      messages.map(async (message) => {
        if (!message || !message.id) {
          logger.warn("Skipping null or invalid message during filtering.");
          return null;
        }
        const email = await emailCollection.findOne({ emailId: message.id });
        return email ? null : message;
      }),
    );
    return filteredMessages.filter(Boolean) as GmailMessage[];
  } catch (error) {
    logger.error("Error filtering new messages from the database.", error);
    throw new Error("Error filtering new messages from the database");
  }
}

async function generatePrecisForNewMessages(
  messages: GmailMessage[],
): Promise<(GmailMessage & { precis: PrecisResult })[]> {
  try {
    return (await fetchWithAdaptiveConcurrency(
      messages,
      5,
      async (message: GmailMessage) => {
        if (!message || !message.id) {
          logger.warn("Skipping null or invalid message in précis generation.");
          return null;
        }
        const precis = await generatePrecis(
          message.id,
          message.subject,
          message.body,
          message.sender,
          message.dateReceived,
          message.emailUrl,
          message.recipients,
          message.unsubscribeLink,
          message.attachmentNames,
        );

        if (precis instanceof Response) {
          logger.error(
            `Precis generation failed for email ${message.id} with status ${precis.status}.`,
          );
          return null;
        }

        return { ...message, precis };
      },
    )) as (GmailMessage & { precis: PrecisResult })[];
  } catch (error) {
    logger.error("Error generating précis for new messages:", error);
    throw new Error("Error generating précis for new messages");
  }
}

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

async function generatePrecis(
  emailId: string,
  subject: string,
  text: string,
  sender: string,
  dateReceived: Date,
  emailUrl: string,
  recipients: string[],
  unsubscribeLink?: string,
  attachmentNames?: string[],
): Promise<PrecisResult | Response> {
  if (loggingEnabled) {
    logger.info(`Starting précis generation for email: ${emailId}`);
  }

  const session = await validateUserSession();

  const clientConnection = await clientPromise;
  const db = clientConnection.db(collectionName);
  const collection = db.collection("user");

  const user = await collection.findOne({ sub: session.user.sub });
  if (!user) {
    logger.warn(`User not found in DB: ${session.user.sub}.`);
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const tokenCount = countTokens(text);
  if (tokenCount > MAX_TOKENS_PER_EMAIL) {
    logger.warn(
      `Email ${emailId} exceeds the token limit of ${MAX_TOKENS_PER_EMAIL}. Token count: ${tokenCount}.`,
    );
    return NextResponse.json(
      {
        message: `Email exceeds the token limit of ${MAX_TOKENS_PER_EMAIL} tokens even after redaction. Please shorten your email or adjust redaction rules.`,
      },
      { status: 400 },
    );
  }

  if (loggingEnabled) {
    logger.info(
      `Fetching summary from Gemini API for email ${emailId} with token count ${tokenCount}...`,
    );
  }

  const formattedDate =
    dateReceived instanceof Date && !isNaN(dateReceived.getTime())
      ? dateReceived.toISOString().split("T")[0]
      : "unknown date";

  const contentToSend = generateGeminiEmailPrecisPrompt({
    sender: sender,
    recipients: recipients.join(", ") || "none",
    unsubscribeLinkPresent: unsubscribeLink ? "Yes" : "No",
    attachmentNames: attachmentNames?.join(", ") || "none",
    formattedDate,
    text: text,
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: contentToSend,
              },
            ],
          },
        ],
      }),
    },
  );
  if (!response.ok) {
    const errorDetails = await response.text();
    logger.error(
      `Gemini API request failed for email ${emailId}. Status: ${response.status}, Details: ${errorDetails}`,
    );
    return NextResponse.json(
      { message: "Failed to fetch summary from Gemini API" },
      { status: 500 },
    );
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    logger.error(
      `Empty or invalid response from Gemini API for email ${emailId}.`,
    );
    return NextResponse.json(
      { message: "Error processing response from Gemini API" },
      { status: 500 },
    );
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const summaryMatch = content.match(
    /\s*Summary:\s*([\s\S]*?)(?=\n\s*Urgency Score:|$)/,
  );
  const urgencyScoreMatch = content.match(/\s*Urgency Score:\s*(\d+)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const urgencyScore = urgencyScoreMatch
    ? parseInt(urgencyScoreMatch[1].trim(), 10)
    : 0;

  const actionMatch = content.match(
    /\s*Action:\s*([\s\S]*?)(?=\n\s*Classification:|$)/,
  );
  const action = actionMatch ? actionMatch[1].trim() : "";

  const classificationMatch = content.match(/\s*Classification:\s*(\w+)/);
  const classification = classificationMatch
    ? classificationMatch[1].trim()
    : "Uncategorized";

  const keywordsMatch = content.match(
    /\s*Keywords:\s*([\s\S]*?)(?=\n\s*ExtractedEntities:|$)/,
  );
  const keywords = keywordsMatch
    ? keywordsMatch[1]
        .trim()
        .split(",")
        .map((k: string) => k.trim())
    : [];

  const extractedEntitiesMatch = content.match(
    /\s*ExtractedEntities:\s*(\{[\s\S]*?\})/,
  );

  let extractedEntities: {
    senderName: string;
    recipientNames: string[];
    subjectTerms: string[];
    date: string;
    attachmentNames: string[];
    snippet: string;
  } | null = null;

  if (extractedEntitiesMatch && extractedEntitiesMatch[1]) {
    let rawJsonString = extractedEntitiesMatch[1];

    try {
      rawJsonString = rawJsonString.replace(/'/g, '"');
      rawJsonString = rawJsonString.replace(/[\r\n\t]/g, "");
      rawJsonString = rawJsonString.replace(
        /("snippet":\s*)"(.*?)"(\s*,\s*\"[^\"]+\":\s*\[.*?\]|\s*,\s*\"[^\"]+\":\s*\".*?\"|\s*})$/s,
        (_match: string, prefix: string, value: string, suffix: string) => {
          const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
          return `${prefix}"${escapedValue}"${suffix}`;
        },
      );
      rawJsonString = rawJsonString.replace(/,\s*([}\]])/g, "$1");
      const parsedData = JSON.parse(rawJsonString);
      if (
        typeof parsedData === "object" &&
        parsedData !== null &&
        "senderName" in parsedData &&
        typeof parsedData.senderName === "string" &&
        "recipientNames" in parsedData &&
        "subjectTerms" in parsedData &&
        "date" in parsedData &&
        typeof parsedData.date === "string" &&
        "attachmentNames" in parsedData &&
        "snippet" in parsedData &&
        typeof parsedData.snippet === "string"
      ) {
        extractedEntities = {
          senderName: parsedData.senderName,
          date: parsedData.date,
          snippet: parsedData.snippet,
          recipientNames: Array.isArray(parsedData.recipientNames)
            ? parsedData.recipientNames
                .map((s: any) => String(s).trim())
                .filter(Boolean)
            : typeof parsedData.recipientNames === "string"
              ? parsedData.recipientNames
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : [],
          subjectTerms: Array.isArray(parsedData.subjectTerms)
            ? parsedData.subjectTerms
                .map((s: any) => String(s).trim())
                .filter(Boolean)
            : typeof parsedData.subjectTerms === "string"
              ? parsedData.subjectTerms
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : [],
          attachmentNames: Array.isArray(parsedData.attachmentNames)
            ? parsedData.attachmentNames
                .map((s: any) => String(s).trim())
                .filter(Boolean)
            : typeof parsedData.attachmentNames === "string"
              ? parsedData.attachmentNames
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : [],
        };
      } else {
        logger.warn(
          `Parsed JSON for email ${emailId} does not match expected ExtractedEntities structure.`,
        );
        extractedEntities = null;
      }
    } catch (e) {
      logger.error(
        `Error parsing ExtractedEntities JSON for email ${emailId}:`,
        e,
      );
      logger.error(
        `Malformed JSON string for email ${emailId} that caused the error: ${rawJsonString}`,
      );
      extractedEntities = null;
    }
  }

  await saveEmail(
    emailId,
    sender,
    dateReceived,
    subject,
    emailUrl,
    summary,
    urgencyScore,
    action,
    recipients,
    unsubscribeLink,
    classification,
    keywords,
    extractedEntities,
  );

  return {
    summary,
    urgencyScore,
    action,
    classification,
    keywords,
    extractedEntities,
  };
}

function countTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

async function saveEmail(
  emailId: string,
  sender: string,
  dateReceived: Date,
  subject: string,
  emailUrl: string,
  summary: string,
  urgencyScore: number,
  action: string,
  recipients: string[],
  unsubscribeLink?: string,
  classification?: string,
  keywords?: string[],
  extractedEntities?: {
    senderName: string;
    recipientNames: string[];
    subjectTerms: string[];
    date: string;
    attachmentNames: string[];
    snippet: string;
  } | null,
): Promise<Response> {
  try {
    const session = await validateUserSession();

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("emails");

    const emailOwner = session.user.sub;

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
      const encryptedKw = encrypt(JSON.stringify(keywords));
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

    const userCollection = db.collection("user");
    await userCollection.updateOne(
      { sub: emailOwner },
      { $inc: { total_emails_analyzed: 1 } },
    );
    if (loggingEnabled) {
      logger.info(`Successfully saved email ${emailId} to the database.`);
    }
    await collection.insertOne(emailDocument);

    return NextResponse.json({ message: "Email saved", email: emailDocument });
  } catch (error) {
    logger.error(`Error saving email ${emailId}:`, error);
    throw new Error("Failed to save email to database");
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateUserSession();
    if (loggingEnabled) {
      logger.info(
        `API request received from authenticated user: ${session.user.sub}`,
      );
    }

    const userId = session.user?.sub;
    if (!userId) {
      throw new CustomError("Invalid session data: User ID is missing.", 400);
    }

    const { searchParams } = new URL(req.url);
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "100", 10),
      200,
    );
    const pageToken = searchParams.get("pageToken") || undefined;

    if (loggingEnabled) {
      logger.info("Fetching Auth0 Management API token to get user profile.");
    }
    const managementToken = await getManagementApiToken();
    if (loggingEnabled) {
      logger.info(`Successfully retrieved management token.`);
    }

    if (loggingEnabled) {
      logger.info(`Fetching user profile for user: ${userId}.`);
    }
    const userProfile = await fetchUserProfile(managementToken, userId);
    if (loggingEnabled) {
      logger.info(`Successfully fetched user profile for user: ${userId}.`);
    }

    const idpAccessToken = userProfile.identities?.[0]?.access_token;
    if (!idpAccessToken) {
      logger.warn(`Google access token not found for user: ${userId}.`);
      return NextResponse.json(
        { message: "Google access token not found" },
        { status: 400 },
      );
    }

    if (loggingEnabled) {
      logger.info(
        `Starting email fetching and processing for user: ${userId}.`,
      );
    }
    const { emails, nextPageToken } = await getGmailEmails(
      idpAccessToken,
      pageSize,
      pageToken,
    );

    if (loggingEnabled) {
      logger.info(
        `Finished processing. Found ${emails.length} new emails for user: ${userId}.`,
      );
    }

    return NextResponse.json(
      {
        message:
          emails.length > 0
            ? "User profile and emails fetched successfully"
            : "No new emails found or all emails have been processed already",
        emails,
        nextPageToken,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(`Error in GET /api/gmail:`, error);
    return handleApiError(error, "GET /api/emails");
  }
}
