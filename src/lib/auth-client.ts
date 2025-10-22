// src/lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export all client-side auth methods
export const {
  signIn,
  signOut,
  useSession,
  // Additional exports for convenience
  signUp,
  updateUser,
  changePassword,
  resetPassword,
  forgetPassword,
} = authClient;
