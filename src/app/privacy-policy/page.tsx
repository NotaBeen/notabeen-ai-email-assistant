"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Link,
} from "@mui/material";

import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { landing_page_navigation } from "@/lib/constants";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Navigation pages={landing_page_navigation} />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Header Section */}
        <Box sx={{ my: { xs: 4, md: 8 }, textAlign: "center" }}>
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
            Privacy Policy
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              color: "text.secondary",
            }}
          >
            How we collect, use, and protect your personal information.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mb: 4,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Chip
              icon={<VerifiedUserIcon />}
              label="GDPR Compliant"
              sx={{ bgcolor: "action.hover", color: "text.secondary" }}
            />
            <Chip
              icon={<SecurityIcon />}
              label="CASA Tier 2 Security Verified"
              sx={{ bgcolor: "action.hover", color: "text.secondary" }}
            />
          </Box>
          <Divider sx={{ my: 4, borderColor: "divider" }} />
        </Box>

        {/* Policy Content Sections */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            1. Introduction
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            Welcome to NotaBeen. We are committed to protecting your privacy and
            personal data. This Privacy Policy explains our practices regarding
            the collection, use, and protection of your information when you use
            our services.
          </Typography>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            2. Information We Collect
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            We collect and process the following types of information:
          </Typography>
          <List>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Personal Information: Information you provide directly to us, such as your name and email address when you create an account."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Google User Data: With your explicit consent via Google OAuth, we access your Gmail inbox emails to retrieve and prioritize them. For more details on this, see the dedicated section below."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Usage Data: Non-personal information related to how you use our service, such as browser type, pages visited, and time spent on the site. This data is collected to improve our services and is never linked to your personal identity."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}
          >
            3. Our Limited Use of Your Google User Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            <Typography
              variant="body1"
              component="span"
              sx={{ fontWeight: "bold" }}
            >
              NotaBeen accesses Gmail inbox emails only with user consent via
              Google OAuth.
            </Typography>
            &nbsp;We use read-only access to retrieve and prioritize emails
            based on predefined rules. We do not store, share, sell, or transfer
            Google user data for any purpose other than providing NotaBeen core
            functionality. NotaBeen access to Gmail data complies with Google
            Limited Use Policy and is strictly used to improve user-facing
            features.
          </Typography>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            4. How We Use Your Information
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            We use the information we collect to:
          </Typography>
          <List>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Provide and improve our services, including displaying and prioritizing emails within our dashboard."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Communicate with you about your account, updates, and our services."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Ensure the security and reliability of our platform."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            5. GDPR and Your Rights
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            We are fully compliant with GDPR regulations. As a data subject, you
            have the right to:
          </Typography>
          <List>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Access your personal data."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Request correction of inaccurate data."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Request deletion of your data."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary="Revoke consent for data processing at any time."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
          </List>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6, mt: 2 }}
          >
            You can exercise these rights by contacting us at the email address
            provided below.
          </Typography>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            6. Changes to this Policy
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            We may update this Privacy Policy periodically. Any changes will be
            posted on this page with an updated Last Updated date. Your
            continued use of NotaBeen after any changes indicates your
            acceptance of the new policy.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled", mt: 1 }}>
            Last updated: September 13, 2025
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            7. Contact Us
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            If you have any questions or concerns about this Privacy Policy or
            your data, please contact our Data Protection Officer at:
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 2 }}>
            Email:{" "}
            <Link
              href="mailto:contact@NotaBeen.com"
              sx={{ color: "primary.main", textDecoration: "none" }}
            >
              contact@NotaBeen.com
            </Link>
          </Typography>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default PrivacyPolicyPage;
