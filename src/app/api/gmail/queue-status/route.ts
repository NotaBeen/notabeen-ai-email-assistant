// src/app/api/gmail/queue-status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { validateUserSession } from "@/lib/session-helpers";
import { getQueueStats } from "@/lib/gmail/email-queue";
import { handleApiError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";

/**
 * GET /api/gmail/queue-status
 * Returns the current status of the email processing queue
 */
export async function GET(req: NextRequest) {
  try {
    // Validate user session
    const session = await validateUserSession(req);

    // Get queue statistics
    const queueStats = getQueueStats();

    logger.debug(`Queue status requested by user: ${session.user.id}`, {
      queueStats
    });

    // Return queue status
    return NextResponse.json({
      queueStats,
      isActive: queueStats.total > 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error("Error in GET /api/gmail/queue-status:", error);
    return handleApiError(error, "GET /api/gmail/queue-status");
  }
}