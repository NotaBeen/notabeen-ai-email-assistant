import { Metadata } from "next";
import { CSPostHogProvider } from "./providers";
import RouteValidator from "./RouteValidator";
import ThemeRegistry from "@/components/ThemeRegistry";

// Metadata
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
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const isPostHogEnabled = POSTHOG_API_KEY && POSTHOG_HOST;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
        <ThemeRegistry>
          <RouteValidator>{WrappedChildren}</RouteValidator>
        </ThemeRegistry>
      </body>
    </html>
  );
}
