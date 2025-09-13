"use client";
import { Box } from "@mui/material";
import { useUser } from "@auth0/nextjs-auth0";
import { useEffect, useState, useCallback } from "react";
import Profile from "@/app/dashboard/components/screen/profile/Profile";
import NavBarTop from "@/app/dashboard/components/navigation/NavBarTop";
import TermsConditionsPopup from "@/components/popup/TermsConditionsPopup";
import posthog from "posthog-js";
import Overview from "./components/screen/overview/Overview";
import { Email } from "@/types/interfaces";

type CurrentEmail = Email;

function Dashboard() {
  const { user } = useUser();
  const [screen, setScreen] = useState("overview");
  const [currentEmail, setCurrentEmail] = useState<CurrentEmail | null>(null);

  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  // State to track the active filter
  const [activeFilter, setActiveFilter] = useState("urgent");
  console.log(overviewOpen);
  console.log(isLoading);

  const accessToken = user?.auth0_access_token;

  // Function to fetch emails from the backend
  const getEmails = useCallback(async () => {
    if (termsAccepted === false) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/emails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
        console.log("Successfully fetched emails.");
      } else {
        try {
          await response.json();
        } catch (jsonError) {
          console.error("Failed to parse JSON error response:", jsonError);
        }
      }
    } catch (error) {
      console.error("Network error, failed to fetch emails:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, termsAccepted]);

  // Function to refresh the inbox by calling the Gmail API
  const refreshInbox = useCallback(async () => {
    if (termsAccepted === false) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/gmail", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        await getEmails();
        // Capture the gmail_connected event ONLY if the response is successful
        posthog.capture("gmail_connected");
      } else {
        console.error("Failed to process emails. Status:", response.status);
        if (response.status === 401) {
          window.location.href = "/auth/logout";
        }
        // Optional: Capture a 'gmail_connection_failed' event with error details
        posthog.capture("gmail_connection_failed", {
          status: response.status,
          error_message: await response.text(), // Get the error message from the response body
        });
      }
    } catch (error) {
      console.error("Failed to process emails:", error);
      // Capture a 'gmail_connection_failed' event for network/other errors
      posthog.capture("gmail_connection_failed", {
        error_message:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : String(error),
        error_type:
          typeof error === "object" && error !== null && "name" in error
            ? (error as { name?: string }).name
            : typeof error,
      });
    } finally {
      setIsLoading(false); // getEmails already sets this
    }
  }, [accessToken, getEmails, termsAccepted]);

  // Primary user data fetching and initial setup
  const fetchUserDataAndVerifyEmail = useCallback(async () => {
    if (!user) return; // Only proceed if Auth0 user session exists

    try {
      const response = await fetch("/api/user", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setTermsAccepted(data.terms_acceptance || false);
      } else {
        console.error(
          "Failed to fetch user data:",
          response.status,
          response.statusText,
        );
        // If user data can't be fetched, assume unverified or issues
        setTermsAccepted(false); // Or handle as appropriate for your app's flow
      }
    } catch (error: unknown) {
      console.error("Failed to fetch user data:", error);
      setTermsAccepted(false);
    } finally {
      setIsLoading(false); // End loading after initial user data check
    }
  }, [user]);

  useEffect(() => {
    // This effect runs only once when the `user` object becomes available
    // and then periodically refreshes the user data.
    fetchUserDataAndVerifyEmail(); // Initial call

    let intervalId: NodeJS.Timeout | undefined;
    if (user) {
      intervalId = setInterval(() => {
        setIsLoading(true); // Set loading state before fetching
        fetchUserDataAndVerifyEmail(); // Refresh user data and verification status
      }, 30000); // Check user data every 30 seconds
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, fetchUserDataAndVerifyEmail]); // Depend on user and the memoized function

  // Separate useEffect for email fetching and auto-refresh,
  // dependent on termsAccepted and emailVerified being true.
  useEffect(() => {
    if (termsAccepted === true) {
      console.log(
        "Email is verified and terms accepted. Fetching emails and setting up refresh.",
      );
      getEmails(); // Fetch initial emails
      const intervalId = setInterval(() => {
        refreshInbox();
      }, 30000);
      return () => clearInterval(intervalId);
    } else if (termsAccepted === false) {
      console.log(
        "Email not verified or terms not accepted. Not fetching emails or setting up refresh.",
      );
    }
  }, [termsAccepted, getEmails, refreshInbox]);

  // Handler for accepting terms and conditions
  const handleTermsAccepted = () => {
    setTermsAccepted(true);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        color: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Top Navigation Bar */}
      <Box sx={{ height: "7%", width: "100%", backgroundColor: "#F2EEEC" }}>
        <NavBarTop
          setEmails={setEmails}
          setScreen={setScreen}
          setOverviewOpen={setOverviewOpen}
        />
      </Box>

      {/* Conditional Terms and Conditions Popup */}
      {termsAccepted === false && (
        <TermsConditionsPopup onAcceptTerms={handleTermsAccepted} />
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          height: "93%",
          width: "100%",
        }}
      >
        {/* Overview Screen */}
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

        {/* Profile Screen */}
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
