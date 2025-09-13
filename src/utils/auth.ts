// src/utils/auth.ts
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server"; // Import NextResponse if you're using Next.js 13+ App Router

/**
 * Validates the user session and returns the session object.
 * If the session is invalid or the user is not authenticated, it throws a NextResponse with a 401 status.
 *
 * @returns {Promise<Session>} The Auth0 session object.
 * @throws {NextResponse} An unauthorized response if the session is invalid.
 */
export async function validateUserSession() {
  const session = await auth0.getSession();

  if (!session || !session.user?.sub) {
    // For Next.js App Router, you'd typically return a NextResponse.
    // In Pages Router API routes, you might directly use `res.status(401).json(...)`.
    // Assuming App Router context given your `GET` function.
    throw NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return session;
}
