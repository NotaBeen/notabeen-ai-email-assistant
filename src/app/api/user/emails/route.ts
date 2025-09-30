import { NextResponse } from "next/server";
import { MongoClient } from "mongodb"; // Import ObjectId for querying by _id
import crypto from "crypto";

// 🚨 NEW: Import the auth function from your Auth.js config
import { auth } from "@/auth";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const ALGORITHM = "aes-256-gcm";
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not defined");
}
if (!process.env.ENCRYPTION_IV) {
  throw new Error("ENCRYPTION_IV is not defined");
}
const SECRET_KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.ENCRYPTION_IV;

// Validate environment variables
if (!SECRET_KEY || SECRET_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte string.");
}
if (!IV || IV.length !== 12) {
  // IV for GCM is typically 12 bytes (96 bits)
  throw new Error("ENCRYPTION_IV must be a 12-byte string.");
}

function decrypt(
  encryptedData: string | undefined,
  authTag: string | undefined,
): string | null {
  if (!encryptedData || !authTag) {
    return null;
  }

  try {
    const ivBuffer = Buffer.from(IV, "utf8");
    const secretKeyBuffer = Buffer.from(SECRET_KEY, "utf8");

    if (ivBuffer.length !== 12) {
      console.error("Invalid IV length for GCM decryption.");
      return null;
    }
    if (secretKeyBuffer.length !== 32) {
      console.error("Invalid SECRET_KEY length for GCM decryption.");
      return null;
    }

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      secretKeyBuffer,
      ivBuffer,
    );
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    console.error("Encrypted Data:", encryptedData);
    console.error("Auth Tag:", authTag);
    return null;
  }
}

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();
const collectionName = process.env.MONGO_CLIENT ?? "";

export async function GET() {
  try {
    // 🚨 NextAuth Change: Use the new auth() function to get the session
    const session = await auth();

    // 🚨 NextAuth Change: Check for session existence and use session.user.id
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🚨 NextAuth Change: Use the NextAuth User ID (MongoDB _id) as the owner identifier
    // This assumes your email collection was updated to use the NextAuth user ID.
    const emailOwner = session.user.id;

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("emails");

    // 🚨 NextAuth Change: Query using the NextAuth User ID string (which is the MongoDB _id)
    const emails = await collection
      .find({ emailOwner })
      .sort({ received_at: -1 })
      .toArray();

    const decryptedEmails = emails.map((email) => {
      // Create a new object to build the cleaned, decrypted email
      const cleanedEmail: { [key: string]: unknown } = { ...email };

      // --- Decrypt and Assign fields ---
      cleanedEmail.sender = decrypt(email.sender, email.senderAuthTag);
      cleanedEmail.subject = decrypt(email.subject, email.subjectAuthTag);
      cleanedEmail.emailUrl = decrypt(email.emailUrl, email.emailUrlAuthTag);
      cleanedEmail.summary = decrypt(email.summary, email.summaryAuthTag);
      cleanedEmail.action = decrypt(email.action, email.actionAuthTag);
      cleanedEmail.urgencyScore = decrypt(
        email.urgencyScore,
        email.urgencyScoreAuthTag,
      );
      cleanedEmail.emailId = email.emailId;
      cleanedEmail.unsubscribeLink = decrypt(
        email.unsubscribeLink,
        email.unsubscribeLinkAuthTag,
      );
      cleanedEmail.classification = decrypt(
        email.classification,
        email.classificationAuthTag,
      );
      cleanedEmail.provider = email.provider;

      // Handle optional fields
      cleanedEmail.userActionTaken =
        email.userActionTaken && email.userActionTakenAuthTag
          ? decrypt(email.userActionTaken, email.userActionTakenAuthTag)
          : email.userActionTaken;

      // emailOwner is assumed plaintext for querying and is the NextAuth User ID
      cleanedEmail.emailOwner = email.emailOwner;

      // --- Decrypt and Parse JSON/String-to-Array fields ---
      const decryptedRecipients = decrypt(
        email.recipients,
        email.recipientsAuthTag,
      );
      try {
        cleanedEmail.recipients = decryptedRecipients
          ? JSON.parse(decryptedRecipients)
          : [];
      } catch (e) {
        console.warn(
          "Failed to parse recipients JSON:",
          decryptedRecipients,
          e,
        );
        cleanedEmail.recipients = []; // Fallback
      }

      const decryptedKeywords = decrypt(email.keywords, email.keywordsAuthTag);
      try {
        cleanedEmail.keywords = decryptedKeywords
          ? decryptedKeywords
              .split(",")
              .map((k: string) => k.trim())
              .filter(Boolean)
          : [];
      } catch (e) {
        console.warn("Failed to parse keywords string:", decryptedKeywords, e);
        cleanedEmail.keywords = []; // Fallback
      }

      const decryptedExtractedEntities = decrypt(
        email.extractedEntities,
        email.extractedEntitiesAuthTag,
      );
      if (decryptedExtractedEntities) {
        try {
          const parsedExtractedEntities = JSON.parse(
            decryptedExtractedEntities,
          );
          // Further ensure array fields within extractedEntities are correctly parsed if they might be strings
          if (
            parsedExtractedEntities &&
            typeof parsedExtractedEntities.recipientNames === "string"
          ) {
            parsedExtractedEntities.recipientNames =
              parsedExtractedEntities.recipientNames
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
          }
          if (
            parsedExtractedEntities &&
            typeof parsedExtractedEntities.subjectTerms === "string"
          ) {
            parsedExtractedEntities.subjectTerms =
              parsedExtractedEntities.subjectTerms
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
          }
          if (
            parsedExtractedEntities &&
            typeof parsedExtractedEntities.attachmentNames === "string"
          ) {
            parsedExtractedEntities.attachmentNames =
              parsedExtractedEntities.attachmentNames
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
          }
          cleanedEmail.extractedEntities = parsedExtractedEntities;
        } catch (e) {
          console.warn(
            "Failed to parse extractedEntities JSON:",
            decryptedExtractedEntities,
            e,
          );
          cleanedEmail.extractedEntities = null; // Fallback
        }
      } else {
        cleanedEmail.extractedEntities = null;
      }

      // --- Remove AuthTags ---
      // Using 'delete' to remove the properties from the object
      delete cleanedEmail.senderAuthTag;
      delete cleanedEmail.subjectAuthTag;
      delete cleanedEmail.emailUrlAuthTag;
      delete cleanedEmail.summaryAuthTag;
      delete cleanedEmail.urgencyScoreAuthTag;
      delete cleanedEmail.actionAuthTag;
      delete cleanedEmail.emailIdAuthTag;
      delete cleanedEmail.userActionTakenAuthTag; // If it exists
      delete cleanedEmail.emailOwnerAuthTag; // If it exists (though assumed plaintext)
      delete cleanedEmail.recipientsAuthTag;
      delete cleanedEmail.unsubscribeLinkAuthTag;
      delete cleanedEmail.classificationAuthTag;
      delete cleanedEmail.providerAuthTag;
      delete cleanedEmail.keywordsAuthTag;
      delete cleanedEmail.extractedEntitiesAuthTag;

      return cleanedEmail;
    });

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
