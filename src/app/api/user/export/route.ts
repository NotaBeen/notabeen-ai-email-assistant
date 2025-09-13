// src/app/api/user/export/route.ts

import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not defined");
}
if (!process.env.ENCRYPTION_IV) {
  throw new Error("ENCRYPTION_IV is not defined");
}
const SECRET_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes
const IV = process.env.ENCRYPTION_IV; // Must be 12 bytes for GCM

// IMPORTANT: Ensure SECRET_KEY and IV are correctly loaded and are of correct length
if (SECRET_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes.");
}
if (IV.length !== 12) {
  throw new Error("ENCRYPTION_IV must be 12 bytes for AES-GCM.");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined.");
}

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();
const collectionName = process.env.MONGO_CLIENT ?? "";

// Define interface for Settings
interface UserSettings {
  theme: "light" | "dark"; // Assuming these are the only options
  language: string;
  notifications_enabled: boolean;
}

// Define interface for Subscription
interface UserSubscription {
  paid: boolean;
  start_date: Date; // Matches database field name
}

// Define the User document structure from MongoDB
// This interface represents the data as it's stored in your MongoDB collection,
// including the encrypted fields and their authTags.
interface UserDocument {
  _id: ObjectId; // MongoDB's default ID
  sub: string;
  email?: string;
  emailAuthTag?: string; // Auth tag for email decryption
  emailIV?: string; // IV for email decryption (though you're using a global IV)
  name?: string;
  nameAuthTag?: string; // Auth tag for name decryption
  nameIV?: string; // IV for name decryption (though you're using a global IV)
  settings?: UserSettings; // Use the specific UserSettings interface
  subscription?: UserSubscription; // Use the specific UserSubscription interface
  total_emails_analyzed?: number;
  cookie_acceptance?: boolean;
  cookie_acceptance_date?: Date | null;
  terms_acceptance?: boolean;
  terms_acceptance_date?: Date | null;
  created_at?: Date;
  last_login?: Date;
  roles?: string[];
}

// Define the structure of the decrypted user data that will be exported
// This interface represents the data *after* decryption and removal of sensitive fields.
interface DecryptedUserData {
  sub: string;
  email?: string;
  name?: string;
  subscription?: Omit<UserSubscription, "payment_method">; // Omit payment_method if not to be exported
  total_emails_analyzed?: number;
  cookie_acceptance?: boolean;
  cookie_acceptance_date?: Date | null;
  terms_acceptance?: boolean;
  terms_acceptance_date?: Date | null;
  created_at?: Date;
  last_login?: Date;
}

// Decryption function - now uses the global IV, consistent with src/app/api/user/route.ts
function decrypt(encryptedData: string, authTag: string): string {
  const iv = Buffer.from(IV, "utf-8"); // Use the global IV
  const secretKey = Buffer.from(SECRET_KEY, "utf-8"); // Ensure secretKey is a Buffer

  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = (await clientPromise).db(collectionName);
    const collection = db.collection<UserDocument>("user"); // Specify UserDocument type for the collection

    const sub = session.user.sub;
    const user = await collection.findOne({ sub });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Construct decryptedUserData by picking and transforming fields as needed
    const decryptedUserData: DecryptedUserData = {
      sub: user.sub,
      email:
        user.email && user.emailAuthTag
          ? decrypt(user.email, user.emailAuthTag)
          : user.email,
      name:
        user.name && user.nameAuthTag
          ? decrypt(user.name, user.nameAuthTag)
          : user.name,
      subscription: user.subscription
        ? {
            paid: user.subscription.paid,
            start_date: user.subscription.start_date,
          }
        : undefined,
      total_emails_analyzed: user.total_emails_analyzed,
      cookie_acceptance: user.cookie_acceptance,
      cookie_acceptance_date: user.cookie_acceptance_date,
      terms_acceptance: user.terms_acceptance,
      terms_acceptance_date: user.terms_acceptance_date,
      created_at: user.created_at,
      last_login: user.last_login,
    };

    // --- ADDING GDPR REQUIRED INFORMATION TO THE JSON ---
    const gdprInformation = {
      // 1. Purposes of the processing
      purposes_of_processing: {
        _description:
          "Explains the specific purposes for which each category of your personal data is collected and processed by 'NotaBeen'.",
        email:
          "To uniquely identify you, enable secure access to your account, facilitate essential communications (e.g., password resets, service updates), and manage your preferences.",
        name: "To personalize your user experience within the application (e.g., addressing you by name).",
        settings:
          "To store and apply your personal application preferences, such as theme choice, language settings, and notification preferences, ensuring a consistent user experience.",
        subscription:
          "To manage your service tier (e.g., 'basic', 'pro'), track your subscription start and end dates, auto-renewal status, and payment method details, which are necessary for service provision.",
        total_emails_analyzed:
          "To track your engagement with our email analysis features, understand feature adoption rates, and for internal service improvement analytics.",
        cookie_acceptance:
          "To record your explicit consent regarding the use of cookies on our website, ensuring compliance with ePrivacy Directive and GDPR.",
        terms_acceptance:
          "To record your agreement to our Terms of Service, which is a contractual requirement for using our service.",
        created_at:
          "To timestamp the creation of your account for administrative purposes and to fulfill legal obligations.",
        last_login:
          "To record the timestamp of your most recent login for security monitoring, account activity tracking, and to understand user engagement patterns. This field is updated every time you log in.",
        roles:
          "To define your assigned access levels and permissions within the application (e.g., 'user', 'admin'), enabling appropriate feature access.",
        senderEmail:
          "Specifically, within 'email_interaction_weights', 'senderEmail' identifies the unique email address of the sender whose interactions contribute to the associated weight.",
      },

      // 2. Categories of personal data concerned
      categories_of_personal_data: {
        _description:
          "A classification of the types of personal data we process about you.",
        identification_data: {
          _details: "Data used to directly identify you.",
          fields: ["email", "name", "sub (Auth0 user ID)"],
        },
        account_management_data: {
          _details: "Information related to your account setup and status.",
          fields: [
            "settings",
            "subscription details",
            "created_at",
            "last_login",
            "roles",
          ],
        },
        consent_and_agreement_data: {
          _details: "Records of your consent and acceptance of policies.",
          fields: [
            "cookie_acceptance",
            "cookie_acceptance_date",
            "terms_acceptance",
            "terms_acceptance_date",
            "email_preferences",
          ],
        },
      },

      // 3. Recipients or categories of recipient to whom the personal data have been or will be disclosed
      data_recipients: {
        _description:
          "Third-party entities with whom your personal data may be shared.",
        authentication_provider: {
          name: "Auth0",
          purpose:
            "Identity and access management (for secure login and user authentication).",
          data_shared: "'sub', 'email', 'name'.",
        },
        database_service: {
          name: "MongoDB Atlas",
          purpose: "Cloud database hosting for all user data.",
          data_shared: "All user data as outlined in this export.",
        },
        email_communication_provider: {
          name: "SendGrid",
          purpose:
            "Sending essential transactional emails (e.g., welcome emails, password resets) and marketing communications based on your preferences.",
          data_shared: "'email', 'name'.",
        },
      },

      // 4. The period for which the personal data will be stored, or criteria used to determine that period
      data_retention_policy: {
        _description: "Details on how long your personal data is stored.",
        active_account_retention:
          "Your personal data is retained for the entire duration that your 'NotaBeen' account remains active.",
        post_account_deletion_retention:
          "Upon receiving an account deletion request, your identifiable personal data (including email, name, and sub) will be permanently erased from our active databases within 30 days. This 30-day period allows for recovery in case of accidental deletion and ensures proper system synchronization.",
        anonymized_data_retention:
          "After the deletion period, certain usage statistics (e.g., 'total_emails_analyzed') may be retained in an anonymized or aggregated form for analytical purposes, where they can no longer be linked to your identity.",
        legal_and_legitimate_interest_retention:
          "Some data may be retained for longer periods if required by legal obligations (e.g., tax, audit) or for legitimate business interests (e.g., dispute resolution, fraud prevention). In such cases, data will be pseudonymized or anonymized where feasible and only retained for as long as strictly necessary.",
      },

      // 5. Existence of other data subject rights
      your_gdpr_rights: {
        _description:
          "A summary of your rights under the General Data Protection Regulation (GDPR) and how to exercise them.",
        right_of_access: {
          _details:
            "The right to obtain confirmation as to whether or not personal data concerning you are being processed, and, where that is the case, access to the personal data and specific information about that processing (as provided in this document).",
          how_to_exercise:
            "You have exercised this right by requesting this data export.",
        },
        right_to_rectification: {
          _details:
            "You have the right to request the correction of inaccurate or incomplete personal data concerning you.",
          how_to_exercise:
            "You can update some of your personal information directly within your account profile settings. For other corrections, please contact our support team at contact@NotaBeen.com.",
        },
        right_to_erasure: {
          _details:
            "You have the right to request the deletion of your personal data without undue delay, under certain conditions (e.g., data is no longer necessary for the purposes for which it was collected).",
          how_to_exercise:
            "You can initiate account deletion via https://NotaBeen.com/dashboard profile section. Alternatively, you may send a deletion request to our support team at contact@NotaBeen.com.",
        },
        right_to_restriction_of_processing: {
          _details:
            "You have the right to request that we limit the way we use your data, under specific conditions (e.g., if you contest the accuracy of the data, for a period enabling us to verify its accuracy).",
          how_to_exercise:
            "Please contact our support team at contact@NotaBeen.com with your specific request for restriction.",
        },
        right_to_object_to_processing: {
          _details:
            "You have the right to object to the processing of your personal data for direct marketing purposes or where the processing is based on our legitimate interests, under certain conditions.",
          how_to_exercise:
            "To object to processing, please contact our support team at contact@NotaBeen.com.",
        },
        right_to_data_portability: {
          _details:
            "You have the right to receive your personal data in a structured, commonly used, and machine-readable format (as provided by this export), and to transmit that data to another controller without hindrance.",
          how_to_exercise:
            "This data export fulfills your right to data portability.",
        },
        right_to_withdraw_consent: {
          _details:
            "Where the processing of your personal data is based on your consent, you have the right to withdraw that consent at any time. This withdrawal will not affect the lawfulness of processing based on consent before its withdrawal.",
          how_to_exercise:
            "You can manage your email preferences in your account settings. For other consent withdrawals, please contact our support team at contact@NotaBeen.com.",
        },
        identity_verification:
          "Please note that for security purposes and to protect your privacy, we may require verification of your identity before processing requests related to your GDPR rights.",
      },

      // 6. Right to lodge a complaint
      right_to_lodge_complaint: {
        _description:
          "Information about your right to lodge a complaint with a supervisory authority.",
        details:
          "If you believe your data protection rights have been violated, you have the right to lodge a complaint with a competent supervisory authority, particularly in the Member State of your habitual residence, place of work, or place of the alleged infringement. For users primarily located in Finland, the relevant authority is the Data Protection Ombudsman (Tietosuojavaltuutettu). You can find more information and contact details on their official website: https://tietosuoja.fi/en/home.",
      },

      // 7. Source of personal data
      source_of_personal_data: {
        _description: "Information about where your personal data originated.",
        identity_data_source:
          "Your 'sub' (Auth0 user ID), 'email', and 'name' are provided to us by Auth0, which acts as our identity provider when you log in using your Google account.",
        direct_collection:
          "All other data (e.g., settings, subscription details, usage data like 'total_emails_analyzed', 'email_interaction_weights', consent records) is collected directly from your interactions with our 'NotaBeen' application and the information you provide within it.",
      },

      // 8. Automated decision-making and profiling
      automated_decision_making_and_profiling: {
        _description:
          "Information regarding any automated processing of your personal data, including profiling.",
        automated_decision_making_status:
          "We do not engage in automated decision-making (as defined by GDPR Article 22) that would produce legal effects concerning you or similarly significantly affect you (e.g., no automated rejections of service, no automated changes to pricing or access based solely on algorithms).",
        profiling_details: {
          _note:
            "While no Article 22 automated decision-making occurs, 'email_interaction_weights' involves profiling for service personalization.",
          purpose:
            "The 'email_interaction_weights' are used to build a dynamic profile of your interaction patterns with different email senders within the 'NotaBeen' application.",
          logic:
            "These weights are adjusted based on your explicit and implicit interactions with emails from specific senders. For instance, positive engagement (e.g., spending more time on an email, composing a reply, marking as important) will increase a sender's weight, while negative engagement (e.g., rapid deletion, marking as spam) may decrease it. The precise algorithm is designed to reflect your evolving communication priorities.",
          significance_and_consequences:
            "The significance of this profiling is solely to enhance your user experience and the relevance of the 'NotaBeen' service. It allows our AI models to prioritize insights or suggest responses from senders you engage with more frequently. This personalization does not lead to automated rejections, altered pricing, exclusion from features, or any other significant adverse effects on your legal rights or service access.",
        },
      },
    };

    return NextResponse.json(
      {
        data: decryptedUserData,
        gdpr_compliance_information: gdprInformation,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error in GET /api/user/export:", error);
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 },
    );
  }
}
