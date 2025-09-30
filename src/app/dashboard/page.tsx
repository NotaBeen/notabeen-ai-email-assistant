// src/app/dashboard/page.tsx
"use client";
import { Box } from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react"; // Removed unused 'useRef'
import Profile from "@/app/dashboard/components/screen/profile/Profile";
import NavBarTop from "@/app/dashboard/components/navigation/NavBarTop";
import TermsConditionsPopup from "@/components/popup/TermsConditionsPopup";
import posthog from "posthog-js";
import Overview from "./components/screen/overview/Overview";
import { Email } from "@/types/interfaces";

type CurrentEmail = Email;

function Dashboard() {
  const { data: session, status } = useSession();
  const user = session?.user;

  // Assuming the NextAuth session callback injects 'googleAccessToken' as a string.
  const accessToken = (session as { googleAccessToken?: string })
    ?.googleAccessToken;

  const [screen, setScreen] = useState("overview");
  const [currentEmail, setCurrentEmail] = useState<CurrentEmail | null>(null);

  const [emails, setEmails] = useState<Email[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  console.log(isDataLoading);
  // Removed unused state: overviewOpen
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  const [activeFilter, setActiveFilter] = useState("urgent");
  const [initialRefreshDone, setInitialRefreshDone] = useState(false);

  // Function to fetch user data and terms acceptance
  const fetchUserDataAndVerifyEmail = useCallback(async () => {
    if (!user) return;
    setIsDataLoading(true);
    try {
      const response = await fetch("/api/user", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setTermsAccepted(data.terms_acceptance || false);
      } else {
        console.error(
          "Failed to fetch user data:",
          response.status,
          response.statusText,
        );
        setTermsAccepted(false);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch user data:", error);
      setTermsAccepted(false);
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  // Function to fetch emails from the backend (processed emails for display)
  const getEmails = useCallback(async () => {
    if (termsAccepted === false || !accessToken) return;
    setIsDataLoading(true);

    try {
      const response = await fetch("/api/user/emails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
        console.log("Successfully fetched emails for display.");
      } else {
        // Attempt to log JSON error from server
        try {
          const errorData = await response.json();
          console.error("Failed to fetch emails:", errorData);
        } catch {
          console.error("Failed to fetch emails. Status:", response.status);
        }
      }
    } catch (error) {
      console.error("Network error, failed to fetch emails:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, [accessToken, termsAccepted]);

  // Function to refresh the inbox by calling the Gmail API
  const refreshInbox = useCallback(
    async (isInitialLoad = false) => {
      if (termsAccepted === false || !accessToken) return;
      setIsDataLoading(true);
      try {
        const response = await fetch("/api/gmail", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          await getEmails(); // Fetch the new list of emails for display
          posthog.capture("gmail_connected");
          if (isInitialLoad) setInitialRefreshDone(true);
        } else {
          console.error("Failed to process emails. Status:", response.status);
          if (response.status === 401) {
            // User's Google token is likely expired/revoked
            await signOut({ callbackUrl: "/" });
          }
        }
      } catch (error) {
        console.error("Failed to process emails:", error);
      } finally {
        setIsDataLoading(false);
      }
    },
    [accessToken, getEmails, termsAccepted],
  );

  // 1. useEffect for fetching user data and continuous terms status check
  useEffect(() => {
    fetchUserDataAndVerifyEmail();

    let intervalId: NodeJS.Timeout | undefined;
    if (session) {
      intervalId = setInterval(() => {
        setIsDataLoading(true);
        fetchUserDataAndVerifyEmail();
      }, 30000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [session, fetchUserDataAndVerifyEmail]);

  // 2. useEffect for email processing and display refresh based on terms acceptance
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (termsAccepted === true) {
      console.log(
        "Terms accepted. Checking for initial refresh and setting up interval.",
      );
      if (!initialRefreshDone) {
        refreshInbox(true); // Call the API immediately upon loading
      } else {
        getEmails(); // If initial refresh is done, just fetch the current list for display
      }
      // Set up the interval for continuous refresh
      intervalId = setInterval(() => {
        refreshInbox();
      }, 30000);

      return () => clearInterval(intervalId);
    } else if (termsAccepted === false) {
      console.log(
        "Terms not accepted. Not fetching emails or setting up refresh.",
      );
    }
    // Cleanup if termsAccepted changes to null (e.g., on signout)
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [termsAccepted, getEmails, refreshInbox, initialRefreshDone]);

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
  };

  // --- Early Returns MUST be after all Hook calls ---
  if (status === "loading") {
    return <Box sx={{ p: 4 }}>Loading Session...</Box>;
  }
  if (status === "unauthenticated") {
    return null;
  }
  // --- End Early Returns ---

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        color: "#000000",
        overflow: "hidden",
      }}
    >
      <Box sx={{ height: "7%", width: "100%", backgroundColor: "#F2EEEC" }}>
        <NavBarTop
          setEmails={setEmails}
          setScreen={setScreen}
          setOverviewOpen={() => {}}
        />
      </Box>

      {termsAccepted === false && (
        <TermsConditionsPopup onAcceptTerms={handleTermsAccepted} />
      )}

      <Box sx={{ height: "93%", width: "100%" }}>
        {screen === "overview" && (
          <Box sx={{ height: "100%", width: "100%" }}>
            <Overview
              emails={emails}
              setCurrentEmail={setCurrentEmail}
              currentEmail={currentEmail}
              setScreen={setScreen}
              accessToken={accessToken || ""}
              setEmails={setEmails}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </Box>
        )}

        {screen === "profile" && (
          <Box sx={{ height: "100%", width: "100%" }}>
            <Profile />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
