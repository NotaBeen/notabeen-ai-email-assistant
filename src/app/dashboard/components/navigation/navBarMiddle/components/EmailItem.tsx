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

// Helper function to get colors based on urgency
const getUrgencyColors = (urgencyScore: string | number) => {
  const score = Number(urgencyScore);
  if (score >= 71) {
    return { main: "#EE8802", light: "rgba(205, 71, 96, 0.05)" };
  } else if (score >= 41) {
    return { main: "#FF5733", light: "rgba(253, 186, 116, 0.1)" };
  } else if (score >= 11) {
    return { main: "#808080", light: "rgba(103, 166, 103, 0.1)" };
  } else {
    return { main: "#BDBDBD", light: "rgba(156, 163, 175, 0.1)" };
  }
};

const EmailItem: React.FC<EmailItemProps> = ({
  email,
  isSelected,
  onEmailClick,
  onUnsubscribe,
  onActionUpdate,
  formatDate,
}) => {
  const { main } = getUrgencyColors(email.urgencyScore);

  const isArchived = email.userActionTaken === "Archived";
  const hasAttachments =
    email.extractedEntities?.attachmentNames &&
    email.extractedEntities.attachmentNames.length > 0;

  const handleToggleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onActionUpdate) {
      const newAction = isArchived ? "No Action" : "Archived";
      onActionUpdate(email._id, newAction);
    }
  };

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
        textTransform: "none",
        color: isArchived ? "#9CA3AF" : "inherit",
        backgroundColor: isSelected
          ? "#CFE4FA"
          : isArchived
            ? "#FBFBFB"
            : "#F9FAFB",
        borderBottom: `1px solid ${isSelected ? main : "#E5E7EB"}`,
        borderRadius: 0,
        boxShadow: isSelected ? "0 4px 8px rgba(0,0,0,0.05)" : "none",
        "&:hover": {
          backgroundColor: isSelected ? "#CFE4FA" : "#F3F4F6",
          boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Urgency Line */}
      <Box
        sx={{
          width: "2px",
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
          gap: 1.5,
        }}
      >
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
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: isArchived ? "#9CA3AF" : "#1F2937",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {email.subject}
        </Typography>
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
              }}
            >
              {email.summary}
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Actions */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexShrink: 0 }}
      >
        {hasAttachments && (
          <Tooltip title="View Attachments">
            <IconButton
              size="small"
              sx={{ color: isArchived ? "#D1D5DB" : "#6B7280" }}
              aria-label="view attachments"
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {email.unsubscribeLink && (
          <Button
            variant="text"
            onClick={handleUnsubscribeClick}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
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
