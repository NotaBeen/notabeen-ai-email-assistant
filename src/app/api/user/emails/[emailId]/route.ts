// src\app\api\gmail\individual-email\route.ts

export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { MongoClient, ObjectId } from "mongodb";
import { CustomError, handleApiError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";
import { decodeBase64Url } from "@/utils/crypto";
import { auth } from "@/auth";

// --- MongoDB Setup (Needed for fetching the Google access token) ---
const uri = process.env.MONGODB_URI ?? "";
const collectionName = process.env.MONGO_CLIENT ?? "";
const client = new MongoClient(uri);
const clientPromise = uri
  ? client.connect()
  : Promise.reject(new Error("MONGODB_URI is not defined"));

// Interface for the attachment data structure
interface Attachment {
  filename: string;
  mimeType: string;
  data?: string;
  attachmentId?: string;
  partId?: string;
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

async function validateUserSession() {
  const session = await auth();
  if (!session || !session.user?.id) {
    // Use session.user.id for validation
    throw new CustomError("Unauthorized: Session or User ID is missing.", 401);
  }
  return session;
}

async function fetchGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    const clientConnection = await clientPromise;
    const db = clientConnection.db(collectionName);
    const collection = db.collection("accounts");

    const account = await collection.findOne({
      // NextAuth stores userId in the accounts table as an ObjectId
      userId: new ObjectId(userId),
      provider: "google",
    });

    return (account?.access_token as string) || null;
  } catch (error) {
    logger.error("Error fetching Google Access Token from database:", error);
    throw new Error("Error fetching Google Access Token");
  }
}

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

  const body = rawBodyPlain || rawBodyHtml;

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

  const { body, attachments } = await processEmailPayload(
    data.payload as MessagePart,
  );

  const finalBody = body || data.snippet || "";

  return { body: finalBody, attachments };
}

// --- Main GET Handler for Individual Email ---
export async function GET(req: NextRequest) {
  try {
    const session = await validateUserSession();

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

    // FIX: Replaced Auth0 logic with MongoDB token fetching
    const idpAccessToken = await fetchGoogleAccessToken(userId);

    if (!idpAccessToken) {
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
