// src\app\cookie-policy\page.tsx
"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { landing_page_navigation } from "@/lib/constants";

/**
 * Renders the static Cookie Policy page for the application.
 * Highlights the difference in cookie control between Hosted and Self-Hosted options.
 */
const CookiePolicyPage = () => {
  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      {/* Navigation Header */}
      <Navigation pages={landing_page_navigation} />

      {/* Main Content Container */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Header Section */}
        <Box sx={{ my: { xs: 4, md: 8 } }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Cookie Policy
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 1, color: "text.secondary", lineHeight: 1.6 }}
          >
            This policy outlines how <strong>NotaBeen</strong> uses cookies and similar
            technologies to provide, protect, and improve our <strong>Hosted
            (Professional)</strong> services and our public website. Our <strong>Open Core</strong>
            model gives self-hosted users absolute control over their own cookie
            usage.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            Effective Date: October 7, 2025
          </Typography>
          <Divider sx={{ my: 4, borderColor: "divider" }} />
        </Box>

        {/* 1. What Are Cookies? */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            1. What Are Cookies?
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            Cookies are small text files that are placed on your device by
            websites that you visit. They are widely used to make websites work
            more efficiently, as well as to provide information to the owners of
            the site regarding user activity and preferences.
          </Typography>
        </Box>

        {/* 2. How We Use Cookies (Applicable to Hosted Service & Website) */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            2. How We Use Cookies
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6, mb: 1 }}
          >
            For the NotaBeen website and <strong>Hosted (Professional) Service</strong>, we use cookies for the following categories:
          </Typography>
          <List>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <>
                    <strong>Strictly Necessary Cookies:</strong> These are essential for the
                    operation of our website and hosted app, enabling core
                    functionality like authentication (session management) and
                    security. They cannot be turned off as they are required for
                    the service to function.
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <>
                    <strong>Performance and Analytics Cookies:</strong> We use these cookies
                    to collect information about how visitors use our website and
                    hosted service. This data is <strong>aggregated and anonymous</strong>,
                    helping us to understand which features are used and how we
                    can improve the user experience and ROI.
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <>
                    <strong>Functionality Cookies:</strong> These cookies remember your
                    preferences and settings, such as theme or language, to
                    provide a more personalized and convenient experience.
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
          </List>
        </Box>

        {/* 3. Third-Party Cookies */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            3. Third-Party Cookies
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            In addition to our own cookies, we may use various <strong>third-party
            cookies</strong> (e.g., from secure analytics providers or payment processors) to report usage
            statistics of the website and facilitate services like user
            authentication. These cookies are governed by the respective privacy
            and cookie policies of the third parties.
          </Typography>
        </Box>

        {/* 4. Open Core & Self-Hosted Control (NEW SECTION) */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            4. Open Core and Self-Hosted Control
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            The <strong>NotaBeen Open Core</strong> is designed for <strong>data sovereignty</strong>. When
            you choose to <strong>self-host</strong> the NotaBeen application, all data,
            including the use of cookies within the application environment, is
            under your direct control. <strong>You</strong> are the administrator and
            controller, allowing you to audit the source code for full
            transparency and configure the application to meet your specific
            compliance requirements without reliance on us.
          </Typography>
        </Box>

        {/* 5. Your Choices (RENUMBERED) */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            5. Your Choices
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            Most web browsers automatically accept cookies, but you can usually
            modify your browser settings to decline cookies. However, please be
            aware that if you choose to <strong>refuse strictly necessary cookies</strong>, you may not be able
            to fully experience the interactive and core functional features of
            our <strong>Hosted (Professional) Service</strong> and website. You can find more information about managing cookies on
            your browser help pages or through its settings.
          </Typography>
        </Box>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default CookiePolicyPage;