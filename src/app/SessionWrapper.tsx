// src/app/SessionWrapper.tsx
"use client";

import React from "react";

interface SessionWrapperProps {
  /** The child components that need access to the session data. */
  children: React.ReactNode;
}

/**
 * SessionWrapper is now a simple pass-through wrapper.
 * Better Auth manages its own session context internally via React Context,
 * so no provider wrapper is needed like NextAuth's SessionProvider.
 *
 * This component is kept for potential future middleware or wrappers,
 * and to maintain the component structure.
 *
 * @param {SessionWrapperProps} props - The component props.
 * @returns {JSX.Element} The children without any wrapping provider.
 */
export default function SessionWrapper({
  children,
}: SessionWrapperProps) {
  // Better Auth doesn't require a provider wrapper
  return <>{children}</>;
}
