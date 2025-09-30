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

/**
 * A static page component to display the application's Privacy Policy,
 * emphasizing GDPR compliance and the use of Google User Data.
 * @returns {JSX.Element} The PrivacyPolicyPage component.
 */
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
            How we collect, use, and protect your personal information. Your
            privacy is our priority.
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
              variant="outlined"
              sx={{
                bgcolor: "background.default",
                color: "text.primary",
                borderColor: "divider",
              }}
            />
            <Chip
              icon={<SecurityIcon />}
              label="CASA Tier 2 Security Verified"
              variant="outlined"
              sx={{
                bgcolor: "background.default",
                color: "text.primary",
                borderColor: "divider",
              }}
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
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          >
            Welcome to **NotaBeen**. We are committed to protecting your privacy
            and personal data. This Privacy Policy explains our practices
            regarding the collection, use, and protection of your information
            when you use our services.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled", mt: 2 }}>
            Last updated: September 13, 2025
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
            sx={{ color: "text.secondary", lineHeight: 1.7, mb: 1 }}
          >
            We collect and process the following types of information:
          </Typography>
          <List sx={{ ml: 2, listStyleType: "disc" }}>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary={
                  <>
                    **Personal Information**: Information you provide directly
                    to us, such as your **name and email address** when you
                    create an account using an OAuth provider (e.g., Google).
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary={
                  <>
                    **Google User Data**: With your explicit consent via Google
                    OAuth, we access your **Gmail inbox emails (read-only)** to
                    retrieve and prioritize them. For more details, see the
                    dedicated section below.
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="**Usage Data**: Non-personal, aggregated information related to how you use our service, such as features accessed and error logs. This data is collected solely to improve our services."
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
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          >
            **NotaBeen accesses Gmail inbox emails only with user consent via
            Google OAuth using the `gmail.readonly` scope.** We comply with
            Google’s strict **Limited Use Policy**:
          </Typography>
          <List sx={{ ml: 2, listStyleType: "disc" }}>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Your email content is used **only** for providing the core functionality of NotaBeen: prioritizing, summarizing, and displaying emails within the NotaBeen dashboard."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="We **do not** store, share, sell, or transfer Google user data for serving advertisements or for any non-service-related purpose."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Access is **read-only**. We cannot send, delete, or modify your emails in Gmail."
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
            4. How We Use Your Information
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7, mb: 1 }}
          >
            We use the information we collect for the following legitimate
            purposes:
          </Typography>
          <List sx={{ ml: 2, listStyleType: "disc" }}>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="**Service Provision**: To provide and improve our services, including displaying and prioritizing emails within our dashboard."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="**Communication**: To communicate with you about your account, service updates, and changes to this policy."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="**Security**: To ensure the security and reliability of our platform and prevent fraud."
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
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          >
            As a data processor/controller operating in the EU, we are fully
            compliant with **GDPR** regulations. You have several rights
            regarding your data:
          </Typography>
          <List sx={{ ml: 2, listStyleType: "disc" }}>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="**Right to Access**: Obtain a copy of the personal data we hold about you."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="**Right to Rectification**: Request correction of inaccurate data."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="**Right to Erasure ('Right to be Forgotten')**: Request the deletion of your data. This can be done directly via your Profile settings."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="**Right to Withdraw Consent**: Revoke consent for data processing (e.g., Gmail access) at any time."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
          </List>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7, mt: 2 }}
          >
            You can exercise most of these rights directly through your **user
            profile** in the dashboard. For further assistance, please contact
            us using the information below.
          </Typography>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
          >
            6. Data Security
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          >
            We implement robust technical and organizational measures to protect
            your personal data against unauthorized access, alteration,
            disclosure, or destruction. This includes **encryption at rest and
            in transit**, regular security audits, and strict access controls.
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
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          >
            If you have any questions or concerns about this Privacy Policy or
            your data, please contact our Data Protection Officer at:
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 2 }}>
            Email:{" "}
            <Link
              href="mailto:contact@NotaBeen.com"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 600,
              }}
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
