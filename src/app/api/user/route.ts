// src\app\api\user\route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import crypto from "crypto";
import { validateUserSession } from "@/lib/session-helpers";

// --- Encryption/Decryption and MongoDB Setup (No Change) ---

const ALGORITHM = "aes-256-gcm";
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not defined");
}
if (!process.env.ENCRYPTION_IV) {
  throw new Error("ENCRYPTION_IV is not defined");
}
const SECRET_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes
const IV = process.env.ENCRYPTION_IV; // Must be 12 bytes for GCM
const collectionName = process.env.MONGO_CLIENT ?? "";

// Encryption function
function encrypt(text: string) {
  const iv = Buffer.from(IV, "utf-8");
  const secretKey = Buffer.from(SECRET_KEY, "utf-8");

  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv); // Encrypt the text

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex"); // Get the authentication tag

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    authTag: authTag.toString("hex"), // Store this along with the encrypted data
  };
}

function decrypt(encryptedData: string, authTag: string) {
  const iv = Buffer.from(IV, "utf-8"); // Same IV used during encryption
  const secretKey = Buffer.from(SECRET_KEY, "utf-8");

  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv); // Set the authentication tag

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Ensure MongoDB URI is defined
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

// -------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const session = await validateUserSession(req);

    // Use the unencrypted Better Auth User ID for deterministic lookup
    const nextAuthUserId = session.user.id;

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("user"); // ✅ FIX 1: Search by the unencrypted NextAuth user ID

    const user = await collection.findOne({
      nextAuthUserId: nextAuthUserId,
    });

    const decryptedUser = user
      ? {
          // Ensure we use the MongoDB _id from the custom 'user' document
          _id: user._id, // Decrypt sensitive fields
          email: user.email ? decrypt(user.email, user.emailAuthTag) : null,
          name: user.name ? decrypt(user.name, user.nameAuthTag) : null, // Keep other fields
          subscription: user.subscription,
          total_emails_analyzed: user.total_emails_analyzed,
          terms_acceptance: user.terms_acceptance,
          terms_acceptance_date: user.terms_acceptance_date,
          created_at: user.created_at,
          last_login: user.last_login,
          status: user.status,
          nextAuthUserId: user.nextAuthUserId,
        }
      : null;

    if (!user) {
      const now = new Date();

      const encryptedEmail = encrypt(session.user.email || "");
      const encryptedName = session.user.name
        ? encrypt(session.user.name)
        : null;

      const newUser = {
        // ✅ FIX 2: Store the unencrypted NextAuth User ID for future lookups
        nextAuthUserId: nextAuthUserId,
        email: encryptedEmail.encryptedData,
        emailAuthTag: encryptedEmail.authTag,
        name: encryptedName?.encryptedData || null,
        nameAuthTag: encryptedName?.authTag || null,
        subscription: {
          paid: false,
          start_date: now,
        },
        total_emails_analyzed: 0,
        terms_acceptance: false,
        terms_acceptance_date: null,
        created_at: now,
        last_login: now,
        status: "active",
      };

      const { insertedId } = await collection.insertOne(newUser);

      return NextResponse.json(
        { ...newUser, _id: insertedId },
        { status: 201 },
      );
    } // Update the user's last login
    // ✅ FIX 3: Update by the unencrypted NextAuth user ID

    await collection.updateOne(
      { nextAuthUserId: nextAuthUserId },
      { $set: { last_login: new Date() } },
    );

    return NextResponse.json(decryptedUser, { status: 200 });
  } catch (error) {
    console.error("❌ Error in /getUser:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await validateUserSession(req);
    const nextAuthUserId = session.user.id;

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("user");

    let body;
    try {
      body = await req.json();
    } catch (error: unknown) {
      return NextResponse.json({ message: String(error) }, { status: 400 });
    }

    const emailPreferences = body?.email_preferences;

    if (!Array.isArray(emailPreferences)) {
      return NextResponse.json(
        { message: "Invalid email_preferences format. Must be an array." },
        { status: 400 },
      );
    } // ✅ FIX 4: Find by the unencrypted NextAuth user ID

    const userExists = await collection.findOne({
      nextAuthUserId: nextAuthUserId,
    });
    if (!userExists) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    } // ✅ FIX 5: Update by the unencrypted NextAuth user ID

    const updateResult = await collection.updateOne(
      { nextAuthUserId: nextAuthUserId },
      { $set: { email_preferences: emailPreferences } },
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes made to user." },
        { status: 200 },
      );
    } // ✅ FIX 6: Find by the unencrypted NextAuth user ID

    const updatedUser = await collection.findOne({
      nextAuthUserId: nextAuthUserId,
    });
    const decryptedUpdatedUser = updatedUser
      ? {
          ...updatedUser,
          email: updatedUser.email
            ? decrypt(updatedUser.email, updatedUser.emailAuthTag)
            : null,
          name: updatedUser.name
            ? decrypt(updatedUser.name, updatedUser.nameAuthTag)
            : null,
        }
      : null;

    return NextResponse.json(decryptedUpdatedUser, { status: 200 });
  } catch (error) {
    console.error("❌ Error in PATCH /api/user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await validateUserSession(req);
    const nextAuthUserId = session.user.id;

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const userCollection = db.collection("user");
    const emailsCollection = db.collection("emails"); // Delete user data
    // ✅ FIX 7: Delete by the unencrypted NextAuth user ID

    const deleteUserResult = await userCollection.deleteOne({
      nextAuthUserId: nextAuthUserId,
    }); // Delete all emails associated with this user
    // ✅ FIX 8: Delete emails by the unencrypted NextAuth user ID (Assuming emails collection uses emailOwner with this ID)

    const deleteEmailsResult = await emailsCollection.deleteMany({
      emailOwner: nextAuthUserId,
    });

    if (deleteUserResult.deletedCount === 0) {
      return NextResponse.json(
        { message: "User not found or already deleted." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "User data and associated emails deleted successfully.",
        emailsDeleted: deleteEmailsResult.deletedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error in DELETE /api/user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
