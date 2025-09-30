// src/lib/database/user-db.ts

import { MongoClient, ObjectId } from "mongodb";
import { logger } from "@/utils/logger";

// --- MongoDB Setup ---
const uri = process.env.MONGODB_URI ?? "";
const collectionName = process.env.MONGO_CLIENT ?? "";
const client = new MongoClient(uri);
const clientPromise = uri
  ? client.connect()
  : Promise.reject(new Error("MONGODB_URI is not defined"));

// Define a placeholder or actual type for the User Document
interface UserDocument {
  _id: ObjectId;
  total_emails_analyzed?: number;
  // Add other user fields here, e.g., total_emails_analyzed
  // Ensure this matches your 'users' collection schema
}

// Define a placeholder type for the Email Document
// Replace this with your actual, detailed interface if available.
interface EmailDocument {
  emailId: string;
  userId: ObjectId;
  // other encrypted/processed email fields
  [key: string]: unknown;
}

/**
 * Fetches the Google Access Token for a given user from the NextAuth 'accounts' collection.
 * @param userId The MongoDB ObjectId string of the user.
 * @returns The Google access token string or null.
 */
export async function fetchGoogleAccessToken(
  userId: string,
): Promise<string | null> {
  try {
    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("accounts"); // 🚨 DEBUG LOG 1: Show the query parameters being used

    logger.info(
      `[DB_DEBUG] Attempting query on DB: ${collectionName}, Collection: accounts. UserId: ${userId}`,
    );
    // The string ID from the session must be converted back to an ObjectId for lookup.

    const account = await collection.findOne({
      userId: new ObjectId(userId), // <-- FIX applied here
      provider: "google",
    }); // 🚨 DEBUG LOG 2: Show the result of the query

    if (account) {
      logger.info(
        `[DB_DEBUG] Account found. Access token length: ${account.access_token?.length || 0}`,
      );
    } else {
      logger.warn(`[DB_DEBUG] Query returned no account for userId: ${userId}`);
    }

    return (account?.access_token as string) || null;
  } catch (error) {
    // 🚨 DEBUG LOG 3: Catch and log any connection or query errors
    logger.error(
      "[DB_DEBUG] FATAL Error fetching Google Access Token from database:",
      error,
    );
    throw new Error("Error fetching Google Access Token");
  }
}

/**
 * Fetches the user document from the NextAuth 'users' collection.
 * @param userId The MongoDB ObjectId of the user.
 * @returns The user document or null.
 */
export async function fetchUserFromDatabase(
  userId: string,
): Promise<UserDocument | null> {
  try {
    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("users");

    return (await collection.findOne({
      _id: new ObjectId(userId),
    })) as UserDocument | null;
  } catch (error) {
    logger.error("Error fetching user from database:", error);
    throw new Error("Error fetching user from database");
  }
}

/**
 * Checks if an email has already been processed and saved to the 'emails' collection.
 * @param messageId The unique Gmail message ID.
 * @returns True if the email exists, false otherwise.
 */
export async function isEmailProcessed(messageId: string): Promise<boolean> {
  try {
    const emailCollection = (await clientPromise)
      .db(collectionName)
      .collection("emails");

    const email = await emailCollection.findOne({ emailId: messageId });
    return !!email;
  } catch (error) {
    logger.error(`Error checking if email ${messageId} is processed:`, error);
    throw new Error("Database check failed");
  }
}

/**
 * Saves a processed email document and updates the user's analyzed email count.
 * @param emailDocument The fully prepared, encrypted email document.
 * @param emailOwner The user's MongoDB ObjectId.
 */
export async function saveEmailAndIncrementCount(
  emailDocument: EmailDocument,
  emailOwner: string,
): Promise<void> {
  try {
    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const emailCollection = db.collection("emails");
    const userCollection = db.collection("users");

    await emailCollection.insertOne(emailDocument);

    await userCollection.updateOne(
      { _id: new ObjectId(emailOwner) },
      { $inc: { total_emails_analyzed: 1 } },
    );
  } catch (error) {
    logger.error(
      `Error saving email to database for user ${emailOwner}:`,
      error,
    );
    throw new Error("Failed to save email to database");
  }
}
