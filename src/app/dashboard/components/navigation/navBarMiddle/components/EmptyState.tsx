import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Mail as MailIcon } from "@mui/icons-material";

// The props for this component seem unused in the original code,
// but they are kept here for potential future use.
interface EmptyStateProps {
  onToggleShowArchived: () => void;
  hasArchivedEmails: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        p: isMobile ? 2 : 0,
        color: "#9CA3AF",
      }}
    >
      <MailIcon
        sx={{
          fontSize: isMobile ? "5rem" : "4rem",
          mb: 2,
        }}
      />
      <Typography
        sx={{
          fontSize: isMobile ? "1.25rem" : "1.125rem",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        No emails in this category
      </Typography>
      <Typography
        sx={{
          fontSize: isMobile ? "1rem" : "0.875rem",
          mt: 1,
          textAlign: "center",
        }}
      >
        Check back later or try refreshing your inbox
      </Typography>
    </Box>
  );
};

export default EmptyState;
