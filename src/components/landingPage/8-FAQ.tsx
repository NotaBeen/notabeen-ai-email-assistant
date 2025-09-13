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
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function FAQ() {
  const faqs = [
    {
      question: "How does NotaBeen handle my personal email data?",
      answer:
        "NotaBeen offers two options. The open-source version is fully self-hosted, meaning your email data stays on your own private server and never touches our systems. For our hosted version, your data is processed in a secure, private cloud environment that adheres to strict privacy standards and is never sold or used for AI training.",
    },
    {
      question: "How does the AI assistant actually save me time?",
      answer:
        "NotaBeen's AI works to eliminate inbox anxiety by automatically sorting, prioritizing, and summarizing your emails. It cuts through low-value messages, ensuring that your most important communications are always easy to find, so you can spend less time sifting through clutter.",
    },
    {
      question: "Is NotaBeen difficult to set up?",
      answer:
        "For the self-hosted, open-source version, the process involves a quick setup on your private server, with step-by-step documentation to guide you. If you'd prefer an effortless experience, our hosted version requires no setup at all, just a simple sign-in.",
    },
    {
      question: "What are the costs associated with using NotaBeen?",
      answer:
        "The NotaBeen software is fully open-source and free. The only cost is for hosting the assistant on your private server, which is typically a minimal fee. We also offer a paid hosted version, which includes our managed cloud service for a simple, one-time fee for lifetime usage.",
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              disableGutters
              sx={{
                borderRadius: 2,
                boxShadow: 1,
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
                    color: "text.secondary",
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 1, bgcolor: "background.default" }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box
          sx={{
            py: { xs: 6, md: 8 },
            px: { xs: 2, md: 4 },
            textAlign: "center",
            mt: { xs: 4, md: 6 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", md: "1.25rem" } }}
            gutterBottom
          >
            Still Have Questions?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
          >
            Join our LinkedIn community and ask us anything! We are ready to
            help.
          </Typography>
          <Button
            variant="contained"
            component="a"
            href="https://www.linkedin.com/company/105343173/admin/dashboard/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
              mt: 3,
              py: { xs: 1, sm: 1.5 },
              px: { xs: 2, sm: 4 },
              borderRadius: 2,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <LinkedInIcon sx={{ fontSize: 20, mr: 1 }} />
            <span>Join our Community</span>
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
