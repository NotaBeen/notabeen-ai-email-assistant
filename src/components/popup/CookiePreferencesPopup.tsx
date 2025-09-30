// src/components/popup/CookiePreferencesPopup.tsx
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

/**
 * Defines the structure for the cookie preference state.
 */
export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

/**
 * Defines the props for the CookiePreferencesPopup component.
 */
interface CookiePreferencesPopupProps {
  /** Function to close the popup. */
  onClose: () => void;
  /** Function to update the consent state in the parent provider. */
  onSavePreferences: (preferences: CookiePreferences) => void;
  /** Initial preferences passed from the parent provider (CSPostHogProvider). */
  initialPreferences: CookiePreferences;
}

/**
 * A modal popup component allowing users to manage their cookie consent for
 * different categories (Essential, Analytics, Marketing).
 * It uses Material UI for styling and Framer Motion for animations.
 *
 * @param {CookiePreferencesPopupProps} props - Component props.
 * @returns {React.FC} The Cookie Preferences Popup component.
 */
const CookiePreferencesPopup: React.FC<CookiePreferencesPopupProps> = ({
  onClose,
  onSavePreferences,
  initialPreferences,
}) => {
  // Local state to manage the user's selections within the UI.
  const [preferences, setPreferences] = useState(initialPreferences);

  /**
   * Handles toggling the state for a non-essential cookie category.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The switch change event.
   */
  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked,
    });
  };

  /**
   * Handles saving the current preferences.
   * Updates localStorage and calls the parent handler to manage analytics services (PostHog/gtag).
   */
  const handleSave = () => {
    // 1. Save preferences to localStorage for persistence across sessions.
    // The parent provider should check this on mount.
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    // Set a general consent flag to indicate the user has made a choice.
    localStorage.setItem("posthogConsent", "true");

    // 2. Notify the parent provider component (e.g., CSPostHogProvider)
    // of the new preferences. The parent is responsible for integrating
    // with external services like PostHog and gtag.
    onSavePreferences(preferences);

    // 3. Close the modal.
    onClose();
  };

  return (
    <Box
      // Backdrop: provides modal effect and closes on outside click
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
        backdropFilter: "blur(2px)", // Subtle blur for background
      }}
      onClick={onClose} // Closes modal if user clicks backdrop
    >
      {/* Modal Content Paper */}
      <Paper
        component={motion.div}
        // Entry/Exit animations
        initial={{ y: -50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -50, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        sx={{
          width: "90%",
          maxWidth: "600px",
          padding: { xs: 3, md: 4 }, // Increased padding for better look
          borderRadius: 3, // Rounded corners
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)", // Stronger shadow
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the paper
      >
        {/* Close Button */}
        <IconButton
          aria-label="close cookie preferences"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: (theme) => theme.palette.grey[500],
            "&:hover": { color: "text.primary" },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header */}
        <Typography
          variant="h5"
          sx={{ mb: 1, fontWeight: 700, color: "text.primary" }}
        >
          Manage Cookie Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We use cookies to ensure you get the best experience on our website.
          You have full control to adjust your preferences below at any time.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Cookie Options Group */}
        <FormGroup>
          {/* 1. Essential Cookies */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.essential}
                  name="essential"
                  disabled // Essential cookies are always required and cannot be toggled
                  color="default" // Use default color for disabled switch
                />
              }
              label={
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="text.primary"
                  >
                    Essential Cookies 🛠️
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, lineHeight: 1.4 }}
                  >
                    These cookies are **necessary for the core functionality**
                    of the website (e.g., security, authentication, load
                    balancing) and cannot be switched off.
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: "100%", alignItems: "flex-start" }} // Align text to start
              componentsProps={{ typography: { component: "div" } }} // Ensure typography can render blocks
            />
          </Box>

          <Divider light sx={{ my: 1 }} />

          {/* 2. Analytics Cookies */}
          <Box sx={{ my: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.analytics}
                  onChange={handleToggleChange}
                  name="analytics"
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="text.primary"
                  >
                    Analytics & Performance Cookies 📊
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, lineHeight: 1.4 }}
                  >
                    These cookies help us gather **anonymous statistics** on how
                    our website is used (e.g., page visits, session duration) to
                    measure and improve performance.
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
              componentsProps={{ typography: { component: "div" } }}
            />
          </Box>

          <Divider light sx={{ my: 1 }} />

          {/* 3. Marketing Cookies */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.marketing}
                  onChange={handleToggleChange}
                  name="marketing"
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="text.primary"
                  >
                    Marketing & Advertising Cookies 🎯
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, lineHeight: 1.4 }}
                  >
                    These cookies are used to **track user activity** across
                    websites to build a profile of your interests and show you
                    relevant advertisements.
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
              componentsProps={{ typography: { component: "div" } }}
            />
          </Box>
        </FormGroup>

        {/* Footer Buttons */}
        <Box
          sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ textTransform: "none" }}
          >
            Save Preferences
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CookiePreferencesPopup;
