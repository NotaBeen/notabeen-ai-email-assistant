// src/components/landingPage/6-FullOfferStack.tsx
import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
// Import Material UI Icons for features
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; // For Intelligent Prioritization
import ShieldIcon from "@mui/icons-material/Shield"; // For Complete Data Privacy
import SummarizeIcon from "@mui/icons-material/Summarize"; // For Automated Summaries

/**
 * The FullOfferStack section provides a detailed breakdown of the three main
 * benefits or features a user receives when using NotaBeen Professional.
 * @returns {JSX.Element} The FullOfferStack component.
 */
function FullOfferStack() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
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
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            The Full Professional Stack: Focus, Mitigation, and Control.
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
            NotaBeen Professional is engineered for the highest return on investment for high-value time. We deliver an indispensable platform built on three core, non-negotiable pillars of modern productivity.
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
          {/* 1. Intelligent Prioritization (Focus on Risk/Financials) - UPDATED */}
          <FeatureCard
            icon={AutoFixHighIcon}
            title="Intelligent Risk Prioritization"
            description="Our AI doesn't just sort, it analyzes financial risk. By surfacing contracts, key client threads, and invoices first, we ensure you never lose revenue or reputation due to a missed email."
          />

          {/* 2. AI Action Efficiency (The Monetization Metric) - UPDATED */}
          <FeatureCard
            icon={SummarizeIcon}
            title="High-Value AI Action Efficiency"
            description="Every Professional account includes unlimited AI Actions per month. These are metered, high-value operations. Like full-thread summaries and automated reply drafts that directly save you billable hours."
          />

          {/* 3. Open Core Data Sovereignty (The Trust Model) - UPDATED */}
          <FeatureCard
            icon={ShieldIcon}
            title="Open Core Data Sovereignty"
            description="Trust is auditable. With our Open Core model, you get the convenience of a managed service but the security assurance of a transparent, MIT-licensed codebase. Your data remains yours, always."
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