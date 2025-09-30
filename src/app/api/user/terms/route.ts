// src\app\api\user\terms\route.ts

/**
 * API Route: /api/user/terms
 * Method: POST
 * Purpose: Records the authenticated user's acceptance of the Terms and Conditions
 * in the MongoDB 'user' collection, setting 'terms_acceptance' to true and recording
 * 'terms_acceptance_date'.
 */

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { auth } from "@/auth";

// --- Configuration and MongoDB Setup ---

const MONGODB_URI = process.env.MONGODB_URI;
const COLLECTION_NAME = process.env.MONGO_CLIENT ?? ""; // Database name

// Strict environment validation
if (!MONGODB_URI) {
  throw new Error("CONFIGURATION ERROR: MONGODB_URI is not defined.");
}

// Global MongoClient instance
const client = new MongoClient(MONGODB_URI);

// --------------------------------------------------------------------------------------

/**
 * Handles the POST request to record terms acceptance.
 * @returns {Promise<NextResponse>} The response indicating success or failure.
 */
export async function POST(): Promise<NextResponse> {
  try {
    // 1. Session and Authorization Check
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Use the NextAuth User ID for lookup
    const nextAuthUserId = session.user.id;

    // 2. Database Operation
    await client.connect(); // Ensure connection is active
    const db = client.db(COLLECTION_NAME);
    const collection = db.collection("user");

    // Atomically update the user document
    const updateResult = await collection.updateOne(
      { nextAuthUserId: nextAuthUserId },
      {
        $set: {
          terms_acceptance: true,
          terms_acceptance_date: new Date(), // Record the current date and time
        },
      },
    );

    // 3. Response Handling
    if (updateResult.modifiedCount === 0) {
      // If the document wasn't modified, it was likely already true.
      // We return 200 as the desired state (terms accepted) has been met.
      return NextResponse.json(
        {
          message:
            "Terms acceptance status was already set or user document not found.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Terms and conditions accepted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error in POST /api/user/terms:", error);
    return NextResponse.json(
      { message: "Internal server error while accepting terms." },
      { status: 500 },
    );
  } finally {
    // Gracefully close the connection after the operation (or fail)
    await client.close();
  }
}
