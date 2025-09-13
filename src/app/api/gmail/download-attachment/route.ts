// src/app/api/gmail/download-attachment/route.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { CustomError } from "@/utils/errorHandler";
import { validateUserSession } from "@/utils/auth";
import { getManagementApiToken, fetchUserProfile } from "@/utils/auth0"; // <--- CORRECTED IMPORT PATH

export async function GET(req: NextRequest) {
  try {
    // Validate the user's session first, so we don't rely on URL params for auth
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

    // Now, get the required Google access token from the user's profile
    const managementToken = await getManagementApiToken();
    const userProfile = await fetchUserProfile(managementToken, userId);
    const idpAccessToken = userProfile.identities?.[0]?.access_token;

    if (!idpAccessToken) {
      return NextResponse.json(
        { error: "Google access token not found in user's profile." },
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

    const payload = messageResponse.data.payload;

    // Recursive search for matching part by partId
    const findPartByPartId = (parts: any[], partId: string): any | null => {
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

    // Correctly search the entire payload tree
    const part = findPartByPartId([payload], partId);

    if (!part) {
      return NextResponse.json(
        { error: "Attachment part not found" },
        { status: 404 },
      );
    }

    let attachmentData;

    if (part.body?.data) {
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
        { error: "No attachment data found" },
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
  } catch (error: any) {
    console.error("Failed to download attachment:", error);
    return NextResponse.json(
      { error: "Failed to download attachment" },
      { status: 500 },
    );
  }
}
