"use client";

import { Button, Typography, Box, Container } from "@mui/material";
import React from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import posthog from "posthog-js";
import { loginUrl } from "@/utils";

const handleButtonClick = (action: string) => {
  if (typeof posthog !== "undefined") {
    posthog.capture(action);
  }
};

function FinalCTA() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 0 },
        bgcolor: "primary.main",
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <AccessTimeIcon
          sx={{
            fontSize: { xs: 60, md: 80 },
            color: "primary.contrastText",
            mb: 2,
          }}
        />
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
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            maxWidth: "800px",
            mx: "auto",
            mb: { xs: 4, md: 6 },
            color: "primary.contrastText",
          }}
        >
          Stop drowning in email and take back your time. With NotaBeen, you get
          powerful AI to manage your inbox without ever compromising on your
          data and privacy.
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "background.paper",
              color: "text.primary",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "background.default",
              },
              py: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 5 },
              width: { xs: "90%", sm: "auto" },
              borderRadius: 2,
              boxShadow: "none",
            }}
            href={loginUrl}
            onClick={() => handleButtonClick("hosted_cta_click")}
          >
            Get Hosted Version
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              color: "primary.contrastText",
              borderColor: "primary.contrastText",
              fontWeight: 600,
              "&:hover": {
                borderColor: "primary.dark",
                color: "primary.dark",
              },
              py: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 5 },
              width: { xs: "90%", sm: "auto" },
              borderRadius: 2,
            }}
            href="https://github.com/NotaBeen/NotaBeen"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleButtonClick("open_source_cta_click")}
          >
            View on GitHub
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default FinalCTA;
