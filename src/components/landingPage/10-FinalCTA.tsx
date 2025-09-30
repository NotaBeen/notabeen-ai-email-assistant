"use client";

import { Button, Typography, Box, Container } from "@mui/material";
import React from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GitHubIcon from "@mui/icons-material/GitHub"; // Importing GitHub icon for the open-source button
import posthog from "posthog-js";
import { signIn } from "next-auth/react";

// Function to handle tracking user clicks (using posthog)
const handleButtonClick = (action: string) => {
  if (typeof posthog !== "undefined") {
    posthog.capture(action);
  }
};

/**
 * The FinalCTA component serves as the conclusive call-to-action section
 * of the landing page, encouraging users to either sign up for the hosted service
 * or check out the open-source code on GitHub.
 * It uses the primary brand color for a bold, visible contrast.
 * @returns {JSX.Element} The FinalCTA component.
 */
function FinalCTA() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 0 },
        bgcolor: "primary.main", // Strong background color
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        {/* Icon (Time/Savings) */}
        <AccessTimeIcon
          sx={{
            fontSize: { xs: 60, md: 80 },
            color: "primary.contrastText", // White/Light color for contrast
            mb: 2,
          }}
        />
        {/* Main Headline */}
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            mb: { xs: 2, md: 3 },
            color: "primary.contrastText",
          }}
        >
          Ready to Reclaim Your Inbox?
        </Typography>
        {/* Sub-text/Value Proposition Summary */}
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1rem", sm: "1.1rem" },
            maxWidth: "800px",
            mx: "auto",
            mb: { xs: 4, md: 6 },
            color: "primary.contrastText",
            lineHeight: 1.6,
          }}
        >
          Stop drowning in email and take back your time. With NotaBeen, you get
          powerful AI to manage your inbox without ever compromising on your
          data and privacy. Choose the control you want.
        </Typography>

        {/* Buttons Container */}
        <Box
          sx={{
            display: "flex",
            gap: 3, // Increased gap between buttons
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Button 1: Hosted/Sign-In (Primary Action) */}
          <Button
            variant="contained"
            size="large"
            sx={{
              // Inverse colors for high visibility (White button on colored background)
              bgcolor: "background.paper",
              color: "text.primary",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "background.default",
                boxShadow: 3,
              },
              py: { xs: 1.5, sm: 2 },
              px: { xs: 5, sm: 6 },
              width: { xs: "90%", sm: "auto" },
              borderRadius: 3,
              boxShadow: "none",
              textTransform: "none",
            }}
            onClick={() => {
              handleButtonClick("hosted_cta_click");
              signIn("google"); // Assuming 'google' is the sign-in provider
            }}
          >
            Start for Free (Hosted Version)
          </Button>

          {/* Button 2: Open Source (Secondary Action) */}
          <Button
            variant="outlined"
            size="large"
            startIcon={<GitHubIcon />}
            sx={{
              color: "primary.contrastText",
              borderColor: "primary.contrastText",
              fontWeight: 600,
              "&:hover": {
                borderColor: "primary.contrastText", // Keep border visible on hover
                bgcolor: "rgba(255, 255, 255, 0.1)", // Slight hover effect
              },
              py: { xs: 1.5, sm: 2 },
              px: { xs: 5, sm: 6 },
              width: { xs: "90%", sm: "auto" },
              borderRadius: 3,
              textTransform: "none",
            }}
            href="https://github.com/NotaBeen/notabeen-ai-email-assistant"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleButtonClick("open_source_cta_click")}
          >
            View on GitHub (Open Source)
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default FinalCTA;
