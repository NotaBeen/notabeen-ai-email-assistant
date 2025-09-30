// src/components/landingPage/5-ShowExpertise.tsx
import { Typography, Box, Paper, Container } from "@mui/material";
import React from "react";
// Import Icons for visual features
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";

/**
 * The ShowExpertise section focuses on the project's foundational principles:
 * privacy, user control, and the open-source nature. This builds trust and
 * highlights the product's ethical approach to AI and data handling.
 * @returns {JSX.Element} The ShowExpertise component.
 */
function ShowExpertise() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        {/* --- Section Header --- */}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            Built on Principles, Not Compromises.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: { xs: 6, md: 10 },
              fontSize: { xs: "1rem", sm: "1.1rem" },
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            We believe in creating a product that prioritizes user control and
            privacy above all else. That is why we built NotaBeen as an
            open-source project.
          </Typography>
        </Box>

        {/* --- Feature Cards Container --- */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {/* Card 1: Privacy and Security */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 6 },
              textAlign: "center",
              flex: 1, // Equal width for both cards
              minWidth: { md: "350px" },
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 3,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SecurityIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              variant="h5"
              component="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.primary",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Smart AI, Uncompromised Privacy
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.6,
                fontSize: { xs: "0.95rem", md: "1rem" },
              }}
            >
              Whether you use the self-hosted open-source version (where your AI
              runs on your own server) or our managed service, your data is
              processed with the highest security standards and never used to
              train models or sold to third parties.
            </Typography>
          </Paper>

          {/* Card 2: Control and Choice */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 6 },
              textAlign: "center",
              flex: 1,
              minWidth: { md: "350px" },
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 3,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SettingsIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              variant="h5"
              component="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.primary",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Control Is Our Feature
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.6,
                fontSize: { xs: "0.95rem", md: "1rem" },
              }}
            >
              We give you the choice. Deploy the entire platform yourself for
              absolute control over your data, or use our convenient hosted
              service. Either way, you get a powerful, AI-driven platform
              without compromising your professional privacy or security.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default ShowExpertise;
