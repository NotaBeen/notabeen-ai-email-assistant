// components/profile/ProfileTypes.ts

export type GDPRPurpose = {
  _description: string;
  [key: string]: string;
};

export type GDPRCategoryDetail = {
  _details: string;
  fields: string[];
};

export type GDPRCategories = {
  _description: string;
  [key: string]: GDPRCategoryDetail | string;
};

export type GDPRRecipient = {
  name: string;
  purpose: string;
  data_shared: string;
};

export type GDPRDataRecipients = {
  _description: string;
  [key: string]: GDPRRecipient | string;
};

export type GDPRRetentionPolicy = {
  _description: string;
  [key: string]: string;
};

export type GDPRRight = {
  _details: string;
  how_to_exercise: string;
};

export type GDPRRights = {
  _description: string;
  [key: string]: GDPRRight | string;
};

export type GDPRComplianceInformation = {
  _note: string;
  purposes_of_processing: GDPRPurpose;
  categories_of_personal_data: GDPRCategories;
  data_recipients: GDPRDataRecipients;
  data_retention_policy: GDPRRetentionPolicy;
  your_gdpr_rights: GDPRRights;
};

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
