// src/lib/gmail/batchProcessor/response-parser.ts

import { logger } from "@/utils/logger";
import { PrecisResult } from "../email-processor";

/**
 * Clean malformed JSON string from AI responses (e.g., single quotes, trailing commas).
 */
function cleanJsonString(jsonString: string): string {
  let cleaned = jsonString;

  // Replace single quotes with double quotes (but keep escaped quotes)
  cleaned = cleaned.replace(/(?<!\\)'/g, '"');

  // Remove newlines and tabs
  cleaned = cleaned.replace(/[\r\n\t]/g, " ");

  // Fix trailing commas before closing brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  // Fix missing commas between array elements
  cleaned = cleaned.replace(/(\])\s*(\[)/g, "],$2");

  // Handle special case for snippet with quotes
  cleaned = cleaned.replace(
    /("snippet":\s*)"(.*?)"/g,
    (match, prefix, value) => {
      // Escape any unescaped quotes in the snippet value
      const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
      return `${prefix}"${escapedValue}"`;
    }
  );

  // Fix common JSON issues (multiple spaces, leading/trailing whitespace)
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Fallback regex-based extraction when JSON parsing fails
 */
function extractEntitiesWithRegex(
  emailId: string,
  content: string
): PrecisResult["extractedEntities"] {
  try {
    const result: PrecisResult["extractedEntities"] = {
      senderName: "",
      date: "",
      snippet: "",
      recipientNames: [],
      subjectTerms: [],
      attachmentNames: [],
    };

    // Regex to extract fields
    const senderMatch = content.match(/"senderName":\s*"([^"]+)"/);
    if (senderMatch) result.senderName = senderMatch[1];
    const dateMatch = content.match(/"date":\s*"([^"]+)"/);
    if (dateMatch) result.date = dateMatch[1];
    const snippetMatch = content.match(/"snippet":\s*"(.+?)"/s);
    if (snippetMatch) result.snippet = snippetMatch[1].replace(/\\"/g, '"');

    // Regex for array fields
    const extractArray = (field: string) => {
      const match = content.match(new RegExp(`"${field}":\\s*\\[(.*?)\\]`, "s"));
      if (!match) return [];
      return match[1]
        .split(",")
        .map((r) => r.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    };

    result.recipientNames = extractArray("recipientNames");
    result.subjectTerms = extractArray("subjectTerms");
    result.attachmentNames = extractArray("attachmentNames");

    logger.info(
      `Successfully extracted entities using regex fallback for email ${emailId}`
    );
    return result;
  } catch (error) {
    logger.error(
      `Failed to extract entities with regex for email ${emailId}. Content: ${content.substring(0, 200)}...`,
      error
    );
    return null;
  }
}

/**
 * Parse extracted entities from JSON string
 */
function parseExtractedEntities(
  emailId: string,
  rawJsonString: string | null
): PrecisResult["extractedEntities"] {
  if (!rawJsonString) return null;

  try {
    // 1. Try to parse as-is
    return JSON.parse(rawJsonString) as PrecisResult["extractedEntities"];
  } catch {
    // 2. If direct parsing fails, try cleaning and parsing
    try {
      const cleaned = cleanJsonString(rawJsonString);
      return JSON.parse(cleaned) as PrecisResult["extractedEntities"];
    } catch (error) {
      logger.warn(`Failed to parse cleaned JSON for email ${emailId}. Falling back to regex.`);
      // 3. Final fallback: try to extract basic info with regex
      return extractEntitiesWithRegex(emailId, rawJsonString);
    }
  }
}

/**
 * Parse Gemini response content into PrecisResult
 */
export function parseGeminiResponse(
  content: string,
  emailId: string
): PrecisResult | null {
  try {
    // Use regex to robustly extract fields from the structured text response
    const summaryMatch = content.match(
      /\s*Summary:\s*([\s\S]*?)(?=\n\s*Urgency Score:|$)/
    );
    const urgencyScoreMatch = content.match(/\s*Urgency Score:\s*(\d+)/);
    const actionMatch = content.match(
      /\s*Action:\s*([\s\S]*?)(?=\n\s*Classification:|$)/
    );
    const classificationMatch = content.match(/\s*Classification:\s*(\w+)/);
    const keywordsMatch = content.match(
      /\s*Keywords:\s*([\s\S]*?)(?=\n\s*ExtractedEntities:|$)/
    );
    const extractedEntitiesMatch = content.match(
      /\s*ExtractedEntities:\s*(\{[\s\S]*?\})/
    );

    const keywords = keywordsMatch
      ? keywordsMatch[1]
          .trim()
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [];

    const precisResult: PrecisResult = {
      summary: summaryMatch ? summaryMatch[1].trim() : "",
      urgencyScore: urgencyScoreMatch
        ? parseInt(urgencyScoreMatch[1].trim(), 10)
        : 0,
      action: actionMatch ? actionMatch[1].trim() : "",
      classification: classificationMatch
        ? classificationMatch[1].trim()
        : "Uncategorized",
      keywords: keywords,
      extractedEntities: parseExtractedEntities(
        emailId,
        extractedEntitiesMatch ? extractedEntitiesMatch[1] : null
      ),
    };

    return precisResult;
  } catch (error) {
    logger.error(
      `Failed to parse Gemini response for email ${emailId}:`,
      error
    );
    return null;
  }
}