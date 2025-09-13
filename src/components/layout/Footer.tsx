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

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        pt: { xs: 8, md: 10 },
        pb: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Main Flexbox Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 6, md: 8 },
            justifyContent: "space-between",
          }}
        >
          {/* Logo and Description Section */}
          <Box sx={{ mb: { xs: 4, md: 0 } }}>
            <Box
              sx={{ display: { xs: "none", md: "flex" } }}
              component={Link}
              href="/"
              underline="none"
            >
              <Typography variant="h6" noWrap sx={{ fontWeight: 500 }}>
                <Box
                  component="img"
                  src="/web-app-manifest-512x512.png"
                  alt="NotaBeen Logo"
                  sx={{ width: 32, height: 32, mr: 1 }}
                />{" "}
                NotaBeen
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                maxWidth: { xs: "100%", sm: "320px" },
                lineHeight: 1.5,
                mt: 2,
              }}
            >
              Secure, AI-powered email prioritization to see through email
              chaos.
            </Typography>
          </Box>

          {/* Navigation Links Section */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 4, md: 6 },
              justifyContent: { xs: "flex-start", md: "flex-end" },
              flex: 1, // Allows the links section to grow and take up space
            }}
          >
            {footer_links.routes.map((route) => (
              <Box key={route.title}>
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
                <Stack spacing={1}>
                  {route.links.map(
                    (link) =>
                      link && (
                        <Link
                          variant="body2"
                          key={link.title}
                          href={link.url}
                          underline="none"
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

        {/* Divider */}
        <Divider
          sx={{
            mt: { xs: 6, md: 8 },
            mb: { xs: 3, md: 4 },
            borderColor: "divider",
          }}
        />

        {/* Copyright and Social Media Section */}
        <footer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              © {year} NotaBeen. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {footer_links.social_media.map((social) => (
                <Link
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  key={social.title}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    color: "text.secondary",
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
        </footer>
      </Container>
    </Box>
  );
}
