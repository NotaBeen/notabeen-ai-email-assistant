"use client";

import {
  Box,
  Container,
  Divider,
  Typography,
  Stack,
  Link,
} from "@mui/material";
import React from "react";
import { footer_links } from "@/lib/constants";
import Icon from "../ui/Icon";

/**
 * The Footer component provides site navigation, branding, and legal links.
 * It is structured into three main parts: Logo/Description, Navigation Links,
 * and Copyright/Social Media.
 * @returns {JSX.Element} The Footer component.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer" // Semantically correct tag
      sx={{
        bgcolor: "background.paper",
        pt: { xs: 8, md: 10 },
        pb: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* --- 1. Main Content: Logo/Description and Navigation Links --- */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 6, md: 8 },
            justifyContent: "space-between",
          }}
        >
          {/* A. Logo and Description Section */}
          <Box
            sx={{ mb: { xs: 4, md: 0 }, flexShrink: 0, width: { md: "30%" } }}
          >
            {/* Logo and Name (visible on desktop) */}
            <Box
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
              component={Link}
              href="/"
              underline="none"
              color="text.primary"
            >
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                <Box
                  component="img"
                  src="/web-app-manifest-512x512.png"
                  alt="NotaBeen Logo"
                  sx={{ width: 32, height: 32, mr: 1, verticalAlign: "middle" }}
                />
                NotaBeen
              </Typography>
            </Box>
            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                maxWidth: { xs: "100%", sm: "320px" },
                lineHeight: 1.6,
                mt: 2,
              }}
            >
              Secure, AI-powered email prioritization to cut through inbox chaos
              and boost professional productivity.
            </Typography>
          </Box>

          {/* B. Navigation Links Section */}
          <Box
            sx={{
              display: "grid",
              // Create a responsive 2 or 3 column layout for links
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, minmax(120px, 1fr))",
                md: "repeat(3, max-content)", // Max content helps alignment on desktop
              },
              gap: { xs: 4, md: 8 },
              justifyContent: { xs: "flex-start", md: "flex-end" },
              flex: 1,
            }}
          >
            {footer_links.routes.map((route) => (
              <Box key={route.title}>
                {/* Link Group Title */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: "text.primary",
                    fontSize: { xs: "1rem", md: "1.1rem" },
                  }}
                >
                  {route.title}
                </Typography>
                {/* Individual Links */}
                <Stack spacing={1}>
                  {route.links.map(
                    (link) =>
                      link && (
                        <Link
                          variant="body2"
                          key={link.title}
                          href={link.url}
                          underline="none"
                          target={link.url.startsWith("/") ? "_self" : "_blank"} // Open external links in new tab
                          rel={
                            link.url.startsWith("/")
                              ? ""
                              : "noopener noreferrer"
                          }
                          sx={{
                            color: "text.secondary",
                            transition: "color 0.2s",
                            fontSize: { xs: "0.875rem", md: "0.9rem" },
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          {link.title}
                        </Link>
                      ),
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        {/* --- 2. Separator --- */}
        <Divider
          sx={{
            mt: { xs: 6, md: 8 },
            mb: { xs: 3, md: 4 },
            borderColor: "divider",
          }}
        />

        {/* --- 3. Bottom Row: Copyright and Social Media --- */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: { xs: 3, sm: 0 },
          }}
        >
          {/* Copyright */}
          <Typography
            variant="body2"
            sx={{
              color: "text.disabled",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            © {year} NotaBeen. All rights reserved. Built with privacy in mind.
          </Typography>
          {/* Social Media Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {footer_links.social_media.map((social) => (
              <Link
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                key={social.title}
                aria-label={`Link to NotaBeen's ${social.title} page`}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "text.secondary",
                  fontSize: 24, // Control icon size
                  transition: "color 0.2s",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                <Icon icon={social.title} />
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
