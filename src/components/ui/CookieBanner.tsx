// src/components/ui/CookieBanner.tsx
"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Paper, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CookieIcon from "@mui/icons-material/Cookie";
import CookiePreferencesPopup from "../popup/CookiePreferencesPopup";

interface CookieBannerProps {
  currentPreferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  } | null;
  onUpdateConsent: (newPreferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => void;
}

const CookieBanner: React.FC<CookieBannerProps> = ({
  onUpdateConsent,
  currentPreferences,
}) => {
  const theme = useTheme();
  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);

  const isNonEssentialRejected =
    currentPreferences &&
    (!currentPreferences.analytics || !currentPreferences.marketing);

  const handleAcceptAll = () => {
    onUpdateConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectNonEssential = () => {
    onUpdateConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleOpenPreferences = () => {
    setShowPreferencesPopup(true);
  };

  const handleClosePreferences = () => {
    setShowPreferencesPopup(false);
  };

  const handleSavePreferences = (preferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => {
    onUpdateConsent(preferences);
    handleClosePreferences();
  };

  const getInitialPreferencesForPopup = () => {
    if (currentPreferences) {
      return currentPreferences;
    }
    return { essential: true, analytics: false, marketing: false };
  };

  return (
    <>
      <AnimatePresence>
        <Box
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
            zIndex: theme.zIndex.drawer + 1,
            p: { xs: 2, md: 3 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              width: "100%",
              maxWidth: "800px",
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[8],
              borderTop: `4px solid ${theme.palette.primary.main}`,
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  flexShrink: 1,
                }}
              >
                <CookieIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: 24, sm: 28 },
                    mt: 0.5,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    component="h2"
                    fontWeight="bold"
                    color="text.primary"
                    gutterBottom
                  >
                    Cookie Consent
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isNonEssentialRejected
                      ? "You have rejected non-essential cookies. Click 'Accept All' to enhance your experience or 'Manage Preferences' to adjust."
                      : "We use cookies to improve your experience. Choose which cookies to allow."}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                  alignItems: "stretch",
                  minWidth: { sm: "240px" },
                }}
              >
                {isNonEssentialRejected ? (
                  <Button
                    variant="contained"
                    onClick={handleAcceptAll}
                    sx={{ flexGrow: 1 }}
                  >
                    Accept All Cookies
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleAcceptAll}
                    sx={{ flexGrow: 1 }}
                  >
                    Accept All
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={handleOpenPreferences}
                  sx={{ flexGrow: 1 }}
                >
                  Manage Preferences
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
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
