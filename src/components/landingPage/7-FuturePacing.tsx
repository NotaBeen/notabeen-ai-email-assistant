// src/components/landingPage/7-FuturePacing.tsx
import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
// Import Icons for visualizing the future state
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt"; // For Calmness/Anxiety
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // For Time/Wasted Hours
import TrackChangesIcon from "@mui/icons-material/TrackChanges"; // For Focus/Missed Opportunities

/**
 * The FuturePacing component uses imagery and emotionally resonant language
 * to describe the future state a user can expect with NotaBeen.
 * This technique helps drive conversion by having the user visualize the benefit.
 * @returns {JSX.Element} The FuturePacing component.
 */
function FuturePacing() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        {/* --- Section Header --- */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            Imagine Your Inbox, Transformed.
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              color: "text.secondary",
              maxWidth: "800px",
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            This is not just a vision. This is the future of your professional
            life, and it is powered by NotaBeen.
          </Typography>
        </Box>

        {/* --- Future State Cards Container (Flexible Grid) --- */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: { xs: 4, md: 6 },
            alignItems: "stretch",
          }}
        >
          {/* Card 1: Emotional Benefit (Calmness) */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: "1 1 300px",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
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
              <SentimentSatisfiedAltIcon
                sx={{ fontSize: { xs: 32, md: 40 } }}
              />
            </Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: "text.primary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              No More Inbox Anxiety.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              You will feel calm, in control, and free from the stress of a
              cluttered inbox, knowing the AI is filtering the noise for you.
            </Typography>
          </Paper>

          {/* Card 2: Productivity Benefit (Time) */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: "1 1 300px",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
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
              <AccessTimeIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: "text.primary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              No More Wasted Hours.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              You will spend more time on meaningful work and less time sifting
              through junk mail, thanks to automated summaries and
              prioritization.
            </Typography>
          </Paper>

          {/* Card 3: Performance Benefit (Focus) */}
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              flex: "1 1 300px",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
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
              <TrackChangesIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
            </Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: "text.primary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              No More Missed Opportunities.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              Your most important and actionable emails will be at the top of
              your dashboard, ensuring you never drop the ball on a key message.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default FuturePacing;
