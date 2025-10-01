// src/lib/gmail/batchProcessor/data-persister.ts

import { logger } from "@/utils/logger";
import { encrypt } from "@/utils/crypto";
import { saveEmailAndIncrementCount } from "../../database/user-db";
import { GmailMessage } from "../gmail-client";
import { PrecisResult } from "../email-processor";
import { ObjectId } from "mongodb";

/**
 * Save processed email to database with encryption.
 */
export async function saveProcessedEmail(
  message: GmailMessage,
  precis: PrecisResult,
  emailOwner: string
): Promise<void> {
  const {
    id: emailId,
    sender,
    dateReceived,
    subject,
    emailUrl,
    recipients,
    unsubscribeLink,
  } = message;
  const {
    summary,
    urgencyScore,
    action,
    classification,
    keywords,
    extractedEntities,
  } = precis;

  // --- Encryption Block ---
  const encryptedSender = encrypt(sender);
  const encryptedSubject = encrypt(subject);
  const encryptedEmailUrl = encrypt(emailUrl);
  const encryptedSummary = encrypt(summary);
  const encryptedUrgencyScore = encrypt(urgencyScore.toString());
  const encryptedAction = encrypt(action);
  const encryptedRecipients = encrypt(JSON.stringify(recipients));

  // FIX: Added 'undefined' to the type definition.
  const encryptOptionalField = (value: string | string[] | object | null | undefined) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { encryptedData: null, authTag: null };
    }
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return encrypt(stringValue);
  };

  const { encryptedData: encryptedUnsubscribeLink, authTag: unsubscribeLinkAuthTag } =
    encryptOptionalField(unsubscribeLink);
  const { encryptedData: encryptedClassification, authTag: classificationAuthTag } =
    encryptOptionalField(classification);
  const { encryptedData: encryptedKeywords, authTag: keywordsAuthTag } =
    encryptOptionalField(keywords);
  const { encryptedData: encryptedExtractedEntities, authTag: extractedEntitiesAuthTag } =
    encryptOptionalField(extractedEntities);
  // --- End Encryption Block ---

  const parsedDate = new Date(dateReceived);
  const safeDateReceived = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const emailDocument = {
    provider: "gmail",
    emailOwner,
    userId: new ObjectId(emailOwner),
    emailId,
    dateReceived: safeDateReceived,
    
    // Core Encrypted Fields
    sender: encryptedSender.encryptedData,
    senderAuthTag: encryptedSender.authTag,
    subject: encryptedSubject.encryptedData,
    subjectAuthTag: encryptedSubject.authTag,
    emailUrl: encryptedEmailUrl.encryptedData,
    emailUrlAuthTag: encryptedEmailUrl.authTag,
    summary: encryptedSummary.encryptedData,
    summaryAuthTag: encryptedSummary.authTag,
    urgencyScore: encryptedUrgencyScore.encryptedData,
    urgencyScoreAuthTag: encryptedUrgencyScore.authTag,
    action: encryptedAction.encryptedData,
    actionAuthTag: encryptedAction.authTag,
    recipients: encryptedRecipients.encryptedData,
    recipientsAuthTag: encryptedRecipients.authTag,
    
    // Optional Encrypted Fields
    unsubscribeLink: encryptedUnsubscribeLink,
    unsubscribeLinkAuthTag: unsubscribeLinkAuthTag,
    classification: encryptedClassification,
    classificationAuthTag: classificationAuthTag,
    keywords: encryptedKeywords,
    keywordsAuthTag: keywordsAuthTag,
    extractedEntities: encryptedExtractedEntities,
    extractedEntitiesAuthTag: extractedEntitiesAuthTag,
    
    read: false,
    received_at: new Date(),
    processed_at: new Date(),
  };

  await saveEmailAndIncrementCount(emailDocument, emailOwner);
  logger.info(`Successfully saved email ${emailId} to the database.`);
}