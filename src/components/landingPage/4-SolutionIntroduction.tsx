// src/components/landingPage/4-SolutionIntroduction.tsx
import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
// Import Icons for visual features
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import ShieldIcon from "@mui/icons-material/Shield";

/**
 * The SolutionIntroduction section introduces the core value propositions
 * of NotaBeen using three distinct feature cards, updated for the Open Core MVPI strategy.
 * @returns {JSX.Element} The SolutionIntroduction component.
 */
export default function SolutionIntroduction() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        {/* Section Headline - UPDATED */}
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
          NotaBeen Professional: Your Engine for Intelligent Focus
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
          {/* Card 1: Intelligent Prioritization / Risk Mitigation - UPDATED */}
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
              {/* Using AutoStoriesIcon to represent reading/summary/prioritization */}
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
              Intelligent Prioritization: Risk Mitigation
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              Our solution automatically detect and surface high-stakes emails, invoices, contract deadlines, and client requests. Ensuring you <strong>never drop the ball</strong> on revenue-driving or high-risk communication.
            </Typography>
          </Paper>

          {/* Card 2: High-Value AI Actions (Monetization Metric) - UPDATED */}
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
              {/* Using SentimentSatisfiedAltIcon to represent productivity/satisfaction */}
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
              High-Value AI Actions & ROI
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              Every Professional account includes <strong>unlimited AI Actions</strong> (summaries, categorization, sentiment analysis) per month. These are the tools that save you hours, driving a clear and measurable return on your investment.
            </Typography>
          </Paper>

          {/* Card 3: Privacy and Open Source - UPDATED */}
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
              Transparency & Trust: Open Core
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, lineHeight: 1.6 }}
            >
              Unlike proprietary AI &quot;black boxes,&quot; our Open Core model lets you audit our codebase. Choose the <strong>managed service</strong> for convenience, or the <strong>self-hosted Core</strong> for 100% data sovereignty.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}