// src/app/SessionWrapper.tsx
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
// Import Session type from NextAuth for explicit type safety
import { Session } from "next-auth";

interface SessionWrapperProps {
  /** The child components that need access to the session data. */
  children: React.ReactNode;
  /**
   * The NextAuth session object fetched on the server-side in RootLayout.
   * Passing the session object directly avoids an extra fetch call on the client.
   */
  session: Session | null;
}

/**
 * SessionWrapper is a client component that wraps the application
 * with NextAuth's SessionProvider.
 *
 * It receives the session object pre-fetched on the server (in `layout.tsx`)
 * and passes it to the provider, making it available globally via `useSession()`.
 * This pattern optimizes initial load time by preventing a flickering "loading" state
 * when the client tries to fetch the session after hydration.
 *
 * @param {SessionWrapperProps} props - The component props.
 * @returns {JSX.Element} The NextAuth SessionProvider wrapping the children.
 */
export default function SessionWrapper({
  children,
  session,
}: SessionWrapperProps) {
  // The SessionProvider component must be a client component.
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
