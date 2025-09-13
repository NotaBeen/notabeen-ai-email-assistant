"use client";

import { Button, Typography, Box, Link, Container } from "@mui/material";
import React from "react";
import posthog from "posthog-js";
import Image from "next/image";

import { loginUrl } from "@/utils";

const handleButtonClick = (action: string) => {
  if (typeof posthog !== "undefined") {
    posthog.capture(action);
  }
};

function Hero() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 0 } }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: { xs: 2, sm: 2 },
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
            lineHeight: { xs: 1.2, sm: 1.1 },
          }}
        >
          Cut Email Time in Half. <br />
          <Box component="span" sx={{ color: "primary.main" }}>
            Get Back to What Matters.
          </Box>
        </Typography>

        <Typography
          variant="h2"
          component="p"
          sx={{
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
            fontWeight: 500,
            maxWidth: "800px",
            mx: "auto",
            mt: 6,
            mb: 6,
            lineHeight: 1.5,
            color: "text.secondary",
          }}
        >
          An AI assistant that sorts, summarizes, and prioritizes your
          professional Gmail, so you can spend less time on clutter and more
          time on high-impact work.
        </Typography>

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
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              px: { xs: 2, sm: 5 },
              py: { xs: 1.2, sm: 2 },
              width: { xs: "90%", sm: "auto" },
              fontSize: { xs: "1rem", md: "1.2rem" },
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
            href={loginUrl}
            onClick={() => handleButtonClick("hosted_cta_click")}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              color: "text.primary",
              borderColor: "text.primary",
              "&:hover": {
                borderColor: "text.secondary",
                color: "text.secondary",
              },
              px: { xs: 2, sm: 5 },
              py: { xs: 1.2, sm: 2 },
              width: { xs: "90%", sm: "auto" },
              fontSize: { xs: "1rem", md: "1.2rem" },
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
            component={Link}
            href="https://github.com/NotaBeen/NotaBeen"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleButtonClick("open_source_cta_click")}
          >
            View on GitHub
          </Button>
        </Box>
      </Container>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            boxShadow: {
              xs: "0 5px 15px rgba(0,0,0,0.1)",
              md: "0 10px 30px rgba(0,0,0,0.1)",
            },
            borderRadius: 2,
            display: { xs: "block", md: "none" },
            px: 2,
            mt: 4,
          }}
        >
          <Image
            src="/heroScreenshotMobile.png"
            alt="NotaBeen Product Screenshot Mobile"
            width={800}
            height={1200}
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            boxShadow: {
              xs: "0 5px 15px rgba(0,0,0,0.1)",
              md: "0 10px 30px rgba(0,0,0,0.1)",
            },
            borderRadius: 2,
            display: { xs: "none", md: "block" },
            px: 0,
            mt: 0,
          }}
        >
          <Image
            src="/heroScreenshot.png"
            alt="NotaBeen Product Screenshot Desktop"
            width={1200}
            height={675}
            style={{ width: "100%", height: "auto" }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Hero;
