import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

import { decrypt, encrypt } from "@/utils/crypto";

const collectionName = process.env.MONGO_CLIENT ?? "";

// Ensure MongoDB URI is defined
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

export async function GET() {
  try {
    const session = await auth0.getSession();

  if (!session?.user?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("user");

    const sub = session.user.sub;
    const user = await collection.findOne({ sub });

    const decryptedUser = user
      ? {
          ...user,
          email: decrypt(user.email, user.emailAuthTag),
          name: user.name ? decrypt(user.name, user.nameAuthTag) : null,
        }
      : null;

    if (!user) {
      const now = new Date();

      const encryptedEmail = encrypt(session.user.email || "");
      const encryptedName = session.user.name
        ? encrypt(session.user.name)
        : null;

      const newUser = {
        sub,
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
    }

    return NextResponse.json(decryptedUser, { status: 200 });
  } catch (error) {
    console.error("❌ Error in /getUser:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth0.getSession();

  if (!session?.user?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("user");

    const sub = session.user.sub;

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
    }

    const userExists = await collection.findOne({ sub });
    if (!userExists) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const updateResult = await collection.updateOne(
      { sub },
      { $set: { email_preferences: emailPreferences } },
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes made to user." },
        { status: 200 },
      );
    }

    const updatedUser = await collection.findOne({ sub });
    const decryptedUpdatedUser = updatedUser
      ? {
          ...updatedUser,
          email: decrypt(updatedUser.email, updatedUser.emailAuthTag),
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

export async function DELETE() {
  try {
    const session = await auth0.getSession();

  if (!session?.user?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const userCollection = db.collection("user");
    const emailsCollection = db.collection("emails");

    const sub = session.user.sub;

    // Delete user data
    const deleteUserResult = await userCollection.deleteOne({ sub });

    // Delete all emails associated with this user
    const deleteEmailsResult = await emailsCollection.deleteMany({ sub });

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
