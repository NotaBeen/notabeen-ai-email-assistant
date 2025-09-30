// src/components/landingPage/4-SolutionIntroduction.tsx
import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
// Import Icons for visual features
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import ShieldIcon from "@mui/icons-material/Shield";

/**
 * The SolutionIntroduction section introduces the core value propositions
 * of NotaBeen using three distinct feature cards.
 * It highlights prioritization, anxiety reduction, and the privacy/open-source aspect.
 * @returns {JSX.Element} The SolutionIntroduction component.
 */
export default function SolutionIntroduction() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        {/* Section Headline */}
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            fontWeight: 800,
            textAlign: "center",
            mb: { xs: 4, md: 8 },
            color: "text.primary",
          }}
        >
          Meet NotaBeen: Your Personal Inbox Assistant
        </Typography>

        {/* Flexbox Container for Cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {/* Card 1: Prioritization */}
          <Paper
            elevation={3} // Slightly higher elevation for emphasis
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: 1,
              minWidth: { md: "250px" },
              borderRadius: 3, // Rounded corners
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                pb: 1,
                fontWeight: 700,
                color: "text.primary", // Use text.primary for card title
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Stop Sifting, Start Reading
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              NotaBeen AI automatically sorts and prioritizes your emails,
              cutting through the noise so you only see what is important and
              urgent.
            </Typography>
          </Paper>

          {/* Card 2: Anxiety Reduction */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: 1,
              minWidth: { md: "250px" },
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SentimentSatisfiedAltIcon
                sx={{ fontSize: { xs: 32, md: 40 } }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                pb: 1,
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Conquer Inbox Anxiety
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              A clear, organized dashboard replaces the endless scroll of Gmail,
              allowing you to finally feel in control and stress-free about your
              communication.
            </Typography>
          </Paper>

          {/* Card 3: Privacy and Open Source */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: 1,
              minWidth: { md: "250px" },
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                pb: 1,
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Open Source & Private
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              Our privacy-first design means your data is secure. Choose the
              self-hosted open-source option for complete control or use our
              managed service.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
