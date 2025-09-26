"use client";

import React from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import Navigation from "@/components/layout/Navigation";
import PriceCard from "@/components/ui/PriceCard";
import Footer from "@/components/layout/Footer";
import { landing_page_navigation } from "@/lib/constants";
import { createLoginUrl, isAuth0Configured } from "@/utils";

// ---
// Define data for pricing plans and features
// ---

const baseSubscriptionPlans = [
  {
    id: 1,
    tier: "Open Source",
    price: 0,
    currency: "€",
    duration: "lifetime",
    usage: "Full Control",
    description: "For professionals who want full control over their data.",
    features: [
      "AI Email Prioritization",
      "Enhanced Search",
      "AI Summarization",
      "Clutter and Spam Filtering",
      "Privacy and GDPR Compliance",
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
    tier: "Managed Service",
    price: 0,
    originalPrice: 299,
    currency: "€",
    duration: "one-time at launch",
    usage: "Unlimited Usage",
    description:
      "For professionals who want a hassle-free, managed experience. Limited one-time offer!",
    features: [
      "All Open Source features",
      "Private Cloud Hosting",
      "Full-time Support",
    ],
    subscriptionLink: "",
    buttonText: "Get it Now",
    trialAvailable: false,
    isRecommended: true,
    color: {
      cardBgColor: "primary.main",
      cardTextColor: "#000000",
      buttonBgColor: "#000000",
      buttonTextColor: "#ffffff",
    },
    visible: true,
    annualPrice: 0,
    approxPerMonth: 0,
    discount: "100",
  },
];

// Define features for the comparison table
const subscriptionFeatures = [
  {
    title: "AI Email Prioritization",
    openSource: true,
    managedService: true,
  },
  {
    title: "Enhanced Search",
    openSource: true,
    managedService: true,
  },
  {
    title: "AI Summarization",
    openSource: true,
    managedService: true,
  },
  {
    title: "Clutter and Spam Filtering",
    openSource: true,
    managedService: true,
  },
  {
    title: "Privacy and GDPR Compliance",
    openSource: true,
    managedService: true,
  },
  {
    title: "Private Cloud Hosting",
    openSource: false,
    managedService: true,
  },
  {
    title: "Full-time Support",
    openSource: false,
    managedService: true,
  },
];

export default function Pricing() {
  const managedServiceLink = React.useMemo(() => createLoginUrl(), []);

  const subscriptionPlans = React.useMemo(
    () =>
      baseSubscriptionPlans.map((plan) => {
        if (plan.tier !== "Managed Service") {
          return plan;
        }

        return {
          ...plan,
          subscriptionLink: managedServiceLink ?? "",
        };
      }),
    [managedServiceLink],
  );

  if (!isAuth0Configured) {
    console.error("Auth0 audience is missing.");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navigation pages={landing_page_navigation} />
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12, mt: { xs: 2, sm: 4 } }}>
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
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
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1rem", md: "1.2rem" },
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.6,
              color: "text.secondary",
            }}
          >
            Choose the plan that fits your needs, with transparent pricing and
            no hidden fees.
          </Typography>
        </Box>

        {/* Pricing Cards */}
        <Box
          sx={{
            mx: "auto",
            mb: { xs: 6, md: 10 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "stretch",
            gap: 4,
          }}
        >
          {subscriptionPlans
            .filter((subscription) => subscription.visible)
            .map((subscription) => (
              <Box key={subscription.id} sx={{ flex: 1 }}>
                <PriceCard
                  data={subscription}
                  frequency="Lifetime"
                  currency="EUR"
                  rates={{}}
                />
              </Box>
            ))}
        </Box>

        {/* Features Comparison Table */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 4,
              textAlign: "center",
              fontSize: { xs: "1.2rem", md: "1.5rem" },
            }}
          >
            Features Comparison
          </Typography>
        </Box>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            borderRadius: 2,
            overflowX: "auto", // Added to allow horizontal scrolling on small screens
          }}
        >
          <Table aria-label="features comparison table">
            <TableHead sx={{ backgroundColor: "action.hover" }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: "1rem",
                    color: "text.primary",
                  }}
                >
                  Features
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: "1rem",
                    color: "text.primary",
                  }}
                >
                  Open Source
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: "1rem",
                    color: "text.primary",
                  }}
                >
                  Managed Service
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: "background.paper" }}>
              {subscriptionFeatures.map(
                ({ title, openSource, managedService }) => (
                  <TableRow
                    key={title}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ color: "text.secondary" }}
                    >
                      {title}
                    </TableCell>
                    <TableCell align="center">
                      {openSource ? (
                        <CheckIcon color="success" />
                      ) : (
                        <ClearIcon color="error" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {managedService ? (
                        <CheckIcon color="success" />
                      ) : (
                        <ClearIcon color="error" />
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <Box sx={{ backgroundColor: "background.paper", color: "text.primary" }}>
        <Footer />
      </Box>
    </Box>
  );
}
