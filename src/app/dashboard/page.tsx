// src/app/dashboard/page.tsx
"use client";
import { Box } from "@mui/material";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useState, useCallback } from "react"; // Removed unused 'useRef'
import Profile from "@/app/dashboard/components/screen/profile/Profile";
import NavBarTop from "@/app/dashboard/components/navigation/NavBarTop";
import TermsConditionsPopup from "@/components/popup/TermsConditionsPopup";
import posthog from "posthog-js";
import Overview from "./components/screen/overview/Overview";
import QuotaWarning from "@/components/QuotaWarning";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Email } from "@/types/interfaces";

type CurrentEmail = Email;

function Dashboard() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const status = isPending ? "loading" : session ? "authenticated" : "unauthenticated";

  const [screen, setScreen] = useState("overview");
  const [currentEmail, setCurrentEmail] = useState<CurrentEmail | null>(null);

  const [emails, setEmails] = useState<Email[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  console.log(isDataLoading);
  // Removed unused state: overviewOpen
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  const [activeFilter, setActiveFilter] = useState("urgent");
  const [initialRefreshDone, setInitialRefreshDone] = useState(false);
  const [quotaError, setQuotaError] = useState<{
    message: string;
    retryAfter?: number;
    quotaLimit?: string;
    helpUrl?: string;
  } | null>(null);

  const [loadingState, setLoadingState] = useState<{
    isOpen: boolean;
    message?: string;
    operationType?: 'refresh' | 'processing' | 'queue' | 'initial';
    progress?: number;
    showProgress?: boolean;
    queueStats?: {
      total: number;
      pending: number;
      processing: number;
      completed: number;
    };
  }>({
    isOpen: false,
    operationType: 'processing'
  });

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
    if (termsAccepted === false) return;
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
  }, [termsAccepted]);

  // Function to refresh the inbox by calling the Gmail API
  const refreshInbox = useCallback(
    async (isInitialLoad = false) => {
      if (termsAccepted === false) return;

      // Only set loading state for manual refreshes, not initial load
      if (!isInitialLoad) {
        setIsDataLoading(true);
        setLoadingState({
          isOpen: true,
          operationType: 'refresh',
          message: 'Refreshing your emails...'
        });
      }

      try {
        const response = await fetch("/api/gmail", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();

          // Don't call getEmails here - it's already being called separately
          // This prevents duplicate calls and allows parallel execution

          posthog.capture("gmail_connected");
          if (isInitialLoad) setInitialRefreshDone(true);
          // Clear any previous quota errors on success
          setQuotaError(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to process emails. Status:", response.status, errorData);

          if (response.status === 401) {
            // User's Google token is likely expired/revoked
            await signOut();
            window.location.href = "/";
          } else if (response.status === 429 && errorData.rateLimitInfo) {
            // Handle quota exceeded error
            setQuotaError({
              message: errorData.message || "Rate limits exceeded. Please try again later.",
              retryAfter: errorData.rateLimitInfo.retryAfter,
              quotaLimit: errorData.rateLimitInfo.quotaLimit,
              helpUrl: errorData.rateLimitInfo.helpUrl
            });
          } else {
            // Clear quota errors for other types of errors
            setQuotaError(null);
          }
        }
      } catch (error) {
        console.error("Failed to process emails:", error);
      } finally {
        if (!isInitialLoad) {
          setIsDataLoading(false);
          // Close loading overlay
          setLoadingState(prev => ({ ...prev, isOpen: false }));
        }
      }
    },
    [termsAccepted],
  );

  // Function to check queue status and update persistent indicator
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
    console.log("[DEBUG] termsAccepted state:", termsAccepted, "initialRefreshDone:", initialRefreshDone);
    if (termsAccepted === true) {
      console.log("Terms accepted. Loading existing emails first, then refreshing from Gmail."); // Force recompile

      // STEP 1: Immediately load any existing emails from the database
      console.log("[DEBUG] Calling getEmails() first for instant display");
      getEmails();

      // STEP 2: Then fetch new emails from Gmail in the background
      console.log("[DEBUG] Calling refreshInbox(true) in background");
      refreshInbox(true);

      // Set up the interval for continuous refresh - every 10 seconds for faster updates
      intervalId = setInterval(() => {
        refreshInbox();
      }, 10000);

      return () => clearInterval(intervalId);
    } else if (termsAccepted === false) {
      console.log(
        "Terms not accepted. Not fetching emails or setting up refresh.",
      );
    } else {
      console.log("[DEBUG] termsAccepted is null/undefined");
    }
    // Cleanup if termsAccepted changes to null (e.g., on signout)
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [termsAccepted, refreshInbox, getEmails]);

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
          quotaExceeded={!!quotaError}
        />
      </Box>

      {quotaError && (
        <Box sx={{ px: 2, pt: 1 }}>
          <QuotaWarning
            quotaError={quotaError}
            onDismiss={() => setQuotaError(null)}
          />
        </Box>
      )}

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

      {/* Loading Overlay */}
      <LoadingOverlay
        isOpen={loadingState.isOpen}
        message={loadingState.message}
        operationType={loadingState.operationType}
        progress={loadingState.progress}
        showProgress={loadingState.showProgress}
        queueStats={loadingState.queueStats}
        enableQueueMonitoring={termsAccepted === true}
      />
    </Box>
  );
}

export default Dashboard;
