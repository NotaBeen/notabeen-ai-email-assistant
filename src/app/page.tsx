"use client";

import React, { useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import { useUser } from "@auth0/nextjs-auth0";
import Head from "next/head";
import { landing_page_navigation } from "@/lib/constants";
import SocialProof from "@/components/landingPage/2-SocialProof";
import AudienceCallOut from "@/components/landingPage/3-AudienceCallOut";
import SolutionIntroduction from "@/components/landingPage/4-SolutionIntroduction";
import ShowExpertise from "@/components/landingPage/5-ShowExpertise";
import FullOfferStack from "@/components/landingPage/6-FullOfferStack";
import FuturePacing from "@/components/landingPage/7-FuturePacing";
import FinalCTA from "@/components/landingPage/10-FinalCTA";
import Navigation from "@/components/layout/Navigation";
import Hero from "@/components/landingPage/1-Hero";
import FAQ from "@/components/landingPage/8-FAQ";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  // Define allowed audience and scope
  const allowedAudience = "urn:my-api";
  const allowedScopes = [
    "openid",
    "profile",
    "email",
    "https://www.googleapis.com/auth/gmail.readonly",
  ];

  // Validate audience and scope
  const audience = "urn:my-api";
  const scope =
    "openid profile email https://www.googleapis.com/auth/gmail.readonly";

  if (!validateAudience(audience) || !validateScope(scope)) {
    console.error("Invalid audience or scope.");
    return null; // or fallback to a safe route
  }

  // Validate and encode URL parameters
  function validateAudience(audience: string) {
    return audience === allowedAudience;
  }

  function validateScope(scope: string) {
    return scope.split(" ").every((s: string) => allowedScopes.includes(s));
  }

  return (
    <>
      <Head>
        <title>Notabeen- AI-Powered Email Analysis</title>
        <meta
          name="description"
          content="Analyze your emails with AI to improve tone, clarity, and professionalism."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Notabeen- AI-Powered Email Analysis"
        />
        <meta
          property="og:description"
          content="Enhance your email communication with AI insights."
        />
        <meta property="og:type" content="website" />
      </Head>

      <CssBaseline />
      <Box
        sx={{
          minHeight: "101vh",
          width: "100%",
          backgroundColor: "#FFFFFF",
          color: "#000000",
        }}
      >
        <Box sx={{ minHeight: "81vh", width: "100%" }}>
          <Navigation pages={landing_page_navigation} />
          <Box>
            <Hero />
            <SocialProof />
            <AudienceCallOut />
            <SolutionIntroduction />
            <ShowExpertise />
            <FullOfferStack />
            <FuturePacing />
            <FAQ />
            <FinalCTA />
          </Box>
          <Footer />
        </Box>
      </Box>
    </>
  );
}
