"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CookieIcon from "@mui/icons-material/Cookie";
import CookiePreferencesPopup from "../popup/CookiePreferencesPopup";

interface CookieBannerProps {
  onUpdateConsent: (
    essential: boolean,
    analytics: boolean,
    marketing: boolean,
  ) => void;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ onUpdateConsent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);
  // State to track if non-essential cookies are currently NOT accepted
  const [nonEssentialRejected, setNonEssentialRejected] = useState(false);

  // Helper function to get current preferences from localStorage
  const getStoredPreferences = () => {
    try {
      const stored = localStorage.getItem("cookiePreferences");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse cookie preferences from localStorage:", e);
      return null;
    }
  };

  useEffect(() => {
    const storedPreferences = getStoredPreferences();

    // Scenario 1: No preferences saved at all.
    // Show the initial full banner after a slight delay.
    if (!storedPreferences) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setNonEssentialRejected(false); // Default to not rejected state
      }, 500);
      return () => clearTimeout(timer);
    }
    // Scenario 2: Preferences are saved.
    else {
      // Determine if non-essential cookies are rejected
      const analyticsRejected = storedPreferences.analytics === false;
      const marketingRejected = storedPreferences.marketing === false;

      // The key change here: if non-essential cookies are rejected, we hide the banner
      if (analyticsRejected || marketingRejected) {
        setIsVisible(false); // Hide the banner if non-essential cookies are rejected
        setNonEssentialRejected(true); // Highlight the rejected state
      } else {
        // All non-essential cookies are accepted. Hide the banner.
        setIsVisible(false);
        setNonEssentialRejected(false);
      }
    }
  }, []); // Empty dependency array, runs only once on mount.

  const handleAcceptAll = () => {
    const newPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem("cookiePreferences", JSON.stringify(newPreferences));
    localStorage.setItem("posthogConsent", "true"); // Mark consent given
    onUpdateConsent(true, true, true);
    setNonEssentialRejected(false); // Reset to not rejected state
    setIsVisible(false); // Hide the banner on full acceptance
  };

  const handleRejectNonEssential = () => {
    const rejectedPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify(rejectedPreferences),
    );
    localStorage.setItem("posthogConsent", "true"); // Still consider consent given for essential, but not for analytics/marketing
    onUpdateConsent(true, false, false);
    setNonEssentialRejected(true); // Explicitly mark as rejected
    setIsVisible(false); // This is the fix: hide the banner when the user rejects non-essential cookies.
  };

  const handleOpenPreferences = () => {
    setShowPreferencesPopup(true);
  };

  const handleClosePreferences = () => {
    setShowPreferencesPopup(false);
    // After closing preferences, re-evaluate banner visibility and rejected state
    const storedPreferences = getStoredPreferences();
    if (
      storedPreferences &&
      (!storedPreferences.analytics || !storedPreferences.marketing)
    ) {
      setNonEssentialRejected(true); // Highlight if any non-essential are off
      setIsVisible(false); // This is the fix: hide the banner if non-essential are rejected
    } else {
      setNonEssentialRejected(false); // Reset highlight
      setIsVisible(false); // Hide banner if all accepted
    }
  };

  const handleSavePreferences = (preferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    localStorage.setItem("posthogConsent", "true"); // Mark consent given
    onUpdateConsent(
      preferences.essential,
      preferences.analytics,
      preferences.marketing,
    );

    // After saving, check if non-essential were declined and keep banner visible/hidden accordingly
    if (!preferences.analytics || !preferences.marketing) {
      setNonEssentialRejected(true);
      setIsVisible(false); // This is the fix: hide banner if rejected
    } else {
      setNonEssentialRejected(false);
      setIsVisible(false); // Hide banner if accepted
    }
    handleClosePreferences(); // This also handles hiding the popup
  };

  // This function is crucial for passing initial state to the preferences popup
  const getInitialPreferencesForPopup = () => {
    const storedPreferences = getStoredPreferences();
    if (storedPreferences) {
      return storedPreferences;
    }
    // Default to all non-essential OFF if no preferences are saved yet
    // This ensures the popup accurately reflects the initial state if opened without prior full consent
    return { essential: true, analytics: false, marketing: false };
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <Box
            component={motion.div}
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.5,
              ease: [0.175, 0.885, 0.32, 1.275],
              opacity: { duration: 0.4 },
              scale: { duration: 0.5 },
            }}
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              padding: { xs: 2, md: 3 },
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Paper
              elevation={2}
              sx={{
                width: "100%",
                maxWidth: "800px",
                backgroundColor: "#ffffff",
                boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
                border: "1px solid rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              {/* Top blue accent line */}
              <Box
                sx={{
                  height: "4px",
                  width: "100%",
                  backgroundColor: "#4285f4",
                }}
              />

              <Box
                sx={{
                  padding: { xs: "16px 20px", sm: "20px 24px" },
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "flex-start" },
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    flexShrink: 1,
                    mb: { xs: 2, sm: 0 },
                  }}
                >
                  <CookieIcon
                    sx={{
                      color: "#4285f4",
                      fontSize: { xs: 24, sm: 28 },
                      mt: "2px",
                    }}
                  />

                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        fontWeight: 600,
                        color: "#333333",
                        mb: 0.5,
                      }}
                    >
                      Cookie Consent
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666666",
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                        maxWidth: { sm: "90%", md: "85%" },
                      }}
                    >
                      {nonEssentialRejected
                        ? "You have rejected non-essential cookies. Click 'Accept All' to enhance your experience or 'Manage Preferences' to adjust."
                        : "We use cookies to improve your experience. Choose which cookies to allow."}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    minWidth: { sm: "200px" },
                    alignItems: "stretch",
                  }}
                >
                  {/* Conditionally render Accept All button */}
                  {nonEssentialRejected ? (
                    <Button
                      component={motion.button}
                      whileTap={{ scale: 0.97 }}
                      variant="contained"
                      onClick={handleAcceptAll}
                      sx={{
                        backgroundColor: "#4285f4",
                        color: "white",
                        padding: "10px 24px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        minWidth: "100%",
                        boxShadow: "0 2px 8px rgba(66, 133, 244, 0.3)",

                        whiteSpace: "nowrap",
                      }}
                    >
                      Accept All Cookies
                    </Button>
                  ) : (
                    // Initial "Accept All" button if no preferences set yet
                    <Button
                      component={motion.button}
                      whileTap={{ scale: 0.97 }}
                      variant="contained"
                      onClick={handleAcceptAll}
                      sx={{
                        backgroundColor: "#4285f4",
                        color: "white",
                        padding: "10px 24px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        minWidth: "100%",
                        boxShadow: "0 2px 8px rgba(66, 133, 244, 0.3)",

                        whiteSpace: "nowrap",
                      }}
                    >
                      Accept All
                    </Button>
                  )}

                  {/* "Reject Non-Essential" button only if not already rejected, or if it's the initial banner */}
                  {!nonEssentialRejected && (
                    <Button
                      component={motion.button}
                      whileTap={{ scale: 0.97 }}
                      variant="outlined"
                      onClick={handleRejectNonEssential}
                      sx={{
                        padding: "10px 24px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        minWidth: "100%",

                        whiteSpace: "nowrap",
                      }}
                    >
                      Reject Non-Essential
                    </Button>
                  )}

                  <Button
                    component={motion.button}
                    whileTap={{ scale: 0.97 }}
                    variant="text"
                    onClick={handleOpenPreferences}
                    sx={{
                      color: "#4285f4",
                      padding: "10px 24px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      minWidth: "100%",

                      whiteSpace: "nowrap",
                    }}
                  >
                    Manage Preferences
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreferencesPopup && (
          <CookiePreferencesPopup
            onClose={handleClosePreferences}
            onSavePreferences={handleSavePreferences}
            initialPreferences={getInitialPreferencesForPopup()}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieBanner;
