// src/components/LoadingOverlay.tsx

"use client";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Paper,
  IconButton,
  Tooltip,
  Fab,
  Fade,
  Grow
} from "@mui/material";
import {
  Close as CloseIcon,
  Minimize as MinimizeIcon
} from "@mui/icons-material";
import { calculateQueueSnapshot } from "./calculateQueueSnapshot";

export type QueueStats = {
  total: number;
  pending: number;
  processing: number;
  completed: number;
};

export type QueueSnapshot = {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  processed: number;
  percentage: number;
  isActive: boolean;
  raw?: QueueStats;
};

const INITIAL_QUEUE_SNAPSHOT: QueueSnapshot = {
  total: 0,
  pending: 0,
  processing: 0,
  completed: 0,
  processed: 0,
  percentage: 0,
  isActive: false,
  raw: undefined
};

const HIDE_GRACE_PERIOD_MS = 2000;

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  operationType?: 'refresh' | 'processing' | 'queue' | 'initial';
  queueStats?: QueueStats;
  enableQueueMonitoring?: boolean;
  pollIntervalMs?: number;
  queueStatusEndpoint?: string;
}

function LoadingOverlay({
  queueStats,
  enableQueueMonitoring = false,
  pollIntervalMs = 3000,
  queueStatusEndpoint = "/api/gmail/queue-status"
}: Readonly<LoadingOverlayProps>) {
  const theme = useTheme();

  const [persistentState, setPersistentState] = useState<{
    show: boolean;
    isMinimized: boolean;
  }>({
    show: false,
    isMinimized: false
  });

  const [queueSnapshot, setQueueSnapshot] = useState<QueueSnapshot>(INITIAL_QUEUE_SNAPSHOT);

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queuePollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleClosePersistent = useCallback(() => {
    setPersistentState(prev => ({
      ...prev,
      show: false
    }));
  }, []);

  const handleToggleMinimize = useCallback(() => {
    setPersistentState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized
    }));
  }, []);

  // Only update state if snapshot actually changes
  const updatePersistentQueueState = useCallback((nextStats?: QueueStats, isActive?: boolean) => {
    setQueueSnapshot(previousSnapshot => {
      const nextSnapshot = calculateQueueSnapshot(previousSnapshot, nextStats, isActive);
      // Shallow compare all fields using keyof
      const isSame = (Object.keys(nextSnapshot) as (keyof QueueSnapshot)[]).every(
        key => nextSnapshot[key] === previousSnapshot[key]
      );
      if (isSame) return previousSnapshot;

      // Flattened logic for linter
      if (nextSnapshot.isActive && nextSnapshot.total > 0) {
        clearHideTimeout();
        setPersistentState(prev => (prev.show ? prev : { ...prev, show: true }));
        return nextSnapshot;
      }

      if (nextSnapshot.total > 0 && nextSnapshot.processed >= nextSnapshot.total) {
        clearHideTimeout();
        const hidePersistent = () => {
          setPersistentState(prev => (prev.show ? { ...prev, show: false } : prev));
        };
        hideTimeoutRef.current = setTimeout(hidePersistent, HIDE_GRACE_PERIOD_MS);
        return nextSnapshot;
      }

      if (nextSnapshot.total === 0) {
        clearHideTimeout();
        setPersistentState(prev => (prev.show ? { ...prev, show: false } : prev));
        return nextSnapshot;
      }

      return nextSnapshot;
    });
  }, [clearHideTimeout]);

  const fetchQueueStatus = useCallback(async () => {
    if (!enableQueueMonitoring) return;

    try {
      const response = await fetch(queueStatusEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        console.error("Queue status API returned error:", response.status);
        return;
      }

      const data = await response.json();
      const { queueStats: fetchedStats, isActive } = data as {
        queueStats?: QueueStats;
        isActive?: boolean;
      };

      updatePersistentQueueState(fetchedStats, isActive);
    } catch (error) {
      console.error("Failed to check queue status:", error);
    }
  }, [enableQueueMonitoring, queueStatusEndpoint, updatePersistentQueueState]);

  useEffect(() => {
    if (!enableQueueMonitoring) {
      setPersistentState(prev => ({ ...prev, show: false }));
      setQueueSnapshot(INITIAL_QUEUE_SNAPSHOT);
      clearHideTimeout();
      if (queuePollingIntervalRef.current) {
        clearInterval(queuePollingIntervalRef.current);
        queuePollingIntervalRef.current = null;
      }
      return;
    }

    fetchQueueStatus();
    queuePollingIntervalRef.current = setInterval(() => {
      fetchQueueStatus();
    }, pollIntervalMs);

    return () => {
      if (queuePollingIntervalRef.current) {
        clearInterval(queuePollingIntervalRef.current);
        queuePollingIntervalRef.current = null;
      }
      clearHideTimeout();
    };
  }, [enableQueueMonitoring, fetchQueueStatus, pollIntervalMs, clearHideTimeout]);

  useEffect(() => {
    if (queueStats) {
      const hasActiveWork = (queueStats.pending ?? 0) + (queueStats.processing ?? 0) > 0;
      updatePersistentQueueState(queueStats, hasActiveWork);
    }
  }, [queueStats, updatePersistentQueueState]);

  const effectiveQueueStats = useMemo<QueueSnapshot | undefined>(() => {
    if (queueSnapshot.total > 0 || queueSnapshot.isActive) {
      return queueSnapshot;
    }

    if (queueStats && queueStats.total > 0) {
      const total = queueStats.total;
      const pending = queueStats.pending ?? 0;
      const processing = queueStats.processing ?? 0;
      const completed = queueStats.completed ?? 0;
      const processed = Math.max(total - (pending + processing), completed);
      const percentage = total > 0 ? (processed / total) * 100 : 0;

      return {
        total,
        pending,
        processing,
        completed,
        processed,
        percentage,
        isActive: pending + processing > 0,
        raw: queueStats
      };
    }

    return undefined;
  }, [queueSnapshot, queueStats]);

  // Calculate derived values once to prevent re-calculation on every render
  const processedCount = effectiveQueueStats?.processed ?? 0;
  const progressPercentage = effectiveQueueStats?.percentage ?? 0;
  const shouldShowPersistent = Boolean(
    persistentState.show && effectiveQueueStats && effectiveQueueStats.total > 0
  );

  return (
    <PersistentQueueIndicator
      shouldShowPersistent={shouldShowPersistent}
      persistentState={persistentState}
      effectiveQueueStats={effectiveQueueStats}
      progressPercentage={progressPercentage}
      processedCount={processedCount}
      handleToggleMinimize={handleToggleMinimize}
      handleClosePersistent={handleClosePersistent}
      theme={theme}
    />
  );
}

// Memoized persistent queue indicator to prevent unnecessary rerenders
interface PersistentQueueIndicatorProps {
  shouldShowPersistent: boolean;
  persistentState: { show: boolean; isMinimized: boolean };
  effectiveQueueStats?: QueueSnapshot;
  progressPercentage: number;
  processedCount: number;
  handleToggleMinimize: () => void;
  handleClosePersistent: () => void;
  theme: any;
}

const PersistentQueueIndicator = memo(function PersistentQueueIndicatorMemo(props: PersistentQueueIndicatorProps) {
  const {
    shouldShowPersistent,
    persistentState,
    effectiveQueueStats,
    progressPercentage,
    processedCount,
    handleToggleMinimize,
    handleClosePersistent,
    theme
  } = props;
  // Always render, but control visibility with Fade/Grow
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: theme.zIndex.modal - 1,
        pointerEvents: shouldShowPersistent ? 'auto' : 'none',
      }}
    >
      <Fade in={shouldShowPersistent} timeout={{ enter: 300, exit: 200 }}>
        <Box>
          {!persistentState.isMinimized ? (
            <Grow in={!persistentState.isMinimized} timeout={{ enter: 400, exit: 200 }}>
              <Paper
                elevation={8}
                sx={{
                  p: 2,
                  minWidth: 280,
                  maxWidth: 320,
                  backgroundColor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} thickness={4} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Processing Emails
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Minimize">
                      <IconButton size="small" onClick={handleToggleMinimize} sx={{ p: 0.5 }}>
                        <MinimizeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Close">
                      <IconButton size="small" onClick={handleClosePersistent} sx={{ p: 0.5 }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, transition: 'all 0.2s ease-in-out' }}>
                  {effectiveQueueStats?.total ?? 0} emails in queue
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, transition: 'all 0.2s ease-in-out' }}>
                  <Chip
                    label={`${effectiveQueueStats?.pending ?? 0} Pending`}
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ transition: 'all 0.2s ease-in-out' }}
                  />
                  <Chip
                    label={`${effectiveQueueStats?.processing ?? 0} Processing`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ transition: 'all 0.2s ease-in-out' }}
                  />
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.grey[500], 0.2),
                    mb: 1,
                    transition: 'all 0.3s ease-in-out',
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {processedCount} of {effectiveQueueStats?.total ?? 0} emails processed
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                  Processing in background • You can continue using the app
                </Typography>
              </Paper>
            </Grow>
          ) : (
            <Fade in={persistentState.isMinimized} timeout={{ enter: 300, exit: 200 }}>
              <Tooltip title={`${effectiveQueueStats?.total ?? 0} emails being processed`} placement="left">
                <Fab
                  size="medium"
                  color="primary"
                  onClick={handleToggleMinimize}
                  sx={{
                    width: 56,
                    height: 56,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      size={24}
                      thickness={5}
                      sx={{
                        color: 'inherit',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'inherit',
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {effectiveQueueStats?.total ?? 0}
                    </Typography>
                  </Box>
                </Fab>
              </Tooltip>
            </Fade>
          )}
        </Box>
      </Fade>
    </Box>
  );
});

export default LoadingOverlay;