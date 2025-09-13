import { Typography, Box, Paper, Container } from "@mui/material";
import React from "react";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";

function ShowExpertise() {
  return (
    <Box sx={{ py: { xs: 6, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
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
              mb: { xs: 4, md: 10 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            We believe in creating a product that prioritizes user control and
            privacy above all else.
          </Typography>
        </Box>

        {/* Flexbox container for the two cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {/* Smart AI, Uncompromised Privacy Section */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 6 },
              textAlign: "center",
              flex: 1, // Allows the paper to grow and share space equally
              minWidth: { md: "350px" }, // Prevents card from getting too small
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SecurityIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.secondary",
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
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              We built a powerful AI to manage your inbox, and we have put you
              in control. With our self-hosted option, your AI runs on your own
              server, so your data is never used to train our models. With our
              hosted version, your data is processed with the highest security
              standards and never sold to third parties.
            </Typography>
          </Paper>

          {/* Control is our Feature Section */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 6 },
              textAlign: "center",
              flex: 1,
              minWidth: { md: "350px" },
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SettingsIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "text.secondary",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Control Is Our Feature, Not an Afterthought
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.6,
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              In a world of cloud services, we believe your professional data
              deserves the highest level of security. Whether you choose our
              open-source, self-hosted platform or our convenient managed
              service, you get powerful AI without compromising on privacy.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default ShowExpertise;
