// src/app/page.tsx
"use client";

import React, { useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { landing_page_navigation } from "@/lib/constants";

// Import all landing page sections
import Hero from "@/components/landingPage/1-Hero";
import SocialProof from "@/components/landingPage/2-SocialProof";
import AudienceCallOut from "@/components/landingPage/3-AudienceCallOut";
import SolutionIntroduction from "@/components/landingPage/4-SolutionIntroduction";
import ShowExpertise from "@/components/landingPage/5-ShowExpertise";
import FullOfferStack from "@/components/landingPage/6-FullOfferStack";
import FuturePacing from "@/components/landingPage/7-FuturePacing";
import FAQ from "@/components/landingPage/8-FAQ";
import FinalCTA from "@/components/landingPage/10-FinalCTA";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

/**
 * The main Landing Page component.
 * It handles the rendering of all landing page sections and redirects
 * authenticated users directly to the dashboard.
 * @returns {JSX.Element} The Home page content.
 */
export default function Home() {
  // Use NextAuth's useSession hook to check the user's authentication status
  const { data: session, status } = useSession();

  /**
   * Effect hook to handle automatic redirection for authenticated users.
   * Runs only when the session status or data changes.
   */
  useEffect(() => {
    // Check if the session is loaded and the user is authenticated
    if (status === "authenticated" && session?.user) {
      console.log("User is authenticated. Redirecting to dashboard.");
      // Redirect to the protected dashboard page
      // window.location.href is used for simplicity/minimal change
      window.location.href = "/dashboard";
    }
  }, [session, status]);

  // If the session status is 'loading', we can return null or a loader,
  // but since the landing page is public, we just render the content immediately
  // while the useEffect handles the redirect on successful authentication.

  return (
    <>
      <Head>
        {/* SEO Metadata for the landing page */}
        <title>
          Notabeen - Cut Email Time in Half. Get Back to What Matters.
        </title>
        <meta
          name="description"
          content="An AI assistant that sorts, summarizes, and prioritizes your professional Gmail, so you can spend less time on clutter and more time on high-impact work. The project is open-source and built for professionals who want to stop inbox anxiety."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Notabeen - AI-Powered Email Analysis"
        />
        <meta
          property="og:description"
          content="Enhance your email communication and productivity with AI insights."
        />
        <meta property="og:type" content="website" />
      </Head>

      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh", // Use 100vh for standard full height
          width: "100%",
          backgroundColor: "#FFFFFF",
          color: "#000000",
        }}
      >
        {/* The Navigation component */}
        <Navigation pages={landing_page_navigation} />

        {/* Main Content Sections */}
        <Box component="main">
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

        {/* The Footer component */}
        <Footer />
      </Box>
    </>
  );
}
