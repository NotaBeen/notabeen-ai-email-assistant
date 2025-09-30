// src/components/landingPage/6-FullOfferStack.tsx
import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
// Import Material UI Icons for features
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; // For Intelligent Prioritization
import ShieldIcon from "@mui/icons-material/Shield"; // For Complete Data Privacy
import SummarizeIcon from "@mui/icons-material/Summarize"; // For Automated Summaries

/**
 * The FullOfferStack section provides a detailed breakdown of the three main
 * benefits or features a user receives when using NotaBeen.
 * @returns {JSX.Element} The FullOfferStack component.
 */
function FullOfferStack() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
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
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            Reclaim Your Inbox, Redefine Your Productivity.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              color: "text.secondary",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            NotaBeen delivers a complete solution for professionals who want to
            move beyond email anxiety and get back to their real work. Here is
            everything you get in the full stack.
          </Typography>
        </Box>

        {/* --- Feature Cards Container (Flexible Grid) --- */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: { xs: 4, md: 6 },
            alignItems: "stretch",
          }}
        >
          {/* 1. Intelligent Prioritization */}
          <FeatureCard
            icon={AutoFixHighIcon}
            title="Intelligent Prioritization"
            description="Our AI learns what is important to you, automatically surfacing
              critical emails and archiving the rest. Never miss a key message,
              and always focus on high-impact work."
          />

          {/* 2. Complete Data Privacy */}
          <FeatureCard
            icon={ShieldIcon}
            title="Complete Data Privacy"
            description="You choose your privacy level. The self-hosted, open-source
              version means your data never leaves your server, while our hosted
              option provides a secure environment with enterprise-grade privacy
              standards."
          />

          {/* 3. Automated Summaries */}
          <FeatureCard
            icon={SummarizeIcon}
            title="Automated Summaries"
            description="Quickly get the gist of long email threads and newsletters with
              AI-powered summaries, saving you hours of reading time each week.
              Understand complex topics at a glance."
          />
        </Box>
      </Container>
    </Box>
  );
}

export default FullOfferStack;

// Helper component for reusable feature cards
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <Paper
    elevation={3}
    sx={{
      p: { xs: 3, md: 4 },
      textAlign: "center",
      flex: "1 1 300px", // Allows the card to take up space flexibly
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
      <Icon sx={{ fontSize: 40 }} />
    </Box>
    <Typography
      variant="h6"
      component="h3"
      sx={{
        fontWeight: 700,
        mb: 1.5,
        color: "text.primary",
        fontSize: { xs: "1.2rem", md: "1.25rem" },
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="body1"
      color="text.secondary"
      sx={{ fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}
    >
      {description}
    </Typography>
  </Paper>
);
