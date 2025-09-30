// ProfileTypes.ts

/**
 * Type defining the structure for a section describing data processing purposes.
 * Contains a top-level description and dynamic key-value pairs for individual purposes.
 */
export type GDPRPurpose = {
  _description: string;
  [key: string]: string; // e.g., "service_provision": "To operate and maintain the application."
};

/**
 * Type defining the detailed structure of a specific category of personal data or a GDPR right.
 */
export type GDPRCategoryDetail = {
  _details: string; // Detailed description of the category or right
  fields: string[]; // List of specific data fields within this category (e.g., "Full Name", "IP Address")
};

/**
 * Type defining the structure for the categories of personal data section.
 */
export type GDPRCategories = {
  _description: string;
  [key: string]: GDPRCategoryDetail | string; // Dynamic keys map to the detailed structure or a simple string (if needed)
};

/**
 * Type defining the information about a single third-party data recipient.
 */
export type GDPRRecipient = {
  name: string;
  purpose: string;
  data_shared: string; // The specific data shared with this recipient
};

/**
 * Type defining the structure for the third-party data recipients section.
 */
export type GDPRDataRecipients = {
  _description: string;
  [key: string]: GDPRRecipient | string; // Dynamic keys map to the recipient details
};

/**
 * Type defining the structure for the data retention policy section.
 */
export type GDPRRetentionPolicy = {
  _description: string;
  [key: string]: string; // e.g., "user_data_retention": "30 days after account deletion"
};

/**
 * Type defining the detailed structure of an individual user's GDPR right.
 */
export type GDPRRight = {
  _details: string; // Description of the right
  how_to_exercise: string; // Instructions on how the user can exercise this right
};

/**
 * Type defining the structure for the user's GDPR rights section.
 */
export type GDPRRights = {
  _description: string;
  [key: string]: GDPRRight | string; // Dynamic keys map to the detailed right structure
};

/**
 * The top-level type containing all structured GDPR compliance information.
 */
export type GDPRComplianceInformation = {
  _note: string; // A general disclaimer or introductory note
  purposes_of_processing: GDPRPurpose;
  categories_of_personal_data: GDPRCategories;
  data_recipients: GDPRDataRecipients;
  data_retention_policy: GDPRRetentionPolicy;
  your_gdpr_rights: GDPRRights;
};

/**
 * The main application-specific user data object fetched from the backend.
 * This is merged with the data from the NextAuth session for the profile page.
 */
export type UserData = {
  email: string;
  subscription: {
    tier: string;
    request_limit: number;
    days_remaining: number;
    end_date: string | null;
  };
  total_emails_analyzed: number;
  created_at: string;
  gdpr_compliance_information?: GDPRComplianceInformation;
};
