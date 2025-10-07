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

import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { landing_page_navigation } from "@/lib/constants";

/**
 * A static page component to display the application's Privacy Policy,
 * emphasizing the user's choice between the hosted service and the Open Core,
 * reinforcing Trust, Transparency, and compliance with Google's requirements.
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
            Data security is our foundation. We offer complete <strong>transparency</strong>
            with our Open Core, and strict compliance for our <strong>Hosted
            (Professional)</strong> service.
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
            Welcome to <strong>NotaBeen</strong>. We are committed to protecting your privacy
            and personal data. This Privacy Policy explains our practices
            regarding the collection, use, and protection of your information
            when you use our services. Our data practices vary depending on
            whether you use the <strong>Hosted (Professional)</strong> service or the{" "}
            <strong>Self-Hosted (Open Core)</strong> version.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.disabled", mt: 2 }}>
            Last updated: October 7, 2025
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
            We collect and process the following types of information when you
            use our <strong>Hosted (Professional) Service</strong>:
          </Typography>
          <List sx={{ ml: 2, listStyleType: "disc" }}>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary={
                  <>
                    <strong>Personal Information (Hosted)</strong>: Information you provide
                    directly to us, such as your <strong>name and email address</strong> when
                    you create an account using an OAuth provider (e.g., Google)
                    for the hosted service.
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary={
                  <>
                    <strong>Google User Data (Hosted)</strong>: With your explicit consent via
                    Google OAuth, we access your <strong>Gmail inbox emails
                    (read-only)</strong> to retrieve and prioritize them. For more
                    details, see the dedicated section below. <strong>Note: This data
                    is not collected for the Self-Hosted (Open Core) version.</strong>
                  </>
                }
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Usage Data (Hosted & Website): Non-personal, aggregated information related to how you use our hosted service and our website, such as features accessed and error logs. This data is collected solely to improve our services."
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
            3. Limited Use of Your Google User Data (Hosted Professional Service Only)
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          >
            <strong>This entire section applies only to users of our Hosted
            (Professional) service.</strong> Users of the Self-Hosted (Open Core)
            version are responsible for their own data handling and compliance.
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7, mt: 1 }}
          >
            <strong>NotaBeen accesses Gmail inbox emails only with user consent via
            Google OAuth using the `gmail.readonly` scope.</strong> We comply with
            Google’s strict <strong>Limited Use Policy</strong>:
          </Typography>
          <List sx={{ ml: 2, listStyleType: "disc" }}>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Your email content is used only for providing the core functionality of NotaBeen: prioritizing, summarizing, and displaying emails within the NotaBeen dashboard."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="We do not store, share, sell, or transfer Google user data for serving advertisements or for any non-service-related purpose."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Access is read-only. We cannot send, delete, or modify your emails in Gmail."
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
                primary="Service Provision: To provide and improve our Hosted (Professional) services, including displaying and prioritizing emails within our dashboard."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Communication: To communicate with you about your account, service updates, and changes to this policy."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Security: To ensure the security and reliability of our platform and prevent fraud."
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
            5. GDPR, Open Core, and Your Rights
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          >
            As a data processor/controller for the Hosted service, we are fully
            compliant with <strong>GDPR</strong> regulations. You have several rights
            regarding your data:
          </Typography>
          <List sx={{ ml: 2, listStyleType: "disc" }}>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Right to Access, Rectification, and Erasure (Hosted): You can exercise these rights directly via your Profile settings or by contacting us."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Right to Withdraw Consent (Hosted): Revoke consent for data processing (e.g., Gmail access) at any time."
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, display: "list-item" }}>
              <ListItemText
                primary="Data Sovereignty (Open Core): If you choose to use the Self-Hosted (Open Core) version, you have complete and direct control over all data storage and processing, as the software runs entirely on your infrastructure."
                sx={{ fontWeight: 600, color: "text.primary" }}
              />
            </ListItem>
          </List>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7, mt: 2 }}
          >
            For further assistance regarding the Hosted service, please contact
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
            your personal data used in the <strong>Hosted (Professional)</strong> service
            against unauthorized access, alteration, disclosure, or destruction.
            This includes <strong>encryption at rest and in transit</strong>, regular security
            audits, and strict access controls. Furthermore, our <strong>Open Core</strong>
            model allows for public scrutiny and audit of the source code,
            providing an additional layer of trust and transparency regarding data
            handling.
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