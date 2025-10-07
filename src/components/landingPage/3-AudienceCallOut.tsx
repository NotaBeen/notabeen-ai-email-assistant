// src/components/landingPage/3-AudienceCallOut.tsx
import React from "react";
import { Box, Container, Typography } from "@mui/material";

/**
 * The AudienceCallOut section is a brief, focused component that directly
 * addresses the target user and their core pain point (Risk/Wasted Time).
 * It uses a strong, boxed design to draw attention to the specific audience.
 * @returns {JSX.Element} The AudienceCallOut component.
 */
export default function AudienceCallOut() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container
        maxWidth="md"
        sx={{
          textAlign: "center",
          p: { xs: 4, md: 6 },
          bgcolor: "background.paper", // Distinct background color for the box
          borderRadius: 3,
          boxShadow: 3, // Elevated shadow for emphasis
          border: (theme) => `1px solid ${theme.palette.divider}`, // Subtle border
        }}
      >
        {/* Main Audience Headline - UPDATED */}
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            fontWeight: 800,
            mb: { xs: 2, md: 2 },
            color: "text.primary",
          }}
        >
          Built for the Independent Professional Who Needs Intelligent Prioritization.
        </Typography>

        {/* Supporting Subtext - UPDATED */}
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            fontWeight: 400,
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          NotaBeen is for those whose time is their revenue. Stop wasting valuable hours sifting through clutter. Leverage our AI to immediately focus on the high-impact work that directly drives your bottom line.
        </Typography>
      </Container>
    </Box>
  );
}