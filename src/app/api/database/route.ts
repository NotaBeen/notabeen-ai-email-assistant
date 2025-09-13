// src/app/api/database/route.ts

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Note: You must set the MONGODB_URI environment variable
// in your project's .env file.
const uri = process.env.MONGODB_URI;

// This API route provides a simple health check to ensure the
// database connection is working.
export async function GET() {
  // Always validate that your environment variables are set
  // to avoid runtime errors.
  if (!uri) {
    return NextResponse.json(
      { message: "Server configuration error: MONGODB_URI not defined" },
      { status: 500 },
    );
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();

    // The connection is successful.
    return NextResponse.json({ message: "Database connection successful" });
  } catch (error) {
    // If an error occurs, log it internally and return a generic
    // error message to the client.
    console.error("Error connecting to MongoDB:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
