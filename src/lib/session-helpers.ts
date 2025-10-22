// src/lib/session-helpers.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { CustomError } from "@/utils/errorHandler";

/**
 * Helper to validate user session from Better Auth and return session object.
 *
 * @param req - NextRequest object containing headers with session cookie
 * @returns Session object with user information
 * @throws CustomError if session is invalid or user ID is missing
 */
export async function validateUserSession(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session || !session.user?.id) {
    throw new CustomError("Unauthorized: Session or User ID is missing.", 401);
  }

  return session;
}

/**
 * Utility type for Better Auth session
 */
export type BetterAuthSession = Awaited<ReturnType<typeof validateUserSession>>;
