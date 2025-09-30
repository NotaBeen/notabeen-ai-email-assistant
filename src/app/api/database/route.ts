// src/app/api/database/route.ts

/**
 * API Route: /api/database
 * Purpose: A simple health check endpoint to test and confirm connectivity
 * to the MongoDB database.
 */

// Explicitly set the runtime environment to Node.js for server-side operations
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

/**
 * Handles GET requests for the database health check.
 * * 1. Checks for the required MONGODB_URI environment variable.
 * 2. Attempts to establish a connection to MongoDB using MongoClient.
 * 3. Immediately closes the connection after a successful test.
 * 4. Catches connection errors and returns a 500 status.
 * * @returns {Promise<NextResponse>} JSON response indicating connection status.
 */
export async function GET(): Promise<NextResponse> {
  const uri = process.env.MONGODB_URI;

  // Configuration check: MONGODB_URI must be present.
  if (!uri) {
    console.error("CONFIGURATION ERROR: MONGODB_URI is not defined.");
    return NextResponse.json(
      { message: "Server configuration error: MONGODB_URI not defined" },
      { status: 500 },
    );
  }

  try {
    const client = new MongoClient(uri);

    // Attempt to connect to the database.
    await client.connect();

    // Success: Close the connection immediately to free up resources.
    await client.close();

    return NextResponse.json(
      { message: "Database connection successful" },
      { status: 200 },
    );
  } catch (error) {
    // Failure: Log the detailed error internally but return a generic 500 to the client.
    console.error("❌ Error connecting to MongoDB during health check:", error);
    return NextResponse.json(
      { message: "Internal Server Error: Database connection failed" },
      { status: 500 },
    );
  }
}
