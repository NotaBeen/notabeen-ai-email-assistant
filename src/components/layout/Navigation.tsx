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
import { createLoginUrl, isAuth0Configured } from "@/utils";

interface NavigationPage {
  readonly name: string;
  readonly address: string;
}

interface NavigationProps {
  readonly pages: ReadonlyArray<NavigationPage>;
}

export default function Navigation({ pages }: Readonly<NavigationProps>) {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleGetStarted = () => {
    const url = createLoginUrl();
    if (!url) {
      console.error("Unable to generate Auth0 login URL. Check configuration.");
      return;
    }

    posthog.capture("get_started_button_click");
    window.location.href = url;
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100, // AppBar's default z-index
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: { xs: 1.5, md: 2 }, // Adjusted vertical padding for mobile
          }}
        >
          {/* Desktop Logo */}
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

          {/* Mobile Menu & Logo */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
            }}
          >
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
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
              {pages.map((page) => (
                <MenuItem
                  key={page.name}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  href={page.address}
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
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            {/* Mobile Logo */}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                justifyContent: "center",
                pr: 5, // Added right padding to center the logo
              }}
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
          </Box>

          {/* Desktop Navigation Links */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                href={page.address}
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
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Get Started Button */}
          <Button
            variant="contained"
            sx={{
              fontWeight: 600,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              px: { xs: 2, md: 3 },
              py: { xs: 0.8, md: 1.5 },
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
            onClick={handleGetStarted}
            disabled={!isAuth0Configured}
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
