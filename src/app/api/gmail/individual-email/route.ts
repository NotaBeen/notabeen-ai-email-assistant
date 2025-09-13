/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { CustomError, handleApiError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";
import { decodeBase64Url } from "@/utils/crypto";
import { validateUserSession } from "@/utils/auth";

// --- Auth0 Environment Variables ---
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`;

// Interface for the attachment data structure
interface Attachment {
  filename: string;
  mimeType: string;
  data?: string; // Data is optional as it's not needed for the frontend
  attachmentId?: string;
  partId?: string; // Add partId to the interface
}

// Function to get a management API token from Auth0
async function getManagementApiToken(): Promise<string> {
  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: AUDIENCE,
      grant_type: "client_credentials",
      scope: "read:users",
    });
    return response.data.access_token;
  } catch (error) {
    logger.error("Error fetching Management API token:", error);
    throw new CustomError("Failed to get Management API token", 500, false);
  }
}

interface UserProfile {
  identities?: { access_token?: string }[];
}

// Function to fetch the user's profile from Auth0
// REMOVED 'export' keyword
async function fetchUserProfile(
  managementToken: string,
  userId: string,
): Promise<UserProfile> {
  const url = `https://${AUTH0_DOMAIN}/api/v2/users/${userId}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${managementToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

// Corrected: Recursive function to parse email payload and fetch attachments
async function processEmailPayload(
  payload: any,
): Promise<{ body: string; attachments: Attachment[] }> {
  let rawBodyHtml = "";
  let rawBodyPlain = "";
  const attachments: Attachment[] = [];

  const extractParts = (part: any) => {
    // If the part has a filename, it's an attachment
    if (part?.filename) {
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
  const { body, attachments } = await processEmailPayload(data.payload);

  const finalBody = body || data.snippet || "";

  return { body: finalBody, attachments };
}

// --- Main GET Handler for Individual Email ---
export async function GET(req: NextRequest) {
  try {
    const session = await validateUserSession();

    if (!session.tokenSet.accessToken) {
      throw new CustomError(
        "Unauthorized: Access token missing from session.",
        401,
      );
    }

    const userId = session.user?.sub;
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

    const managementToken = await getManagementApiToken();
    const userProfile = await fetchUserProfile(managementToken, userId);
    const idpAccessToken = userProfile.identities?.[0]?.access_token;

    if (!idpAccessToken) {
      return NextResponse.json(
        { message: "Google access token not found in user's profile." },
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
