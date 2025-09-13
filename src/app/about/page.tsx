"use client";

import React from "react";
import { Container, Typography, Box, Button, Divider } from "@mui/material";
import Image from "next/image";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { landing_page_navigation } from "@/lib/constants";

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
            Our Story
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "1.1rem", md: "1.3rem" },
            }}
          >
            From a founder vision to an open-source movement.
          </Typography>
        </Box>

        {/* The Beginning Section */}
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
            The Beginning: A Problem, a Vision
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2, color: "text.secondary", lineHeight: 1.6 }}
          >
            NotaBeen began as a university project, born from a simple but
            powerful idea: email and messaging can be better. I started this
            project fueled by a passion for clean, efficient technology and a
            belief that communication tools should be fast, reliable, and
            accessible to everyone. For nine months, I poured my time and energy
            into building a foundation for this vision, driving the project
            forward through countless hours of development.
          </Typography>
        </Box>

        <Divider sx={{ my: { xs: 6, md: 8 }, borderColor: "divider" }} />

        {/* The Pivot to Open Source Section */}
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
            The Pivot to Open Source
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2, color: "text.secondary", lineHeight: 1.6 }}
          >
            After a period of strategic re-evaluation, it became clear that the
            best way to achieve our mission was to pivot to an open-source
            model, much like successful companies such as PostHog. This new
            direction is a testament to our commitment to transparency,
            community, and building a product that truly serves its users. By
            open-sourcing our core codebase and offering a paid, hosted version,
            we can democratize access to powerful technology while building a
            sustainable business.
          </Typography>
        </Box>

        <Divider sx={{ my: { xs: 6, md: 8 }, borderColor: "divider" }} />

        {/* Meet the Founder Section */}
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
                As a full-stack developer, I have been the driving force behind
                every aspect of NotaBeen. I am passionate about building
                scalable, elegant solutions and am committed to leading this
                project to success. My new vision is to create a vibrant,
                developer-led community that helps us build the future of email
                and messaging together.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 6, md: 8 }, borderColor: "divider" }} />

        {/* Our Vision Section */}
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
            Our Vision
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2, color: "text.secondary", lineHeight: 1.6, mb: 4 }}
          >
            Our vision is to build an open-source project that becomes the gold
            standard for developers and businesses alike. We believe in building
            a future where you own your data and have complete control over your
            communication tools. Join us on this journey to make NotaBeen the
            leading open-source solution for the modern web.
          </Typography>
          <Button
            href="https://github.com/NotaBeen/notabeen-ai-email-assistant"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            Explore our GitHub
          </Button>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
