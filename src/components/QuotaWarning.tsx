// src/components/QuotaWarning.tsx

"use client";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Link,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon
} from "@mui/icons-material";
import { useState, useEffect } from "react";

interface QuotaWarningProps {
  quotaError: {
    message: string;
    retryAfter?: number;
    quotaLimit?: string;
    helpUrl?: string;
  } | null;
  onDismiss?: () => void;
}

function QuotaWarning({ quotaError, onDismiss }: QuotaWarningProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (quotaError?.retryAfter) {
      setTimeRemaining(quotaError.retryAfter);

      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [quotaError?.retryAfter]);

  if (!quotaError) return null;

  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const canRetry = timeRemaining <= 0;

  return (
    <Alert
      severity="warning"
      icon={<WarningIcon />}
      sx={{
        mb: 2,
        borderRadius: 2,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
      action={onDismiss && (
        <Button
          size="small"
          onClick={onDismiss}
          sx={{ minWidth: 'auto' }}
        >
          Dismiss
        </Button>
      )}
    >
      <AlertTitle sx={{ mb: 1 }}>
        API Quota Exceeded
      </AlertTitle>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2">
          {quotaError.message}
        </Typography>

        {quotaError.quotaLimit && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon fontSize="small" color="info" />
            <Typography variant="body2" color="text.secondary">
              <strong>Current Limit:</strong> {quotaError.quotaLimit}
            </Typography>
          </Box>
        )}

        {quotaError.retryAfter && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {canRetry ? (
                <span style={{ color: '#4caf50' }}>
                  <strong>Ready to retry</strong>
                </span>
              ) : (
                <span>
                  <strong>Retry available in:</strong> {formatTimeRemaining(timeRemaining)}
                </span>
              )}
            </Typography>
            {!canRetry && (
              <CircularProgress
                size={16}
                variant="determinate"
                value={((quotaError.retryAfter! - timeRemaining) / quotaError.retryAfter!) * 100}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        )}

        {quotaError.helpUrl && (
          <Box sx={{ mt: 1 }}>
            <Link
              href={quotaError.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none'
              }}
            >
              <Typography variant="body2">
                Learn more about Gemini API quotas
              </Typography>
              <OpenInNewIcon fontSize="small" />
            </Link>
          </Box>
        )}

        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Free Tier Limit"
            size="small"
            color="warning"
            variant="outlined"
          />
          <Chip
            label="Consider upgrading for higher limits"
            size="small"
            color="info"
            variant="outlined"
          />
        </Box>
      </Box>
    </Alert>
  );
}

export default QuotaWarning;