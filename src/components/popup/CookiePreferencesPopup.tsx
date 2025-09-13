// components/CookiePreferencesPopup.tsx
"use client"; // This component will run on the client side

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";

interface CookiePreferencesPopupProps {
  onClose: () => void;
  onSavePreferences: (preferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  }) => void;
  // Pass initial preferences to reflect current state
  initialPreferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

const CookiePreferencesPopup: React.FC<CookiePreferencesPopupProps> = ({
  onClose,
  onSavePreferences,
  initialPreferences, // Initial preferences are now explicitly required
}) => {
  // Use initialPreferences from props to set the initial state
  const [preferences, setPreferences] = useState(initialPreferences);

  // The useEffect that previously managed PostHog directly within this component
  // is now largely redundant because `onSavePreferences` in the parent `CSPostHogProvider`
  // is responsible for updating PostHog and gtag.
  // We keep it lean here, focusing on UI state and passing values up.

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSave = () => {
    // Save preferences to localStorage for persistence
    // This is done here, but also consider if the parent `onSavePreferences`
    // should be the single source of truth for localStorage updates to avoid race conditions.
    // For now, keeping it here as it was, but the `onSavePreferences` in parent
    // will be the ultimate controller.
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    localStorage.setItem("posthogConsent", "true"); // Ensure consent is marked as given after managing preferences

    // Update the parent component's consent state.
    // The parent (CSPostHogProvider) will then handle
    // PostHog's opt-in/opt-out and gtag consent updates.
    onSavePreferences(preferences);

    // No need to directly manipulate posthog or gtag here
    // as the parent's `onUpdateConsent` (which maps to `handleUpdateCookieConsent` in provider)
    // is designed to do exactly that after receiving the new preferences.

    onClose(); // Close the popup
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <Paper
        component={motion.div}
        initial={{ y: -50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -50, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        sx={{
          width: "90%",
          maxWidth: "600px",
          padding: { xs: 2, md: 3 },
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Manage Cookie Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We use cookies to ensure you get the best experience on our website.
          You can adjust your preferences below.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <FormGroup>
          {/* Essential Cookies */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.essential}
                  onChange={handleToggleChange}
                  name="essential"
                  disabled // Essential cookies are always on
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Essential Cookies
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    These cookies are necessary for the website to function
                    properly and cannot be switched off.
                  </Typography>
                </Box>
              }
            />
          </Box>
          {/* Analytics Cookies */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.analytics}
                  onChange={handleToggleChange}
                  name="analytics"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Analytics Cookies
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    These cookies help us understand how visitors interact with
                    our website, so we can improve it.
                  </Typography>
                </Box>
              }
            />
          </Box>
          {/* Marketing Cookies */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.marketing}
                  onChange={handleToggleChange}
                  name="marketing"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Marketing Cookies
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    These cookies are used to deliver more relevant
                    advertisements to you.
                  </Typography>
                </Box>
              }
            />
          </Box>
        </FormGroup>

        <Box
          sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save Preferences
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CookiePreferencesPopup;
