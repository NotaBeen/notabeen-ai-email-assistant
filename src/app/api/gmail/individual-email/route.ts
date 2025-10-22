// src\app\api\gmail\individual-email\route.ts

export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
// 🗑️ REMOVED: MongoClient, ObjectId imports as they are no longer needed
// import { MongoClient, ObjectId } from "mongodb";
import { CustomError, handleApiError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";
import { decodeBase64Url } from "@/utils/crypto";
import { validateUserSession } from "@/lib/session-helpers";
import { getGoogleAccessToken } from "@/lib/auth";

// 🗑️ REMOVED: MongoDB Setup
/*
const uri = process.env.MONGODB_URI ?? "";
const collectionName = process.env.MONGO_CLIENT ?? "";
const client = new MongoClient(uri);
const clientPromise = uri
  ? client.connect()
  : Promise.reject(new Error("MONGODB_URI is not defined"));
*/

// Interface for the attachment data structure returned to the frontend
interface Attachment {
  filename: string;
  mimeType: string;
  data?: string; // Data is optional as it's not needed for the frontend
  attachmentId?: string;
  partId?: string; // Add partId to the interface
}

// Interface for the recursive structure of a Gmail API message payload part
interface MessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  body?: {
    data?: string;
    attachmentId?: string;
    size?: number;
  };
  parts?: MessagePart[];
}

// Removed - using validateUserSession from session-helpers

// Corrected: Recursive function to parse email payload and fetch attachments
async function processEmailPayload(
  payload: MessagePart,
): Promise<{ body: string; attachments: Attachment[] }> {
  let rawBodyHtml = "";
  let rawBodyPlain = "";
  const attachments: Attachment[] = [];

  const extractParts = (part: MessagePart) => {
    // If the part has a filename, it's an attachment
    if (part?.filename && part.mimeType) {
      // Ensure mimeType exists
      // Check if it's an attachment that requires a separate fetch
      if (part?.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          attachmentId: part.body.attachmentId,
          partId: part.partId, // Add partId for reference
        });
      } else if (part?.body?.data) {
        // Handle inline or small attachments that have data directly in the payload
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          data: part.body.data,
          partId: part.partId,
        });
      }
    } else if (part?.mimeType === "text/html" && part?.body?.data) {
      rawBodyHtml = decodeBase64Url(part.body.data);
    } else if (part?.mimeType === "text/plain" && part?.body?.data) {
      rawBodyPlain = decodeBase64Url(part.body.data);
    }

    if (part?.parts) {
      part.parts.forEach(extractParts);
    }
  };

  if (payload) {
    extractParts(payload);
  }

  const body = rawBodyHtml || rawBodyPlain; // Prefer HTML body if available

  return { body, attachments };
}

// Function to fetch and process a single email
async function fetchFullMessageDetails(
  messageId: string,
  accessToken: string,
): Promise<{ body: string; attachments: Attachment[] }> {
  const response = await axios.get(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  const data = response.data;
  const { body, attachments } = await processEmailPayload(data.payload);

  const finalBody = body || data.snippet || "";

  return { body: finalBody, attachments };
}

// --- Main GET Handler for Individual Email ---
export async function GET(req: NextRequest) {
  try {
    const session = await validateUserSession(req);

    const userId = session.user?.id;
    if (!userId) {
      throw new CustomError("Invalid session data: User ID is missing.", 400);
    }

    const { searchParams } = new URL(req.url);
    const emailId = searchParams.get("emailId");

    if (!emailId) {
      return NextResponse.json(
        { message: "Missing required query parameter: emailId" },
        { status: 400 },
      );
    }

    // Fetch decrypted access token from database
    const idpAccessToken = await getGoogleAccessToken(userId);

    if (!idpAccessToken) {
      logger.warn(
        `Google access token not found in database for user: ${userId}.`,
      );
      return NextResponse.json(
        {
          message:
            "Google access token not found. Please re-authenticate with Google.",
        },
        { status: 400 },
      );
    }

    const emailData = await fetchFullMessageDetails(emailId, idpAccessToken);

    if (!emailData.body && emailData.attachments.length === 0) {
      return NextResponse.json(
        { message: `Email with ID ${emailId} not found or is empty.` },
        { status: 404 },
      );
    }

    // Return the email body and the list of attachments
    return NextResponse.json(
      {
        message: "Email and attachments fetched successfully",
        email: emailData.body,
        attachments: emailData.attachments.map((att) => ({
          filename: att.filename,
          mimeType: att.mimeType,
          // Correctly use the partId for the download URL
          downloadUrl: `/api/gmail/download-attachment?emailId=${emailId}&partId=${att.partId}`,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, "GET /api/gmail/individual-email");
  }
}
