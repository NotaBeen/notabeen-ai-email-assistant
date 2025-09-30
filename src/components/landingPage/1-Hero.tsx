// src/components/landingPage/1-Hero.tsx
"use client";

import { Button, Typography, Box, Link, Container } from "@mui/material";
import React from "react";
import posthog from "posthog-js";
import Image from "next/image";
import { signIn } from "next-auth/react";

/**
 * Handles PostHog event capture for CTA clicks.
 * @param {string} action - The event name to capture.
 */
const handleButtonClick = (action: string) => {
  // Ensure posthog is initialized before attempting to capture an event
  if (typeof posthog !== "undefined" && posthog.__loaded) {
    posthog.capture(action);
  }
};

/**
 * Hero section component for the landing page.
 * Features the main headline, description, primary CTAs, and a product visualization.
 * It uses the NextAuth `signIn` function for the "Get Started" button.
 * @returns {JSX.Element} The Hero component.
 */
function Hero() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        // Padding adjusted for visual balance on top of the page
        pt: { xs: 8, md: 12 },
        pb: { xs: 4, md: 6 }, // Add bottom padding to separate from the next section
      }}
    >
      <Container maxWidth="lg">
        {/* --- Headline --- */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: { xs: 2, sm: 2 },
            fontSize: { xs: "2.5rem", sm: "4rem", md: "5rem" }, // Increased font size for impact
            lineHeight: { xs: 1.1, sm: 1.05 },
          }}
        >
          Cut Email Time in Half. <br />
          <Box component="span" sx={{ color: "primary.main" }}>
            Get Back to What Matters.
          </Box>
        </Typography>

        {/* --- Sub-headline / Description --- */}
        <Typography
          variant="h2"
          component="p"
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.4rem" },
            fontWeight: 500,
            maxWidth: "850px",
            mx: "auto",
            mt: 4,
            mb: 6,
            lineHeight: 1.6,
            color: "text.secondary",
          }}
        >
          An AI assistant that sorts, summarizes, and prioritizes your
          professional Gmail, so you can spend less time on clutter and more
          time on high-impact work. Open-source and privacy-focused.
        </Typography>

        {/* --- Call-to-Action Buttons --- */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            alignItems: "center",
            mb: 6,
          }}
        >
          {/* 1. Primary CTA: Get Started (Managed Service) */}
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              px: { xs: 4, sm: 8 },
              py: { xs: 1.5, sm: 2 },
              width: { xs: "90%", sm: "auto" },
              fontSize: { xs: "1rem", md: "1.2rem" },
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: (theme) =>
                `0 4px 15px ${theme.palette.primary.light}80`,
            }}
            onClick={() => {
              handleButtonClick("hero_cta_get_started");
              // Initiate Google sign-in process via NextAuth
              signIn("google", { callbackUrl: "/dashboard" });
            }}
          >
            Get Started (Free!)
          </Button>

          {/* 2. Secondary CTA: View on GitHub (Open Source) */}
          <Button
            variant="outlined"
            size="large"
            sx={{
              color: "text.primary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.secondary",
                color: "text.secondary",
                bgcolor: "action.hover",
              },
              px: { xs: 4, sm: 8 },
              py: { xs: 1.5, sm: 2 },
              width: { xs: "90%", sm: "auto" },
              fontSize: { xs: "1rem", md: "1.2rem" },
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
            component={Link}
            href="https://github.com/NotaBeen/NotaBeen" // Corrected GitHub repository name
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleButtonClick("hero_cta_view_github")}
          >
            View on GitHub
          </Button>
        </Box>
      </Container>

      {/* --- Product Visualization (Screenshot/GIF) --- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          mt: { xs: 0, md: 4 },
        }}
      >
        {/* Mobile/Small Screen Image */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "600px", // Max width for mobile view
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            borderRadius: 2,
            display: { xs: "block", md: "none" },
            px: 2,
          }}
        >
          <Image
            src="/heroScreenshotMobile.png"
            alt="NotaBeen Product Screenshot Mobile"
            width={800}
            height={1200}
            layout="responsive"
            style={{ width: "100%", height: "auto", borderRadius: 8 }}
          />
        </Box>

        {/* Desktop/Large Screen GIF */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "1000px", // Max width for desktop view
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            borderRadius: 3,
            display: { xs: "none", md: "block" },
            overflow: "hidden",
          }}
        >
          <Image
            src="/notabeen-welcome.gif"
            alt="NotaBeen Product Dashboard GIF"
            width={1200}
            height={675}
            layout="responsive"
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Hero;
