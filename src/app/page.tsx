"use client";

import React, { useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import { useUser } from "@auth0/nextjs-auth0";
import Head from "next/head";
import { landing_page_navigation } from "@/lib/constants";
import { auth0Audience, auth0Scope, isAuth0Configured } from "@/utils";
import SocialProof from "@/components/landingPage/2-SocialProof";
import AudienceCallOut from "@/components/landingPage/3-AudienceCallOut";
import SolutionIntroduction from "@/components/landingPage/4-SolutionIntroduction";
import ShowExpertise from "@/components/landingPage/5-ShowExpertise";
import FullOfferStack from "@/components/landingPage/6-FullOfferStack";
import FuturePacing from "@/components/landingPage/7-FuturePacing";
import FinalCTA from "@/components/landingPage/10-FinalCTA";
import Navigation from "@/components/layout/Navigation";
import Hero from "@/components/landingPage/1-Hero";
import FaqSection from "@/components/landingPage/8-FAQ";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  if (!isAuth0Configured) {
    console.error("Auth0 audience is missing.");
    return null;
  }

  const configuredScopes = auth0Scope.split(" ").filter(Boolean);

  function validateScope(scope: string): boolean {
    const scopeSegments = scope.split(" ").filter(Boolean);
    return scopeSegments.every((segment) => configuredScopes.includes(segment));
  }

  if (!auth0Audience || !validateScope(auth0Scope)) {
    console.error("Invalid Auth0 configuration detected.");
    return null;
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
            <FaqSection />
            <FinalCTA />
          </Box>
          <Footer />
        </Box>
      </Box>
    </>
  );
}
