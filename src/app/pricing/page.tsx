// src\app\pricing\page.tsx
"use client";

import React from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableBody,
} from "@mui/material";
// Import icons for feature comparison table
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
// Local components
import Navigation from "@/components/layout/Navigation";
import PriceCard from "@/components/ui/PriceCard";
import Footer from "@/components/layout/Footer";
import { landing_page_navigation } from "@/lib/constants";


// --- TYPE DEFINITIONS for Data Structures ---

/**
 * @typedef {Object} SubscriptionPlan
 * @property {number} id - Unique identifier for the plan.
 * @property {string} tier - The public name of the pricing tier (e.g., 'NotaBeen Core').
 * @property {number} price - The standard monthly price in the specified currency.
 * @property {string} currency - The currency symbol (e.g., '€').
 * @property {string} duration - The billing cycle (e.g., 'lifetime', '/month').
 * @property {string} usage - A summary of usage limits or monetization metrics.
 * @property {string} description - A brief explanation of the plan's target user and value.
 * @property {string[]} features - A list of key features included.
 * @property {string} subscriptionLink - URL or path for sign-up/action.
 * @property {string} buttonText - Text displayed on the CTA button.
 * @property {boolean} isRecommended - Flag to highlight the plan.
 * @property {Object} color - Custom color scheme for the card.
 * @property {number} annualPrice - The total price when billed annually.
 * @property {number} approxPerMonth - The effective monthly rate when billed annually.
 * @property {string} discount - The percentage discount for the annual plan.
 */

/**
 * @typedef {Object} Feature
 * @property {string} title - The name of the feature or capability.
 * @property {boolean | string} openSource - Availability for the Core tier (boolean for yes/no, string for a specific value/limit).
 * @property {boolean | string} managedService - Availability for the Professional tier (boolean for yes/no, string for a specific value/limit).
 */


// --- CORE DATA: Pricing Plans and Features ---

/**
 * @constant {SubscriptionPlan[]}
 * @description Defines the available subscription plans. Prices are set in EUR based on a target
 * anchor price of £24.99 GBP (converted to €28.99 monthly).
 */
const subscriptionPlans = [
  {
    id: 1,
    tier: "NotaBeen Core", 
    price: 0,
    currency: "€",
    duration: "lifetime",
    usage: "Self-Hosted Codebase, 0 AI Actions", 
    description:
      "The self-hosted, MIT-licensed open core. Perfect for technical users prioritizing ultimate data sovereignty and transparency.",
    features: [
      "Core AI Prioritization & Organization",
      "Full Code Auditing & Transparency",
      "Community Support",
    ],
    subscriptionLink: "https://github.com/NotaBeen/NotaBeen",
    buttonText: "View on GitHub",
    trialAvailable: false,
    isRecommended: false,
    color: {
      cardBgColor: "#ffffff",
      cardTextColor: "#000000",
      buttonBgColor: "#f5f5f5",
      buttonTextColor: "#000000",
    },
    visible: true,
    annualPrice: 0,
    approxPerMonth: 0,
    discount: "0",
  },
  {
    id: 2,
    tier: "NotaBeen Professional",
    // Monthly price: £24.99 GBP anchor price -> ~€28.99 EUR
    price: 28.99,
    originalPrice: 28.99,
    currency: "€",
    duration: "/month", 
    // UPDATED: Usage is now Unlimited to match the high-value SaaS positioning.
    usage: "1 User + Unlimited AI Actions", 
    description:
      "For freelancers and micro-consultancies who need guaranteed convenience, maintenance, and maximum time efficiency without the technical commitment.",
    features: [
      "All NotaBeen Core features",
      "Private Cloud Hosting & Security",
      "Full-time Support & Guaranteed Uptime",
      "Hassle-free Updates & Maintenance",
    ],
    subscriptionLink: "/api/auth/signin",
    buttonText: "Start Now",
    trialAvailable: false,
    isRecommended: true,
    color: {
      cardBgColor: "primary.main",
      cardTextColor: "#000000",
      buttonBgColor: "#000000",
      buttonTextColor: "#ffffff",
    },
    visible: true,
    // Annual price: 20% discount on monthly rate, billed annually at €275.88
    annualPrice: 275.88, 
    approxPerMonth: 22.99, // Effective monthly rate: €275.88 / 12 months
    discount: "20",
  },
];

/**
 * @constant {Feature[]}
 * @description Defines features for the comparison table. Features are mapped to their presence in both tiers.
 * The value proposition is centered on 'Intelligent Prioritization' (Risk Mitigation).
 */
const subscriptionFeatures = [
  {
    title: "Intelligent Prioritization (Risk Mitigation)",
    openSource: true,
    managedService: true,
  },
  {
    title: "Automated Organization & Clutter Filtering",
    openSource: true,
    managedService: true,
  },
  {
    title: "AI Summarization & Enhanced Search",
    openSource: true,
    managedService: true,
  },
  {
    title: "Auditable MIT-Licensed Codebase",
    openSource: true,
    managedService: true,
  },
  {
    title: "Private Cloud Hosting",
    openSource: false,
    managedService: true,
  },
  {
    title: "Full-time Dedicated Support & Guaranteed Uptime",
    openSource: false,
    managedService: true,
  },
  {
    title: "Hassle-free Updates & Maintenance",
    openSource: false,
    managedService: true,
  },
  {
    // UPDATED: Removed the 500 consumption limit.
    title: "AI Actions (LLM Calls) per Month",
    openSource: false, 
    managedService: "Unlimited", 
  },
];

/**
 * @function Pricing
 * @description The Pricing page component displays the available subscription tiers and a detailed
 * comparison table of features.
 * @returns {JSX.Element} The Pricing page.
 */
export default function Pricing() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        // Soft gradient or textured background for modern feel (using theme default for safety)
        bgcolor: "background.default", 
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navigation pages={landing_page_navigation} />

      <Container
        maxWidth="lg"
        // Increased vertical padding for more breathing room
        sx={{ pt: 10, pb: 14, mt: { xs: 4, sm: 8 }, flexGrow: 1 }}
      >
        {/* Header Section: Title and Subtitle */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900, // Extra bold font for impact
              mb: 3,
              color: "text.primary",
              fontSize: { xs: "2.5rem", md: "4rem" }, // Larger, more impactful heading
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1.1rem", md: "1.35rem" },
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.7,
              color: "text.secondary",
            }}
          >
            Choose the plan that fits your needs. The <strong>NotaBeen Core</strong> is free
            and open-source. Get started with <strong>NotaBeen Professional</strong> to save
            valuable time.
          </Typography>
        </Box>

        {/* Pricing Cards: Map over the subscription plans */}
        <Box
          sx={{
            mx: "auto",
            mb: { xs: 8, md: 12 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "stretch",
            gap: 6, // Increased gap for better separation
          }}
        >
          {subscriptionPlans
            .filter((subscription) => subscription.visible)
            .map((subscription) => (
              <Box
                key={subscription.id}
                sx={{ 
                  flex: 1, 
                  minWidth: { md: 350 },
                  // Added a subtle shadow and scale effect to the recommended card (id: 2)
                  transform: subscription.isRecommended ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.3s ease-in-out',
                  zIndex: subscription.isRecommended ? 10 : 1, // Bring recommended card to front
                  // Highlighted border for visual separation
                  border: (theme) => `2px solid ${subscription.isRecommended ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: 3, // Slightly more rounded corners
                  overflow: 'hidden',
                }}
              >
                <PriceCard
                  data={subscription}
                  frequency="Lifetime"
                  currency="EUR"
                  rates={{}}
                />
              </Box>
            ))}
        </Box>

        {/* Features Comparison Table Section */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h4" // Slightly reduced header size here for hierarchy
            gutterBottom
            sx={{
              fontWeight: 800,
              mb: 5,
              textAlign: "center",
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Detailed Feature Comparison
          </Typography>
        </Box>
        <TableContainer
          component={Paper}
          elevation={6} // Increased shadow for a modern, lifted look
          sx={{
            borderRadius: 3, // Matches card curvature
            overflowX: "auto",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Table aria-label="features comparison table" sx={{ minWidth: 650 }}>
            {/* Table Header with Plan Names */}
            <TableHead sx={{ backgroundColor: "action.hover" }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 800, // Bolder header text
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: "1.05rem",
                    color: "text.primary",
                    width: "50%",
                  }}
                >
                  Features
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 800,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: "1.05rem",
                    color: "text.primary",
                  }}
                >
                  NotaBeen Core
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 800,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: "1.05rem",
                    color: "text.primary",
                  }}
                >
                  NotaBeen Professional
                </TableCell>
              </TableRow>
            </TableHead>
            {/* Table Body: Map over subscription features */}
            <TableBody sx={{ bgcolor: "background.paper" }}>
              {subscriptionFeatures.map(
                ({ title, openSource, managedService }) => (
                  <TableRow
                    key={title}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      // Use a subtle striped effect for better table scanning
                      "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ color: "text.primary", fontWeight: 600 }} // Feature titles slightly bolder
                    >
                      {title}
                    </TableCell>
                    {/* Render status for NotaBeen Core */}
                    <TableCell align="center">
                      {typeof openSource === "boolean" ? (
                        openSource ? (
                          <CheckIcon color="success" />
                        ) : (
                          <ClearIcon color="error" />
                        )
                      ) : (
                        // Render usage limit text
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{openSource}</Typography>
                      )}
                    </TableCell>
                    {/* Render status for NotaBeen Professional */}
                    <TableCell align="center">
                      {typeof managedService === "boolean" ? (
                        managedService ? (
                          <CheckIcon color="success" />
                        ) : (
                          <ClearIcon color="error" />
                        )
                      ) : (
                        // Render usage limit text
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main" }}>{managedService}</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Footer is fixed to the bottom */}
      <Box
        sx={{
          backgroundColor: "background.paper",
          color: "text.primary",
          flexShrink: 0,
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}