import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

import { auth0 } from "@/lib/auth0";
import { decryptOptional } from "@/utils/crypto";

type MaybeString = string | null | undefined;

type EmailRecord = Record<string, unknown>;

/**
 * MongoDB representation of an email document where sensitive fields are stored
 * in encrypted form alongside their respective authentication tags.
 */
interface EncryptedEmailDocument extends EmailRecord {
  sender?: MaybeString;
  senderAuthTag?: MaybeString;
  subject?: MaybeString;
  subjectAuthTag?: MaybeString;
  emailUrl?: MaybeString;
  emailUrlAuthTag?: MaybeString;
  summary?: MaybeString;
  summaryAuthTag?: MaybeString;
  action?: MaybeString;
  actionAuthTag?: MaybeString;
  urgencyScore?: MaybeString;
  urgencyScoreAuthTag?: MaybeString;
  emailId?: MaybeString;
  emailIdAuthTag?: MaybeString;
  userActionTaken?: MaybeString;
  userActionTakenAuthTag?: MaybeString;
  emailOwner?: MaybeString;
  emailOwnerAuthTag?: MaybeString;
  recipients?: MaybeString;
  recipientsAuthTag?: MaybeString;
  unsubscribeLink?: MaybeString;
  unsubscribeLinkAuthTag?: MaybeString;
  classification?: MaybeString;
  classificationAuthTag?: MaybeString;
  provider?: MaybeString;
  providerAuthTag?: MaybeString;
  keywords?: MaybeString;
  keywordsAuthTag?: MaybeString;
  extractedEntities?: MaybeString;
  extractedEntitiesAuthTag?: MaybeString;
  [key: string]: unknown;
}

/**
 * Removes authentication tag properties (e.g. `subjectAuthTag`) from an email
 * document, leaving only the data we intend to return to clients.
 */
function stripAuthTags(email: EmailRecord): EmailRecord {
  return Object.fromEntries(
    Object.entries(email).filter(([key]) => !key.endsWith("AuthTag")),
  );
}

/**
 * Safely parses the recipients array stored as an encrypted JSON string.
 */
function parseRecipients(value: MaybeString): unknown[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse recipients JSON:", value, error);
    return [];
  }
}

/**
 * Converts an encrypted comma-separated keyword list into a trimmed string
 * array.
 */
function parseKeywords(value: MaybeString): string[] {
  if (!value) {
    return [];
  }

  try {
    return value
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  } catch (error) {
    console.warn("Failed to parse keywords string:", value, error);
    return [];
  }
}

/**
 * Normalises string fields that may contain comma-separated values into arrays
 * so that consumers always receive consistent data structures.
 */
function normaliseCommaSeparatedField(
  payload: Record<string, unknown>,
  fieldName: string,
) {
  const fieldValue = payload[fieldName];
  if (typeof fieldValue === "string") {
    payload[fieldName] = fieldValue
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
}

/**
 * Parses the `extractedEntities` blob, cleaning up any nested comma-separated
 * strings in the process.
 */
function parseExtractedEntities(value: MaybeString): unknown {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;

    normaliseCommaSeparatedField(parsed, "recipientNames");
    normaliseCommaSeparatedField(parsed, "subjectTerms");
    normaliseCommaSeparatedField(parsed, "attachmentNames");

    return parsed;
  } catch (error) {
    console.warn("Failed to parse extractedEntities JSON:", value, error);
    return null;
  }
}

/**
 * Transforms a stored email document into its decrypted representation ready
 * for API responses.
 */
function buildDecryptedEmail(email: EncryptedEmailDocument): EmailRecord {
  const baseEmail = stripAuthTags(email);

  const decryptedRecipients = decryptOptional(
    email.recipients,
    email.recipientsAuthTag,
  );
  const decryptedKeywords = decryptOptional(
    email.keywords,
    email.keywordsAuthTag,
  );
  const decryptedExtractedEntities = decryptOptional(
    email.extractedEntities,
    email.extractedEntitiesAuthTag,
  );

  return {
    ...baseEmail,
    sender: decryptOptional(
      email.sender,
      email.senderAuthTag,
    ),
    subject: decryptOptional(
      email.subject,
      email.subjectAuthTag,
    ),
    emailUrl: decryptOptional(
      email.emailUrl,
      email.emailUrlAuthTag,
    ),
    summary: decryptOptional(
      email.summary,
      email.summaryAuthTag,
    ),
    action: decryptOptional(
      email.action,
      email.actionAuthTag,
    ),
    urgencyScore: decryptOptional(
      email.urgencyScore,
      email.urgencyScoreAuthTag,
    ),
    unsubscribeLink: decryptOptional(
      email.unsubscribeLink,
      email.unsubscribeLinkAuthTag,
    ),
    classification: decryptOptional(
      email.classification,
      email.classificationAuthTag,
    ),
    userActionTaken:
      email.userActionTaken && email.userActionTakenAuthTag
        ? decryptOptional(
            email.userActionTaken,
            email.userActionTakenAuthTag,
          )
        : email.userActionTaken,
    recipients: parseRecipients(decryptedRecipients),
    keywords: parseKeywords(decryptedKeywords),
    extractedEntities: parseExtractedEntities(decryptedExtractedEntities),
  };
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();
const collectionName = process.env.MONGO_CLIENT ?? "";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const emailOwner = session.user.sub;

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
  const collection = db.collection<EncryptedEmailDocument>("emails");

    const emails = await collection
      .find({ emailOwner })
      .sort({ received_at: -1 })
      .toArray();

    const decryptedEmails = emails.map(buildDecryptedEmail);

    return NextResponse.json({
      message: decryptedEmails.length
        ? "Emails retrieved and decrypted successfully"
        : "No emails found",
      emails: decryptedEmails,
    });
  } catch (error) {
    console.error("Error retrieving emails:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Ensure TTL index for email retention (30 days)
async function ensureEmailTTLIndex() {
  const clientConnection = await clientPromise;
  const db = clientConnection.db(collectionName);
  const collection = db.collection("emails");
  // Create TTL index if it doesn't exist
  await collection.createIndex(
    { received_at: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 30 }, // 30 days
  );
}
// Call on module load
ensureEmailTTLIndex().catch(console.error);
