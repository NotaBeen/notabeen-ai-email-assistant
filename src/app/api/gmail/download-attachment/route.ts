// src\app\api\gmail\download-attachment\route.ts

export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import axios, { AxiosError } from "axios"; // Import AxiosError
import { MongoClient, ObjectId } from "mongodb";
import { CustomError } from "@/utils/errorHandler";
import { validateUserSession } from "@/lib/session-helpers";
import { getGoogleAccessToken } from "@/lib/auth";

// --- Minimal Type Definitions to avoid 'any' ---
interface MessagePart {
  partId: string;
  mimeType: string;
  filename?: string;
  body?: {
    data?: string;
    attachmentId?: string;
  };
  parts?: MessagePart[];
  // Other properties are not needed for this logic
}

// --- MongoDB Setup (Needed for fetching the access token) ---
const uri = process.env.MONGODB_URI ?? "";
const collectionName = process.env.MONGO_CLIENT ?? "";
const client = new MongoClient(uri);
const clientPromise = uri
  ? client.connect()
  : Promise.reject(new Error("MONGODB_URI is not defined"));

// --- Type Guard ---
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

// Removed - using validateUserSession and getGoogleAccessToken from lib

export async function GET(req: NextRequest) {
  try {
    // Validate the user's session first, so we don't rely on URL params for auth
    const session = await validateUserSession(req);

    const userId = session.user?.id;
    if (!userId) {
      throw new CustomError("Invalid session data: User ID is missing.", 400);
    }

    // Fetch decrypted token from the database
    const idpAccessToken = await getGoogleAccessToken(userId);

    if (!idpAccessToken) {
      return NextResponse.json(
        { error: "Google access token not found. Please re-authenticate." },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const emailId = searchParams.get("emailId");
    // Use partId instead of attachmentId to be consistent with the other file
    const partId = searchParams.get("partId");

    if (!emailId || !partId) {
      console.error("Error: Missing parameters for download request.");
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    // Fetch the full message with payload
    const messageResponse = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`,
      {
        headers: { Authorization: `Bearer ${idpAccessToken}` },
      },
    );

    const payload: MessagePart = messageResponse.data.payload;

    // Recursive search for matching part by partId
    // FIX: Replaced 'any[]' and 'any' with 'MessagePart[]' and 'MessagePart'
    const findPartByPartId = (
      parts: MessagePart[] | undefined,
      partId: string,
    ): MessagePart | null => {
      if (!parts) return null;

      for (const part of parts) {
        if (part.partId === partId) {
          return part;
        }

        if (part.parts) {
          const found = findPartByPartId(part.parts, partId);
          if (found) return found;
        }
      }
      return null;
    };

    // Correctly search the entire payload tree. Start by checking the top payload, then its parts.
    let part: MessagePart | null;
    if (payload.partId === partId) {
      part = payload;
    } else {
      part = findPartByPartId(payload.parts, partId);
    }

    if (!part) {
      return NextResponse.json(
        { error: "Attachment part not found" },
        { status: 404 },
      );
    }

    let attachmentData: string;

    if (part.body?.data) {
      // Inline or small attachment data is in the body
      attachmentData = part.body.data;
    } else if (part.body?.attachmentId) {
      // If there is an attachmentId, fetch the attachment data separately
      const attachmentResponse = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/attachments/${part.body.attachmentId}`,
        {
          headers: { Authorization: `Bearer ${idpAccessToken}` },
        },
      );
      attachmentData = attachmentResponse.data.data;
    } else {
      return NextResponse.json(
        { error: "No attachment data found in the specified part" },
        { status: 404 },
      );
    }

    const buffer = Buffer.from(attachmentData, "base64");

    // Return file to browser
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": part.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${part.filename || "download"}"`,
      },
    });
  } catch (error: unknown) {
    // FIX: Changed 'error: any' to 'error: unknown'
    console.error("Failed to download attachment:", error);

    // Check for 404/403 errors from Google API and return a helpful message
    if (isAxiosError(error) && error.response?.status) {
      if (error.response.status === 404) {
        return NextResponse.json(
          { error: "Attachment not found or access denied." },
          { status: 404 },
        );
      }
      if (error.response.status === 403) {
        return NextResponse.json(
          { error: "Insufficient permissions to download attachment." },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to download attachment" },
      { status: 500 },
    );
  }
}
