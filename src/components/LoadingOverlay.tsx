// src/components/LoadingOverlay.tsx

"use client";
import {
  Box,
  Backdrop,
  CircularProgress,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  alpha
} from "@mui/material";
import {
  Email as EmailIcon,
  SmartToy as AiIcon,
  CloudQueue as QueueIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  operationType?: 'refresh' | 'processing' | 'queue' | 'initial';
  queueStats?: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
  };
}

function LoadingOverlay({
  isOpen,
  message,
  progress,
  showProgress = false,
  operationType = 'processing',
  queueStats
}: LoadingOverlayProps) {
  const theme = useTheme();

  const getOperationIcon = () => {
    switch (operationType) {
      case 'refresh':
        return <RefreshIcon sx={{ fontSize: 32, color: 'primary.main' }} />;
      case 'queue':
        return <QueueIcon sx={{ fontSize: 32, color: 'info.main' }} />;
      case 'initial':
        return <CircularProgress size={32} />;
      default:
        return <AiIcon sx={{ fontSize: 32, color: 'secondary.main' }} />;
    }
  };

  const getDefaultMessage = () => {
    switch (operationType) {
      case 'refresh':
        return 'Refreshing your emails...';
      case 'queue':
        return 'Processing your email queue...';
      case 'initial':
        return 'Loading your workspace...';
      default:
        return 'Analyzing emails with AI...';
    }
  };

  const displayMessage = message || getDefaultMessage();

  const getProgressColor = () => {
    switch (operationType) {
      case 'refresh':
        return 'primary';
      case 'queue':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <Backdrop
      open={isOpen}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: alpha(theme.palette.background.default, 0.85),
        backdropFilter: 'blur(4px)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          p: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          minWidth: 320,
          maxWidth: 400
        }}
      >
        {/* Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getOperationIcon()}
          <Typography variant="h6" fontWeight={600}>
            {displayMessage}
          </Typography>
        </Box>

        {/* Progress Bar */}
        {showProgress && typeof progress === 'number' && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={getProgressColor()}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.grey[500], 0.2)
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              {Math.round(progress)}% complete
            </Typography>
          </Box>
        )}

        {/* Queue Statistics */}
        {queueStats && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Queue Status
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`${queueStats.pending} Pending`}
                size="small"
                color="warning"
                variant="outlined"
              />
              <Chip
                label={`${queueStats.processing} Processing`}
                size="small"
                color="info"
                variant="outlined"
              />
              <Chip
                label={`${queueStats.completed} Done`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>

            {queueStats.total > 0 && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={(queueStats.completed / queueStats.total) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.grey[500], 0.2)
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  {queueStats.completed} of {queueStats.total} emails processed
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Additional Info */}
        {operationType === 'processing' && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Our AI is analyzing your emails to extract important information
            <br />
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
              <EmailIcon fontSize="small" />
              This may take a few moments for large batches
            </Box>
          </Typography>
        )}

        {operationType === 'queue' && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Emails are being processed in the background
            <br />
            You can continue using other features while this runs
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
}

export default LoadingOverlay;