// src\app\dashboard\components\navigation\navBarMiddle\components\EmailItem.tsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  ArchiveOutlined as ArchiveIcon,
  UnarchiveOutlined as UnarchiveIcon,
  AttachFileOutlined as AttachFileIcon,
  StarsOutlined as StarsOutlinedIcon,
} from "@mui/icons-material";
import { EmailItemProps } from "@/types/interfaces";
import { getUrgencyColor } from "@/constants/urgencyColors";

const EmailItem: React.FC<EmailItemProps> = ({
  email,
  isSelected,
  onEmailClick,
  onUnsubscribe,
  onActionUpdate,
  formatDate,
}) => {
  const { main } = getUrgencyColor(email.urgencyScore);

  const isArchived = email.userActionTaken === "Archived";
  const hasAttachments =
    email.extractedEntities?.attachmentNames &&
    email.extractedEntities.attachmentNames.length > 0;

  /**
   * Toggles the archive state of the email.
   * Prevents click propagation to avoid opening the email content.
   */
  const handleToggleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onActionUpdate) {
      const newAction = isArchived ? "No Action" : "Archived";
      onActionUpdate(email._id, newAction);
    }
  };

  /**
   * Handles the unsubscribe button click.
   * Prevents click propagation.
   */
  const handleUnsubscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (email.unsubscribeLink) {
      onUnsubscribe(email.unsubscribeLink);
    }
  };

  return (
    <Button
      onClick={() => onEmailClick(email)}
      disableElevation
      disableRipple
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        position: "relative", // Needed for the urgency line absolute positioning
        textTransform: "none",
        color: isArchived ? "#9CA3AF" : "inherit",
        // Background color logic: Selected > Archived > Default
        backgroundColor: isSelected
          ? "#CFE4FA"
          : isArchived
            ? "#FBFBFB"
            : "#F9FAFB",
        // Border highlights based on selection/urgency
        borderBottom: `1px solid ${isSelected ? main : "#E5E7EB"}`,
        borderRadius: 0,
        boxShadow: isSelected ? "0 4px 8px rgba(0,0,0,0.05)" : "none",
        "&:hover": {
          backgroundColor: isSelected ? "#CFE4FA" : "#F3F4F6",
          boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Urgency Line (Visual Indicator on the left edge) */}
      <Box
        sx={{
          width: "3px", // Slightly thicker line
          height: "100%",
          bgcolor: isArchived ? "#D1D5DB" : main,
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      />
      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          textAlign: "left",
          overflow: "hidden",
          mr: 2,
          display: "flex",
          flexDirection: "column",
          gap: 0.5, // Reduced gap for tighter layout
        }}
      >
        {/* Sender and Date */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: isArchived ? "#9CA3AF" : "#1F2937",
            }}
          >
            {email.sender}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: isArchived ? "#D1D5DB" : "#6B7280", flexShrink: 0 }}
          >
            {formatDate(email.dateReceived)}
          </Typography>
        </Stack>

        {/* Subject */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: isArchived ? "#9CA3AF" : "#1F2937",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.2, // Tighter line height
          }}
        >
          {email.subject}
        </Typography>

        {/* AI Summary */}
        {email.summary && (
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={1}
            sx={{ mt: 0.5 }}
          >
            <StarsOutlinedIcon
              fontSize="small"
              sx={{ color: isArchived ? "#D1D5DB" : main, mt: 0.25 }}
            />
            <Typography
              variant="body2"
              sx={{
                color: isArchived ? "#BCC1C9" : "#4B5563",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                textOverflow: "ellipsis",
                lineHeight: 1.4,
              }}
            >
              {email.summary}
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Action Icons/Buttons */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexShrink: 0 }}
      >
        {/* Attachments Icon */}
        {hasAttachments && (
          <Tooltip title="View Attachments">
            <IconButton
              size="small"
              // The attachment icon does not need an onClick, as clicking the item itself opens the view
              sx={{ color: isArchived ? "#D1D5DB" : "#6B7280" }}
              aria-label="view attachments"
              onClick={(e) => e.stopPropagation()} // Important: stop propagation
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {/* Unsubscribe Button */}
        {email.unsubscribeLink && (
          <Button
            variant="text"
            onClick={handleUnsubscribeClick}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              minWidth: "auto",
              p: 0,
              color: isArchived ? "#9CA3AF" : main,
              "&:hover": {
                bgcolor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            Unsubscribe
          </Button>
        )}
        {/* Archive/Unarchive Toggle */}
        <Tooltip title={isArchived ? "Unarchive" : "Archive"}>
          <IconButton
            onClick={handleToggleArchive}
            size="small"
            sx={{ color: isArchived ? "#D1D5DB" : "#6B7280" }}
            aria-label={isArchived ? "Unarchive" : "Archive"}
          >
            {isArchived ? (
              <UnarchiveIcon fontSize="small" />
            ) : (
              <ArchiveIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Stack>
    </Button>
  );
};

export default EmailItem;
