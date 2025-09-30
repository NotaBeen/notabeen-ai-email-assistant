// src\app\dashboard\components\navigation\navBarMiddle\components\EmptyState.tsx

import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Mail as MailIcon } from "@mui/icons-material";

// Props are removed as they were noted as unused in the original code,
// simplifying the component to its core purpose: display.
// If future functionality requires them, they can be re-introduced.

const EmptyState: React.FC = () => {
  const theme = useTheme();
  // Check if the current viewport size is mobile (less than 'md' breakpoint)
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
        p: isMobile ? 4 : 0, // Add more padding on mobile
        color: "#9CA3AF", // Text color: gray
        backgroundColor: "background.paper",
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
          fontWeight: 600, // Slightly bolder for prominence
          textAlign: "center",
        }}
      >
        All clear! No emails in this category.
      </Typography>
      <Typography
        sx={{
          fontSize: isMobile ? "1rem" : "0.875rem",
          mt: 1,
          textAlign: "center",
          px: 2,
        }}
      >
        Try selecting a different filter or check back later.
      </Typography>
    </Box>
  );
};

export default EmptyState;
