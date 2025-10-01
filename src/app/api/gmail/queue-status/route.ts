// src/app/api/gmail/queue-status/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getQueueStats } from "@/lib/gmail/email-queue";
import { handleApiError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";

/**
 * GET /api/gmail/queue-status
 * Returns the current status of the email processing queue
 */
export async function GET() {
  try {
    // Validate user session
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Session or User ID is missing." },
        { status: 401 }
      );
    }

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