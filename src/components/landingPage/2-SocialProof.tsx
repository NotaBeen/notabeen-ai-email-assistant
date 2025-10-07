// src/components/landingPage/2-SocialProof.tsx
import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";

/**
 * The SocialProof section features a testimonial/quote from the founder.
 * This section aims to build trust and resonate with the target audience
 * by expressing the pain point and the founder's motivation.
 * @returns {JSX.Element} The SocialProof component.
 */
export default function SocialProof() {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: "background.default", // Use default background color
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        {/* Top Divider for separation */}
        <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: "divider" }} />

        {/* Founder's Quote / Mission Statement - UPDATED */}
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
            fontStyle: "italic",
            mb: { xs: 3, md: 4 },
            color: "text.primary",
            lineHeight: 1.4,
          }}
        >
          &ldquo;I built NotaBeen because the true cost of email isn&rsquo;t time, it&rsquo;s <strong>risk</strong>. It is for every professional who needs an auditable defense against missing critical client work, contracts, or invoices, and who demands a full return on their focus.&rdquo;
        </Typography>

        {/* Founder Attribution */}
        <Typography
          variant="h6"
          component="p"
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
            fontWeight: 500,
            color: "text.secondary",
            mt: 2,
            // Add slight italic style to emphasize the signature
            fontStyle: "normal",
          }}
        >
          — Curtis Thomas, Founder of NotaBeen
        </Typography>

        {/* Bottom Divider for separation */}
        <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: "divider" }} />
      </Container>
    </Box>
  );
}