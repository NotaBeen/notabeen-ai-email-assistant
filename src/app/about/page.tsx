"use client";

import React from "react";
import { Container, Typography, Box, Button, Divider } from "@mui/material";
import Image from "next/image";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { landing_page_navigation } from "@/lib/constants";
import GitHubIcon from "@mui/icons-material/GitHub"; // Add GitHub icon for the button

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Navigation pages={landing_page_navigation} />

      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "2.5rem", md: "3rem" },
            }}
          >
            Our Story: Building Trust and Value
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "1.1rem", md: "1.3rem" },
            }}
          >
            A commitment to auditable transparency, professional efficiency, and Open Core freedom.
          </Typography>
        </Box>

        {/* The Beginning Section - UPDATED */}
        <Box component="section" sx={{ my: { xs: 6, md: 8 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "1.5rem", md: "2.2rem" },
            }}
          >
            The Origin: Solving an Auditable Problem
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2, color: "text.secondary", lineHeight: 1.6 }}
          >
            NotaBeen began not just to fight email clutter, but to solve a fundamental <strong>trust barrier</strong> in modern AI tools. As a developer, I saw that professionals were hesitant to adopt powerful new email AI because they couldn&#39;t verify what was happening to their sensitive data. For nine months, I built the core engine, realizing that true professional adoption would require more than just efficiency, it would require <strong>auditable, verifiable transparency</strong>. This became the non-negotiable principle driving the entire project.
          </Typography>
        </Box>

        <Divider sx={{ my: { xs: 6, md: 8 }, borderColor: "divider" }} />

        {/* The Pivot to Open Core Section - UPDATED */}
        <Box component="section" sx={{ my: { xs: 6, md: 8 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "1.5rem", md: "2.2rem" },
            }}
          >
            The Strategy: Open Core for Trust and Sustainability
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2, color: "text.secondary", lineHeight: 1.6 }}
          >
            The shift to an <strong>Open Core business model</strong> was a strategic imperative. It allows us to:
            <br />
            1. Offer the <strong>NotaBeen Core</strong> (MIT-licensed) for those who demand <strong>absolute data sovereignty</strong> via self-hosting and full code transparency.
            <br />
            2. Offer <strong>NotaBeen Professional</strong> (Paid SaaS) to provide the highest <strong>ROI</strong> through managed service features like Intelligent Risk Prioritization and guaranteed <strong>AI Actions</strong>, ensuring a sustainable business that can develop the core engine for everyone.
            <br />
            This dual approach directly addresses the market&#39;s need for both <strong>uncompromised trust and professional-grade efficiency</strong>.
          </Typography>
        </Box>

        <Divider sx={{ my: { xs: 6, md: 8 }, borderColor: "divider" }} />

        {/* Meet the Founder Section - UPDATED */}
        <Box component="section" sx={{ my: { xs: 6, md: 8 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 4,
              color: "text.primary",
              fontSize: { xs: "1.5rem", md: "2.2rem" },
            }}
          >
            Meet the Founder
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 4,
            }}
          >
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: 3,
              }}
            >
              <Image
                src="/curtis.jpg"
                alt="Curtis Thomas - Founder of NotaBeen"
                width={150}
                height={150}
                style={{ objectFit: "cover" }}
              />
            </Box>
            <Box>
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  color: "text.primary",
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                Curtis Thomas
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.disabled",
                  fontStyle: "italic",
                  mb: 2,
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                Founder & Full-Stack Developer
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.6,
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                As the full-stack developer, I built NotaBeen from the ground up, but my focus has shifted from just code to community and commercial sustainability. I am committed to leading a <strong>vibrant, developer-led community</strong> that uses the Open Core model to build the future of auditable, high-ROI email tools.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 6, md: 8 }, borderColor: "divider" }} />

        {/* Our Vision Section - UPDATED */}
        <Box
          component="section"
          sx={{ my: { xs: 6, md: 8 }, textAlign: "center" }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "1.5rem", md: "2.2rem" },
            }}
          >
            Our Auditable Vision
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2, color: "text.secondary", lineHeight: 1.6, mb: 4 }}
          >
            Our vision is simple: to make <strong>NotaBeen Core</strong> the indispensable, MIT-licensed foundation for every professional and enterprise seeking transparency, and to make <strong>NotaBeen Professional</strong> the most efficient, <strong>high-ROI</strong> managed service available. We believe in a future where trust is not a promise, but a line of code you can inspect.
          </Typography>
          <Button
            href="https://github.com/NotaBeen/notabeen-ai-email-assistant"
            variant="contained"
            size="large"
            startIcon={<GitHubIcon />}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            Inspect the Core Code on GitHub
          </Button>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}