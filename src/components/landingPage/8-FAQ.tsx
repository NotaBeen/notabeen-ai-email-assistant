"use client";

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Container,
} from "@mui/material";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkedInIcon from "@mui/icons-material/LinkedIn"; // Added LinkedIn Icon

/**
 * The FAQ component displays common questions and answers about NotaBeen,
 * addressing key concerns like privacy, value proposition, and pricing, updated
 * to reflect the Open Core MVPI strategy.
 * @returns {JSX.Element} The FAQ component.
 */
export default function FAQ() {
  const faqs = [
    {
      question: "What is the difference between NotaBeen Core (Free) and Professional (Paid)?",
      answer:
        "NotaBeen Core is the free, MIT-licensed, self-hostable open-source engine, perfect for users who prioritize absolute data sovereignty. It handles basic categorization and a clean dashboard. NotaBeen Professional is our managed SaaS offering. It includes advanced Intelligent Prioritization (Risk Mitigation), automated reply drafting, and a generous allowance of AI Actions (our monetization metric, like summaries and analysis) without the burden of self-hosting.",
    },
    {
      question: "How does NotaBeen ensure my data privacy and security?",
      answer:
        "Our Open Core model is our security moat. You can audit the entire codebase (Core) to verify our data handling practices. For the Professional managed service, your data is processed in a secure, private cloud environment and is never used to train AI models or sold to third parties. You always retain control and transparency.",
    },
    {
      question: "How do 'AI Actions' work, and how are they tied to my cost?",
      answer:
        "AI Actions are our core monetization metric. They are defined as high-value, resource-intensive AI operations, such as generating an in-depth thread summary, performing sentiment analysis, or drafting an advanced reply. NotaBeen Professional includes unlimited AI Actions per month, offering a clear, measurable ROI by saving you time on high-stakes tasks.",
    },
    {
      question: "What is the pricing for NotaBeen Professional?",
      answer:
        "The NotaBeen Professional hosted service is priced at €28.99 per user, per month. You can receive a discount by choosing the annual plan. The self-hosted NotaBeen Core is free (open-source), with the only cost being your private server hosting fees.",
    },
  ];

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            textAlign: "center",
            fontWeight: 800,
            color: "text.primary",
            mb: { xs: 4, md: 6 },
            fontSize: { xs: "1.75rem", md: "2.5rem" },
          }}
        >
          Frequently Asked Questions
        </Typography>

        {/* Accordion Group */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              disableGutters
              sx={{
                borderRadius: 2,
                boxShadow: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                "&:before": {
                  display: "none",
                },
                "&.Mui-expanded": {
                  boxShadow: 3,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />}
                sx={{
                  bgcolor: "background.paper",
                  "& .MuiAccordionSummary-content": {
                    my: { xs: 1.5, md: 2 },
                  },
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary", // Adjusted to primary text color for better visibility
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  pt: 1,
                  pb: 3, // Increased bottom padding for better spacing
                  px: 3,
                  bgcolor: "background.default",
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Call to Action for Further Questions */}
        <Box
          sx={{
            py: { xs: 6, md: 8 },
            px: { xs: 2, md: 4 },
            textAlign: "center",
            mt: { xs: 6, md: 8 },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 3,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", md: "1.5rem" },
              color: "text.primary",
            }}
            gutterBottom
          >
            Want to See the Code?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", md: "1.1rem" }, mb: 3 }}
          >
            All questions about security, data handling, and the core prioritization logic can be answered by reviewing our open-source repository.
          </Typography>
          <Button
            variant="contained"
            component="a"
            href="https://github.com/NotaBeen/notabeen-ai-email-assistant"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LinkedInIcon />} // Keeping the LinkedIn icon to represent community/professional link
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
              mt: 1,
              py: { xs: 1, sm: 1.5 },
              px: { xs: 3, sm: 6 },
              borderRadius: 2,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            View on GitHub (Open Core)
          </Button>
        </Box>
      </Container>
    </Box>
  );
}