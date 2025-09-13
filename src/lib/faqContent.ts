// src/lib/faqContent.ts
// Contains ALL FAQ content and text - no hardcoded strings in components

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface FaqSection {
  id: string;
  title: string;
  content: string;
  category: string;
  highlighted?: boolean;
  hasTable?: boolean;
  table?: TableData;
}

// Page content
export const faqPageContent = {
  // Header section
  header: {
    title: "FAQ",
    subtitle: "Frequently asked questions about NotaBeen and data processing.",
    badge: "Your privacy and security are our top priorities",
  },

  // Overview section
  overview: {
    title: "Data Processing & Privacy",
    description:
      "This FAQ covers what data we collect through analytics and how we process your emails while maintaining the highest privacy standards.",
  },

  // FAQ section
  faqSection: {
    title: "Frequently Asked Questions",
  },

  // Contact section
  contact: {
    title: "🔒 Your Data Security is Our Top Priority",
    description:
      "If you have any questions about our data handling practices, please",
    contactText: "contact us",
    email: "contact@NotaBeen.com",
  },
};

// FAQ sections data
export const faqSections: FaqSection[] = [
  {
    id: "panel1",
    title: "Data Collected by PostHog Analytics",
    content: "Below is a detailed list of data collected by PostHog Analytics:",
    category: "Analytics",
    highlighted: true,
    hasTable: true,
    table: {
      headers: ["Data Type", "Examples", "Purpose"],
      rows: [
        [
          "Event Data",
          "Pageviews, clicks, form submissions, custom events",
          "User behavior analytics",
        ],
        [
          "User & Device Metadata",
          "IP address, browser type, OS, screen resolution",
          "Technical optimization",
        ],
        [
          "Session Data",
          "Mouse movements, interactions, page scrolls",
          "Session recording & heatmaps",
        ],
        [
          "User Identity Data",
          "User ID, email, name (if provided)",
          "Account management",
        ],
        [
          "Backend & API Analytics",
          "API requests, feature flags, error tracking",
          "Performance monitoring",
        ],
        [
          "Infrastructure Metrics",
          "Load times, query performance",
          "System optimization",
        ],
      ],
    },
  },
  {
    id: "panel2",
    title: "Event Data (User Behavior Analytics)",
    content:
      '• Pageviews and screenviews\n• Clicks on elements (buttons, links, etc.)\n• Form submissions\n• Custom events defined by developers (e.g., "Added to Cart", "Signed Up")\n• Time spent on pages\n• Scroll depth and interactions\n• Errors and exceptions (frontend and backend)\n• API requests and responses (if instrumented)\n• Feature flag usage\n• A/B test variations seen',
    category: "Analytics",
  },
  {
    id: "panel3",
    title: "User & Device Metadata",
    content:
      "• IP address (can be disabled for privacy)\n• User agent (browser type, version)\n• Operating system and version\n• Device type (mobile, desktop, tablet)\n• Screen resolution\n• Language preferences\n• Referrer URL (where the user came from)\n• UTM parameters (campaign tracking)\n• Custom properties (set by developers)",
    category: "Analytics",
  },
  {
    id: "panel4",
    title: "Session Data (Session Recording & Heatmaps)",
    content:
      "• Mouse movements\n• Clicks and interactions\n• Form field inputs (can be masked for privacy)\n• Page scrolls and navigation history\n• Errors encountered during a session",
    category: "Analytics",
  },
  {
    id: "panel5",
    title: "User Identity Data (If Provided)",
    content:
      "• User ID (if assigned by your system)\n• Email (if captured)\n• Name and profile data (if captured)\n• Custom properties (e.g., subscription type, account status)",
    category: "Analytics",
  },
  {
    id: "panel6",
    title: "Backend & API Analytics",
    content:
      "• API request logs and performance\n• Feature flag evaluations\n• Error tracking (Sentry integration possible)\n• Backend event tracking (e.g., database changes)",
    category: "Analytics",
  },
  {
    id: "panel7",
    title: "Infrastructure & Performance Metrics",
    content:
      "• Load times and page speed\n• API request duration\n• Database query times (if instrumented)\n• Server-side event logging (if enabled)",
    category: "Analytics",
  },
  {
    id: "panel8",
    title: "Privacy & Compliance Considerations",
    content:
      "• IP Address: Can be anonymized.\n• GDPR Compliance: Supports data deletion requests.\n• Self-hosted Option: Allows full control over data.\n• Session Recording Redaction: Can exclude sensitive fields from being recorded.",
    category: "Privacy",
    highlighted: true,
  },
  {
    id: "panel9",
    title: "Email Analysis Processing",
    content:
      "NotaBeen does not store original emails. Instead, only the processed version is kept, which includes:\n\n• Summary: A concise description of the main message of the email.\n• Key Action Points: A list of important actions the recipient should take.\n• Urgency Score: A numerical rating (1-100) indicating the urgency of the email.\n\nThis ensures that only structured summaries are retained, maintaining privacy and security best practices.",
    category: "Email Processing",
    highlighted: true,
  },
];
