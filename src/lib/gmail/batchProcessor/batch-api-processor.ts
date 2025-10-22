// src/lib/gmail/batchProcessor/batch-api-processor.ts

import { logger } from "@/utils/logger";
import { GoogleGenAI } from "@google/genai";
import { GmailMessage } from "../gmail-client";
import { PrecisResult } from "../email-processor";
import { generateGeminiEmailPrecisPrompt } from "@/app/api/gmail/gemini-api/prompts/geminiEmailPrecisPrompt";
import { parseGeminiResponse } from "./response-parser";
import { saveProcessedEmail } from "./data-persister";

// --- Custom Interfaces to avoid 'any' and handle SDK inconsistencies ---

// Interface for the detailed BatchJob status when retrieved
interface BatchJobWithCompletedCount {
    state?: string; // We use string for comparison robustness, though SDK defines JobState
    name?: string;
    error?: { message?: string };
    completedCount?: number; // FIX: Added explicitly for type assertion
}

// Interface for the contents returned from the batch job
interface GeminiBatchContentResponse {
    responses: Array<{
        candidates?: Array<{
            content?: {
                parts?: Array<{
                    text?: string;
                }>;
            };
        }>;
    }>;
}
// --- End Custom Interfaces ---


interface BatchProcessingResult {
    successful: (GmailMessage & { precis: PrecisResult })[];
    failed: {
        message: GmailMessage;
        error: Error;
        isRateLimit: boolean;
    }[];
    rateLimitInfo?: {
        quotaExceeded: boolean;
        retryAfter?: number;
        quotaMetric?: string;
        quotaLimit?: string; 
    };
}

/**
 * Process a single batch of emails using Gemini Batch API
 */
export async function processBatchWithAPI(
    messages: GmailMessage[],
    emailOwner: string
): Promise<BatchProcessingResult> {
    const result: BatchProcessingResult = {
        successful: [],
        failed: [],
    };

    // 1. Prepare batch requests
    const batchRequests = messages.map((message) => {
        const formattedDate =
            message.dateReceived instanceof Date &&
            !isNaN(message.dateReceived.getTime())
                ? message.dateReceived.toISOString().split("T")[0]
                : "unknown date";

        const contentToSend = generateGeminiEmailPrecisPrompt({
            sender: message.sender,
            recipients: message.recipients.join(", ") || "none",
            unsubscribeLinkPresent: message.unsubscribeLink ? "Yes" : "No",
            attachmentNames: message.attachmentNames?.join(", ") || "none",
            formattedDate,
            text: message.body,
        });

        return {
            contents: [{ parts: [{ text: contentToSend }] }],
            // Metadata is NOT supported directly in the Gemini SDK batch creation
            // This is a placeholder/example of what would be used if GCS/Storage were involved.
            // For this implementation, we rely on the index to map back to the original message.
        };
    });

    try {
        logger.info(`Creating batch job for ${batchRequests.length} emails`);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

        // 2. Create batch job
        const batchJob = await ai.batches.create({
            model: "gemini-2.0-flash",
            // NOTE: The Gemini SDK batch API expects a list of Contents objects.
            src: batchRequests.map((req) => ({ contents: req.contents })),
            config: {
                displayName: `email-processing-${Date.now()}`,
            },
        });

        if (!batchJob.name) {
            throw new Error("Batch job creation failed: Name is missing.");
        }
        const jobName = batchJob.name;
        logger.info(`Created batch job: ${jobName}`);

        // 3. Poll for completion
        const maxWaitTime = 10 * 60 * 1000; // 10 minutes max wait
        const pollInterval = 30000; // 30 seconds polling
        let elapsed = 0;

        while (elapsed < maxWaitTime) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            elapsed += pollInterval;

            const jobStatus = await ai.batches.get({ name: jobName }) as BatchJobWithCompletedCount; // FIX 1: Cast to custom interface to avoid 'any' for completedCount

            const completedCount = jobStatus.completedCount || 0;
            logger.info(
                `Batch job status: ${jobStatus.state}, progress: ${completedCount}/${batchRequests.length}`
            );

            // FIX 2: Use the explicit job state constants for comparison
            if (jobStatus.state && jobStatus.state === "JOB_STATE_SUCCEEDED") {
                // 4. Get and Process results

                // FIX 3: Cast the batches object and the results to custom interfaces to avoid 'any'
                const batchesApi = ai.batches as unknown as { getBatchContents: (p: { name: string }) => Promise<GeminiBatchContentResponse> };
                const results = await batchesApi.getBatchContents({ name: jobName });

                for (let i = 0; i < results.responses.length; i++) {
                    const response = results.responses[i];
                    const originalMessage = messages[i]; // Map back via index

                    try {
                        const content: string =
                            response.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        const precis = parseGeminiResponse(content, originalMessage.id);

                        if (precis) {
                            await saveProcessedEmail(originalMessage, precis, emailOwner);
                            result.successful.push({ ...originalMessage, precis });
                        } else {
                            result.failed.push({
                                message: originalMessage,
                                error: new Error("Failed to parse Gemini response or empty content"),
                                isRateLimit: false,
                            });
                        }
                    } catch (error) {
                        result.failed.push({
                            message: originalMessage,
                            error: error as Error,
                            isRateLimit: false,
                        });
                    }
                }
                return result;
            } else if (jobStatus.state && (jobStatus.state === "JOB_STATE_FAILED" || jobStatus.state === "JOB_STATE_CANCELLED")) {
                throw new Error(
                    `Batch job failed: ${jobStatus.error?.message || "Unknown error"}`
                );
            }
        }

        // 5. Timeout
        throw new Error("Batch processing timed out after 10 minutes");
    } catch (error) {
        logger.error("Batch API processing failed:", error);
        // On API failure, re-map all messages to failed to be handled by the caller
        const err = error as Error;
        messages.forEach((message) => {
            result.failed.push({ message, error: err, isRateLimit: false });
        });
        // Add rate limit info if it's an API error that can be parsed as such (though less likely in a batch job)
        if (err.message.includes("429") || err.message.includes("quota")) {
            result.rateLimitInfo = { quotaExceeded: true };
        }
        return result;
    }
}