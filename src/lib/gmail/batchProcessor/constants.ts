// src/lib/gmail/batchProcessor/constants.ts

export const MAX_BATCH_SIZE = 5; // Optimized for concurrent processing without overwhelming rate limits
export const BASE_BATCH_DELAY_MS = 500; // Reduced delay between batches (0.5 seconds)
export const BASE_EMAIL_DELAY_MS = 200; // Reduced delay between concurrent groups (0.2 seconds)
export const BACKOFF_MULTIPLIER = 2; // Multiplier for backoff when rate limits are hit
export const MAX_DELAY_MS = 60000; // Maximum delay (1 minute)
export const USE_BATCH_API = false; // Disable batch API - requires GCS setup, not suitable for real-time queue processing
export const CONCURRENT_LIMIT = 3; // Process 3 emails at once in individual mode
export const MAX_TOKENS_PER_EMAIL = 100000; // Token limit for a single email body