// src/components/LoadingOverlay.tsx
"use client";
import { QueueSnapshot, QueueStats } from "./LoadingOverlay";

export const calculateQueueSnapshot = (
  previous: QueueSnapshot,
  nextStats?: QueueStats,
  isActiveFlag?: boolean
): QueueSnapshot => {
  if (!nextStats) {
    const resolvedIsActive = isActiveFlag === undefined ? previous.isActive : Boolean(isActiveFlag);

    return {
      ...previous,
      isActive: resolvedIsActive
    };
  }

  const nextTotal = Math.max(nextStats.total ?? 0, 0);
  const nextPending = Math.max(nextStats.pending ?? 0, 0);
  const nextProcessing = Math.max(nextStats.processing ?? 0, 0);
  const nextCompleted = Math.max(nextStats.completed ?? 0, 0);

  const previousHadQueue = previous.total > 0;
  const previousActive = previous.isActive || previous.pending + previous.processing > 0;
  const previousComplete = previousHadQueue && previous.processed >= previous.total;

  const hasNewQueue = nextTotal > 0 &&
    (!previousHadQueue || (!previousActive && previousComplete && nextTotal !== previous.total));

  const total = hasNewQueue ? nextTotal : Math.max(previous.total, nextTotal);
  const pending = nextPending;
  const processing = nextProcessing;
  const completed = hasNewQueue ? nextCompleted : Math.max(previous.completed, nextCompleted);

  const processedViaCounts = Math.max(total - (pending + processing), 0);
  const processedCandidate = Math.max(
    processedViaCounts,
    completed,
    hasNewQueue ? 0 : previous.processed
  );
  const processed = Math.min(processedCandidate, total);

  const derivedActive = isActiveFlag !== undefined ? Boolean(isActiveFlag) : pending + processing > 0;
  const finalActive = total > 0 ? derivedActive || processed < total : false;
  const percentage = total > 0 ? (processed / total) * 100 : 0;

  return {
    total,
    pending,
    processing,
    completed,
    processed,
    percentage,
    isActive: finalActive,
    raw: nextStats
  };
};
