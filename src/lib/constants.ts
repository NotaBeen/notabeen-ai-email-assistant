// src/lib/constants.ts

import { FieldProps } from "@/types/interfaces";

export const landing_page_navigation = [
  { name: "Home", address: "/" },
  { name: "Pricing", address: "/pricing" },
  { name: "About Us", address: "/about" },
];

export const footer_links = {
  routes: [
    {
      title: "Policy",
      links: [
        { title: "Cookie Policy", url: "/cookie-policy" },
        { title: "Privacy Policy", url: "/privacy-policy" },
      ],
    },
    {
      title: "Product",
      links: [{ title: "Pricing", url: "/pricing" }],
    },
    {
      title: "Company",
      links: [{ title: "About", url: "/about" }],
    },
  ],
  social_media: [
    { title: "LinkedIn", url: "https://www.linkedin.com/company/NotaBeen" },
  ],
};

export const feedback_form: FieldProps[] = [
  {
    id: "user_email_id",
    name: "user_email",
    label: "Email Address",
    placeholder: "Write Email Address",
    type: "email",
    required: true,
  },
  {
    id: "feedback_type_id",
    name: "feedback_type",
    label: "Feedback Type",
    placeholder: "Choose Feedback Type",
    menuItems: [
      "Bug Report",
      "Feature Request",
      "General Inquiry",
      "Feature Feedback",
      "Complaint",
      "General Feedback",
      "Other",
    ],
    type: "select",
    required: true,
  },
  {
    id: "feature_name_id",
    name: "feature_name",
    label: "Specific Feature",
    placeholder: "Choose Feature",
    menuItems: [
      "Generic Email Prioritization",
      "Enhanced Email Search & Retrieval",
      "Individual Email Summarization",
      "Basic Clutter & Spam Reduction",
      "GDPR Compliance & Security",
    ],
    type: "select",
    required: true,
  },
  {
    id: "feedback_message_id",
    name: "feedback_message",
    label: "Feedback Message",
    placeholder: "Write Feedback Message",
    type: "textarea",
    required: true,
  },
  {
    id: "rating_id",
    name: "rating",
    label: "Rating",
    type: "rating",
    required: true,
  },
];

export const terms_conditions = {
  last_updated_at: "April 21, 2025",
  terms: [
    {
      id: 1,
      title: "Introduction",
      content:
        "Welcome to NotaBeen (❝we❞, ❝our❞, or ❝us❞). By using our AI-powered email management service, you agree to these Terms and Conditions, which constitute a legally binding agreement between you and NotaBeen. Please read these terms carefully before using our services.",
    },
    {
      id: 2,
      title: "Service Description",
      content:
        "NotaBeen provides an AI-powered email management service that helps analyze, prioritize, organize, and summarize emails. Our service requires secure access to your email data to provide these features. By using NotaBeen, you authorize us to access and process your email data according to our Privacy Policy while maintaining end-to-end encryption and zero data retention in our database.",
    },
    {
      id: 3,
      title: "User Accounts",
      content:
        "To use our service, you must create an account and provide accurate information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other security breach.",
    },
    {
      id: 4,
      title: "Email Access and Processing",
      content: "By connecting your email account to NotaBeen:",
      list_items: [
        "You grant us permission to access and process your emails using our AI technology",
        "You confirm that you have the right to grant such access",
        "You understand that our AI will read, analyze, categorize, and summarize email content",
        "You acknowledge that while we implement strict security measures, no system is 100% secure",
      ],
    },
    {
      id: 5,
      title: "Data Privacy and Security",
      content:
        "We take data privacy and security extremely seriously. Your email data is processed with end-to-end encryption, and we do not store your email content in our database. We process your data solely to provide the service features you’ve requested. All processing happens in real-time with zero data retention. Please refer to our Privacy Policy for more details on how we handle your data.",
    },
    {
      id: 6,
      title: "AI Processing and Limitations",
      content: "Our AI email processing technology:",
      list_items: [
        "Uses machine learning algorithms to analyze and categorize emails",
        "May occasionally misclassify or incorrectly summarize content",
        "Will continuously improve based on general patterns (not your specific data)",
        "Is provided ‘as is’ without guarantee of perfect accuracy",
        "May be updated or modified as our technology evolves",
      ],
    },
    {
      id: 7,
      title: "Subscription and Payments",
      content:
        "NotaBeen offers different subscription tiers with varying features and usage limits:",
      list_items: [
        "By subscribing to a paid tier, you agree to pay the applicable fees",
        "Subscription fees are billed in advance and are non-refundable",
        "We may change our subscription fees with 30 days prior notice",
        "Free trial periods convert to paid subscriptions unless canceled before trial end",
        "Payment processing is handled by secure third-party payment processors",
      ],
    },
    {
      id: 8,
      title: "Acceptable Use",
      content:
        "You agree not to use NotaBeen for any illegal or unauthorized purpose. You must not:",
      list_items: [
        "Attempt to reverse-engineer our AI systems or algorithms",
        "Hack, disrupt, or interfere with the service",
        "Access data that isn’t yours",
        "Use the service to process emails containing illegal content",
        "Attempt to bypass any service limitations or restrictions",
        "Create accounts using automated methods or false information",
        "Share your account credentials with unauthorized users",
      ],
    },
    {
      id: 9,
      title: "Intellectual Property",
      content:
        "All content and technology provided through NotaBeen, including but not limited to text, graphics, logos, AI algorithms, and software, are the property of NotaBeen or its licensors and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our content or technology without our explicit consent.",
    },
    {
      id: 10,
      title: "Limitation of Liability",
      content:
        "To the maximum extent permitted by law, NotaBeen shall not be liable for:",
      list_items: [
        "Any indirect, incidental, special, consequential, or punitive damages",
        "Any loss of profits or revenues, whether incurred directly or indirectly",
        "Any loss of data, use, goodwill, or other intangible losses",
        "Any damages resulting from inaccurate email categorization or summarization",
        "Any damages resulting from service interruptions or downtime",
        "Any damages resulting from unauthorized access to your emails despite our security measures",
      ],
    },
    {
      id: 11,
      title: "Service Modifications and Termination",
      content:
        "We reserve the right to modify, suspend, or discontinue any part of our service at any time, with or without notice. We may terminate or suspend your account and access to NotaBeen at any time, without prior notice or liability, for any reason, including if you violate these Terms.\n\nUpon termination:",
      list_items: [
        "Your right to use the service will immediately cease",
        "We will immediately discontinue processing your emails",
        "We will remove all access connections to your email accounts",
        "All provisions of the Terms which by their nature should survive termination shall survive",
      ],
    },
    {
      id: 12,
      title: "Changes to Terms",
      content:
        "We reserve the right to modify these Terms at any time. If we make material changes to the Terms, we will notify you via email or through the service at least 14 days before the changes take effect. Your continued use of NotaBeen after such notification constitutes your acceptance of the new Terms.",
    },
    {
      id: 13,
      title: "Governing Law",
      content:
        "These Terms shall be governed by and construed in accordance with the laws of Finland, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of NotaBeen shall be exclusively resolved in the courts of Finland.",
    },
    {
      id: 14,
      title: "Communications, Newsletters and User Feedback",
      content:
        "By using our service, you consent to receive communications from us electronically. We may communicate with you by email or by posting notices on our website. You agree that all agreements, notices, disclosures, and other communications that we provide to you electronically satisfy any legal requirement that such communications be in writing.\n\nAs NotaBeen is in its initial stages of development, we may occasionally send newsletters containing product updates, tips, and improvement announcements. We value your input and may periodically request feedback through surveys or direct communications to help us enhance our service. Your participation in such feedback initiatives is entirely voluntary but greatly appreciated as it helps us build a better product tailored to your needs.\n\nWe’re committed to continuous improvement, and your support through feedback and suggestions is invaluable to us during this early stage. Any feedback you provide may be used to improve our services without any obligation of compensation or attribution.",
    },
    {
      id: 15,
      title: "Contact Information",
      content:
        "If you have any questions about these Terms, please contact us at:",
      list_items: [
        "Email: contact@NotaBeen.com",
        "Address: NotaBeen Oy, Kaijonharju, 90570 Oulu, Finland",
      ],
    },
  ],
};
