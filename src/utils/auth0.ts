// src/utils/auth0.ts

import axios from "axios";
import { CustomError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";

// --- Auth0 Environment Variables ---
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`;

interface UserProfile {
  identities?: { access_token?: string }[];
}

// Function to get a management API token from Auth0
export async function getManagementApiToken(): Promise<string> {
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

// Function to fetch the user's profile from Auth0
export async function fetchUserProfile(
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
