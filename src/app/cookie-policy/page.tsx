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
 * Follows standard legal policy structure using Material-UI for styling.
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
            sx={{ mb: 2, color: "text.secondary", lineHeight: 1.6 }}
          >
            This policy outlines how **NotaBeen** uses cookies and similar
            technologies to provide, protect, and improve our services. By using
            our website, you consent to our use of cookies in accordance with
            this policy.
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

        {/* 2. How We Use Cookies */}
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
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            We use cookies for the following purposes:
          </Typography>
          <List>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <>
                    **Strictly Necessary Cookies:** These are essential for the
                    operation of our website, enabling core functionality like
                    security, network management, and accessibility (e.g.,
                    cookies for authenticating users). They cannot be turned
                    off.
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <>
                    **Performance and Analytics Cookies:** We use these cookies
                    to collect information about how visitors use our website.
                    This data is aggregated and anonymous, helping us to
                    understand which pages are popular and how we can improve
                    the user experience.
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <>
                    **Functionality Cookies:** These cookies remember your
                    preferences and settings, such as theme, language, or
                    region, to provide a more personalized and convenient
                    experience.
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
            In addition to our own cookies, we may use various **third-party
            cookies** (e.g., from analytics providers) to report usage
            statistics of the website and facilitate services like user
            authentication. These cookies are governed by the respective privacy
            and cookie policies of the third parties.
          </Typography>
        </Box>

        {/* 4. Your Choices */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            4. Your Choices
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            Most web browsers automatically accept cookies, but you can usually
            modify your browser settings to decline cookies. However, please be
            aware that if you choose to **refuse cookies**, you may not be able
            to fully experience the interactive and core functional features of
            our website. You can find more information about managing cookies on
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
