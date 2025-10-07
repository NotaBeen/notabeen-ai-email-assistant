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
        {/* --- Section Header - UPDATED --- */}
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
            A Future Where Your Focus Pays Dividends.
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
            This isn&#39;t just a vision. This is the <strong>auditable ROI</strong> you can expect from running your professional life on NotaBeen.
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
          {/* Card 1: Emotional Benefit (Calmness -> Auditable Calm/Risk Mitigation) - UPDATED */}
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
              Experience Auditable Calm
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              You&#39;ll feel <strong>calm and confident</strong>, knowing our intelligent prioritization system provides an auditable, enterprise-grade defense against missing critical, high-stakes client communication, contracts, or invoices.
            </Typography>
          </Paper>

          {/* Card 2: Productivity Benefit (Time -> ROI/Time-as-Revenue) - UPDATED */}
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
              Optimize Time as Revenue
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              You&#39;ll shift your focus entirely to billable, high-impact work. Every <strong>AI Action</strong> (summaries, categorization, drafting) saves you precious minutes, translating into a clear and measurable <strong>professional ROI</strong>.
            </Typography>
          </Paper>

          {/* Card 3: Performance Benefit (Focus -> High-Value Focus) - UPDATED */}
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
              Unlock High-Value Focus
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              The system&#39;s entire purpose is to maintain your flow state. Stop chasing the noise and spend your <strong>mental energy</strong> executing the strategic, revenue-generating tasks that truly matter to your business.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default FuturePacing;