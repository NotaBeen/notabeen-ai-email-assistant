// src/components/ui/CookieBanner.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Box, Typography, Button, Paper, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CookieIcon from "@mui/icons-material/Cookie";
import CookiePreferencesPopup, {
  CookiePreferences,
} from "../popup/CookiePreferencesPopup";

/**
 * Defines the props for the CookieBanner component.
 */
interface CookieBannerProps {
  /** The current cookie consent preferences, or null if no consent has been given yet. */
  currentPreferences: CookiePreferences | null;
  /** Callback function to update the consent state in the parent provider. */
  onUpdateConsent: (newPreferences: CookiePreferences) => void;
}

/**
 * A persistent banner displayed at the bottom of the screen to manage cookie consent.
 * It provides options to accept all cookies or manage preferences via a popup.
 *
 * This component is designed to be displayed when `currentPreferences` is null
 * (first visit/no consent) or when non-essential cookies have been rejected.
 *
 * @param {CookieBannerProps} { onUpdateConsent, currentPreferences }
 * @returns {React.FC} The Cookie Banner component.
 */
const CookieBanner: React.FC<CookieBannerProps> = ({
  onUpdateConsent,
  currentPreferences,
}) => {
  const theme = useTheme();
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);

  // Determine if the banner should show a more specific 'rejected' message
  const isNonEssentialRejected = useMemo(() => {
    return (
      currentPreferences &&
      (!currentPreferences.analytics || !currentPreferences.marketing)
    );
  }, [currentPreferences]);

  /**
   * Generates the initial preferences to populate the management popup.
   * Defaults to essential: true and others: false if no consent exists yet.
   * @returns {CookiePreferences} The preference object.
   */
  const getInitialPreferencesForPopup = (): CookiePreferences => {
    if (currentPreferences) {
      return currentPreferences;
    }
    // Default state when opening preferences for the very first time
    return { essential: true, analytics: false, marketing: false };
  };

  /**
   * Handles the 'Accept All' action, setting all cookie categories to true.
   */
  const handleAcceptAll = () => {
    onUpdateConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  /**
   * Opens the cookie preferences modal.
   */
  const handleOpenPreferences = () => {
    setShowPreferencesPopup(true);
  };

  /**
   * Closes the cookie preferences modal.
   */
  const handleClosePreferences = () => {
    setShowPreferencesPopup(false);
  };

  /**
   * Callback from the Preferences Popup to update the consent state.
   * @param {CookiePreferences} preferences - The new preferences.
   */
  const handleSavePreferences = (preferences: CookiePreferences) => {
    onUpdateConsent(preferences);
    handleClosePreferences();
  };

  // The banner is wrapped in AnimatePresence but should only render if
  // it is needed (i.e., consent is not fully given). The parent `CSPostHogProvider`
  // component should conditionally render this banner based on the full consent status.

  return (
    <>
      <AnimatePresence>
        <Box
          // Animation container for the banner itself
          component={motion.div}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{
            type: "spring",
            damping: 18,
            stiffness: 100,
            restDelta: 0.001,
          }}
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: theme.zIndex.drawer + 1, // High z-index to stay on top
            p: { xs: 2, md: 3 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Banner Content Container */}
          <Paper
            elevation={8} // Higher elevation for prominence
            sx={{
              width: "100%",
              maxWidth: "900px", // Increased max width for better desktop appearance
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[8],
              borderTop: `4px solid ${theme.palette.primary.main}`, // Accent border
              overflow: "hidden",
              borderRadius: 3, // Rounded corners
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
                gap: { xs: 2, md: 4 },
              }}
            >
              {/* Text Content */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  flexGrow: 1, // Allow text to take available space
                }}
              >
                <CookieIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: 24, sm: 28 },
                    mt: 0.5,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    component="h2"
                    fontWeight={700}
                    color="text.primary"
                    gutterBottom
                    sx={{ lineHeight: 1.2 }}
                  >
                    We Value Your Privacy
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isNonEssentialRejected
                      ? "You've rejected non-essential cookies. Click 'Accept All' to enable analytics and marketing for a better experience, or 'Manage Preferences' to adjust your settings."
                      : "We use essential cookies to run our site. With your consent, we'll also use analytics and marketing cookies to enhance your experience. You can change your preferences at any time."}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  alignItems: "stretch",
                  minWidth: { md: "280px" }, // Fixed width for button group on desktop
                  flexShrink: 0,
                }}
              >
                {/* Primary Button: Accept All */}
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleAcceptAll}
                  sx={{ flexGrow: 1, textTransform: "none", fontWeight: 600 }}
                >
                  Accept All Cookies
                </Button>

                {/* Secondary Button: Manage Preferences */}
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleOpenPreferences}
                  sx={{
                    flexGrow: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  Manage Preferences
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </AnimatePresence>

      {/* Cookie Preferences Popup Modal */}
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
