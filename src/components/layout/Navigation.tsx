// src/components/layout/Navigation.tsx
"use client";

import * as React from "react";
import {
  Box,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Link,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import posthog from "posthog-js";
import { signIn } from "next-auth/react";

/**
 * Defines the structure for a navigation item.
 */
interface NavPage {
  name: string;
  address: string;
}

/**
 * Defines the props for the Navigation component.
 */
interface NavigationProps {
  pages: NavPage[];
}

/**
 * Navigation component acts as the sticky header/navbar for the application.
 * It features responsive design with a full menu for desktop and a hamburger
 * menu for mobile. It also includes the primary Call-to-Action (CTA) button.
 *
 * @param {NavigationProps} { pages } The array of navigation links.
 * @returns {JSX.Element} The Navigation bar component.
 */
export default function Navigation({ pages }: NavigationProps) {
  // State to manage the anchor element for the mobile navigation menu.
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );

  /**
   * Opens the mobile navigation menu.
   * @param {React.MouseEvent<HTMLElement>} event The click event.
   */
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  /**
   * Closes the mobile navigation menu.
   */
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box
      component="header" // Semantic HTML for the header/navbar
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100, // Standard z-index for app bars/headers
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)", // Subtle shadow for lift effect
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: { xs: 1.5, md: 2 }, // Responsive vertical padding
          }}
        >
          {/* 1. Desktop Logo (Hidden on mobile) */}
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

          {/* 2. Mobile Menu (Hamburger Icon and Menu) */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
            }}
          >
            {/* Hamburger Icon Button */}
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            {/* Mobile Navigation Menu */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" }, mt: 1 }}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: "background.paper",
                    color: "text.primary",
                    width: 250,
                    boxShadow: 2,
                  },
                },
              }}
            >
              {/* Menu Items (Mobile Links) */}
              {pages.map(({ name, address }) => (
                <MenuItem
                  key={name}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href={address}
                  // Force the Link component to handle navigation directly
                  // Mui Link passes props to the inner element (Button or div), so we pass them here
                  sx={{
                    color: "text.secondary",
                    py: 1.5,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Typography
                    textAlign="left"
                    sx={{ fontWeight: 600, width: "100%", color: "inherit" }}
                  >
                    {name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>

            {/* Mobile Logo (Aligned to center via flex-grow and padding) */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                flexGrow: 1, // Pushes the logo to the center relative to the other content
                justifyContent: "center",
                pr: 5, // Counteract the space taken by the hamburger icon
              }}
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
          </Box>

          {/* 3. Desktop Navigation Links (Hidden on mobile) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              flexGrow: 1, // Allows links to take central space between logo and button
            }}
          >
            {pages.map(({ name, address }: NavPage) => (
              <Button
                key={name}
                component={Link}
                href={address}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: "text.secondary",
                  display: "block",
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 500,
                  "&:hover": {
                    color: "primary.main",
                    bgcolor: "transparent",
                  },
                }}
              >
                {name}
              </Button>
            ))}
          </Box>

          {/* 4. Get Started Button (CTA) */}
          <Button
            variant="contained"
            size="medium" // Use medium size for better control
            sx={{
              fontWeight: 600,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              px: { xs: 2, md: 3 },
              py: { xs: 0.8, md: 1 }, // Fine-tuned padding for a better look
              borderRadius: 2,
              textTransform: "none",
              // Ensure button is always visible on all screen sizes, but styled differently
              // flexShrink: 0 is important to keep the button from squishing
              flexShrink: 0,
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
            // Use Button component property when handling onClick actions
            component="button"
            onClick={() => {
              // Posthog tracking for analytics
              if (typeof posthog !== "undefined") {
                posthog.capture("get_started_button_click");
              }
              // Trigger sign-in flow (e.g., Google OAuth)
              signIn("google");
            }}
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
