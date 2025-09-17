// src/app/api/database/route.ts

/**
 * @fileoverview This API route provides a simple health check to ensure the
 * database connection is working correctly. It is a GET request handler
 * for the '/api/database' endpoint.
 */

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

/**
 * Handles GET requests to the database health check endpoint.
 * It verifies the existence of the MONGODB_URI environment variable
 * and attempts to establish a connection to the database.
 * @returns {Promise<NextResponse>} A JSON response indicating the
 * database connection status.
 */
export async function GET(): Promise<NextResponse> {
  const uri = process.env.MONGODB_URI;

  // Return an error if the required environment variable is not defined.
  if (!uri) {
    return NextResponse.json(
      { message: "Server configuration error: MONGODB_URI not defined" },
      { status: 500 },
    );
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();

    return NextResponse.json({ message: "Database connection successful" });
  } catch (error) {
    // Return a generic server error for security and to prevent leaking
    // internal details in production.
    console.error("Error connecting to MongoDB:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
