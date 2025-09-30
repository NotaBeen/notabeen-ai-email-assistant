// src/app/layout.tsx

import { Metadata } from "next";
import { CSPostHogProvider } from "./providers";
import RouteValidator from "./RouteValidator";
import ThemeRegistry from "@/components/ThemeRegistry";
import { auth } from "../auth"; // Import the server-side 'auth' function from your config
import SessionWrapper from "./SessionWrapper"; // Import the client component wrapper

// ---
// Metadata remains the same
// ---
export const metadata: Metadata = {
  title: {
    default: "NotaBeen - Cut Email Time in Half. Get Back to What Matters.",
    template: "%s | NotaBeen",
  },
  description:
    "An AI assistant that sorts, summarizes, and prioritizes your professional Gmail, so you can spend less time on clutter and more time on high-impact work. The project is open-source and built for professionals who want to stop inbox anxiety.",
  applicationName: "NotaBeen",
  keywords: [
    "AI email assistant",
    "email productivity",
    "inbox management",
    "Gmail assistant",
    "email anxiety",
    "prioritize emails",
    "email summarization",
    "AI for professionals",
    "open-source email",
  ],
  authors: [
    {
      name: "Curtis Thomas",
      url: "https://www.linkedin.com/in/curtisthomas-dev/",
    },
  ],
  creator: "Curtis Thomas",
  openGraph: {
    title: "NotaBeen: Cut Email Time in Half. Get Back to What Matters.",
    description:
      "An AI assistant that sorts, summarizes, and prioritizes your professional Gmail to reduce clutter and stress. This is an open-source project.",
    url: "https://www.notabeen.com",
    siteName: "NotaBeen",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "NotaBeen product screenshot with a clear, organized inbox.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

// ---
// Root Layout Component
// ---
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const isPostHogEnabled = POSTHOG_API_KEY && POSTHOG_HOST;

/**
 * The RootLayout component is a Server Component that wraps the entire application.
 * It fetches the NextAuth session on the server and passes it to the client-side
 * SessionWrapper.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The children components to be rendered.
 * @returns {JSX.Element} The root HTML structure for the application.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetch the NextAuth session using the server-side 'auth' function
  const session = await auth();

  // Use a conditional wrapper for the PostHog provider
  const WrappedChildren = isPostHogEnabled ? (
    <CSPostHogProvider>{children}</CSPostHogProvider>
  ) : (
    <>{children}</>
  );

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#ffffff",
        }}
      >
        {/* Pass the server-fetched session to the client provider wrapper */}
        <SessionWrapper session={session}>
          <ThemeRegistry>
            <RouteValidator>{WrappedChildren}</RouteValidator>
          </ThemeRegistry>
        </SessionWrapper>
      </body>
    </html>
  );
}
