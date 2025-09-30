// src/components/popup/TermsConditionsPopup.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink, // Use MuiLink for consistency in styling
} from "@mui/material";
import { useSession } from "next-auth/react";
import { Merriweather_Sans } from "next/font/google";
import { motion } from "framer-motion";
import posthog from "posthog-js";
// Assuming "@/lib/constants" exports an object like:
// { terms: [{ id: number, title: string, content: string, list_items?: string[] }] }
import { terms_conditions } from "@/lib/constants";

// Initialize the desired font
const merriweather = Merriweather_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

/**
 * Type definition for the user data fetched from the backend.
 */
type UserData = {
  email?: string;
  subscription?: {
    tier: string;
    request_limit: number;
    end_date: string;
  };
  total_emails_analyzed?: number;
  cookie_acceptance?: boolean;
  cookie_acceptance_date?: string | null;
  terms_acceptance?: boolean;
  terms_acceptance_date?: string | null;
  created_at?: string;
  last_login?: string;
  status?: string;
  roles?: string[];
};

/**
 * Props for the TermsConditionsPopup component.
 */
interface TermsConditionsPopupProps {
  /** Optional callback function executed after terms are successfully accepted. */
  onAcceptTerms?: () => void;
}

/**
 * Helper function to convert URLs and emails in a string to clickable links.
 * @param {string} content The raw string content.
 * @returns {Array<string | JSX.Element>} An array of strings and MuiLink components.
 */
const linkifyContent = (content: string) => {
  if (!content) return [];

  // Regex to match URLs (http/https) and email addresses
  const urlRegex = /((https?:\/\/[^\s]+))/gi;
  const emailRegex = /([\w.-]+@[\w.-]+\.\w+)/gi;

  // Split content by spaces, but keep the delimiters (spaces)
  const parts = content.split(/(\s+)/);

  return parts.map((part: string, index: number) => {
    if (urlRegex.test(part)) {
      // Handle URLs
      return (
        <MuiLink
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "primary.main", textDecoration: "underline" }}
        >
          {part}
        </MuiLink>
      );
    } else if (emailRegex.test(part)) {
      // Handle Email Addresses
      return (
        <MuiLink
          key={index}
          href={`mailto:${part}`}
          sx={{ color: "primary.main", textDecoration: "underline" }}
        >
          {part}
        </MuiLink>
      );
    } else {
      // Handle plain text and spaces
      return part;
    }
  });
};

/**
 * Renders a mandatory popup for users to accept the Terms and Conditions.
 * The popup is modal, checks user's current acceptance status from the backend,
 * and enforces a scroll-to-read requirement before enabling the acceptance checkbox.
 *
 * @param {TermsConditionsPopupProps} { onAcceptTerms }
 * @returns {React.FC} The Terms and Conditions Popup component.
 */
const TermsConditionsPopup: React.FC<TermsConditionsPopupProps> = ({
  onAcceptTerms,
}) => {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  // State to hold user data fetched from the API
  const [userData, setUserData] = useState<UserData | null>(null);

  /**
   * Fetches the user's data to determine if terms have already been accepted.
   * Runs only when the session status changes to 'authenticated'.
   */
  useEffect(() => {
    const fetchUserData = async () => {
      // Only proceed if authenticated and user object exists
      if (status !== "authenticated" || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user", { method: "GET" });
        if (response.ok) {
          const data: UserData = await response.json();
          setUserData(data);

          // If terms have not been accepted, show the popup
          if (!data.terms_acceptance) {
            setOpen(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data for terms check:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchUserData();
    }
  }, [user, status]); // Dependencies: user data and NextAuth status

  /**
   * Handles the API call to record the user's acceptance of the terms.
   */
  const handleAcceptTerms = async () => {
    // Prevent action if checkbox is not checked or terms not fully read
    if (!termsAccepted || !hasScrolledToBottom) return;

    setSubmitting(true);

    try {
      // OPTIONAL: Set a default comprehensive cookie preference in localStorage
      // as part of the initial onboarding/acceptance process.
      const cookiePreferences = {
        essential: true,
        analytics: true,
        marketing: true,
      };
      localStorage.setItem(
        "cookiePreferences",
        JSON.stringify(cookiePreferences),
      );

      const response = await fetch("/api/user/terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // The backend should use the session/JWT for user identification,
        // so an empty body is often sufficient for a state update.
        body: JSON.stringify({}),
      });

      if (response.ok) {
        // Track the acceptance event
        if (typeof posthog !== "undefined") {
          posthog.capture("terms_accepted");
        }
        setOpen(false);
        if (onAcceptTerms) {
          onAcceptTerms();
        }
      } else {
        console.error(
          "Failed to update terms acceptance. Status:",
          response.status,
        );
        // Optionally show a user error message here
      }
    } catch (error) {
      console.error("Error updating terms acceptance:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Checks if the user has scrolled near the bottom of the content area.
   * @param {React.UIEvent<HTMLDivElement>} e The scroll event.
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Check if within 20px of the bottom
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // 1. Initial Loading State Check
  if (status === "loading" || loading) return null;

  // 2. Already Accepted Check
  if (userData?.terms_acceptance === true) return null;

  // 3. Render the Modal
  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown // Prevent closing with the ESC key (mandatory acceptance)
      PaperProps={{
        sx: {
          backgroundColor: "#ffffff",
          color: "#333333",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          borderRadius: "12px",
          border: "1px solid rgba(0,0,0,0.08)",
          maxWidth: "800px",
          width: "100%",
          mx: 2,
          overflow: "hidden",
        },
        component: motion.div,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }}
      className={merriweather.className}
      aria-labelledby="terms-conditions-dialog-title"
      aria-describedby="terms-conditions-dialog-description"
    >
      {/* Dialog Title */}
      <DialogTitle
        id="terms-conditions-dialog-title"
        sx={{
          fontWeight: 700,
          color: "#1A2138",
          fontSize: "1.6rem",
          background:
            "linear-gradient(135deg, rgba(66,133,244,0.08) 0%, rgba(255,255,255,0) 100%)",
          padding: "1.5rem 1.5rem 1rem",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        Important: Please Accept Our Terms and Conditions
      </DialogTitle>

      {/* Dialog Content (Scrollable Terms) */}
      <DialogContent
        id="terms-conditions-dialog-description"
        sx={{
          padding: 0,
          position: "relative",
        }}
      >
        {/* Scrollable Box for Terms Content */}
        <Box
          sx={{
            maxHeight: "400px",
            overflowY: "auto",
            padding: "1.5rem",
            position: "relative",
            // Custom scrollbar styling (Webkit browsers)
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#a1a1a1" },
          }}
          onScroll={handleScroll}
        >
          {/* Terms Container (Faux Paper for Visual Separation) */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: "#fcfdfe", // Slightly lighter background
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 4, // Reduced gap for better flow
            }}
          >
            {terms_conditions.terms.map((data) => (
              <Box
                key={data.id}
                sx={{
                  bgcolor: "#ffffff",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* Section Title */}
                <Typography
                  variant="h6" // Use a semantic variant
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    mb: 2,
                    color: "#1A2138",
                  }}
                  gutterBottom
                >
                  {data.id}. {data.title}
                </Typography>

                {/* Section Content */}
                <Typography
                  variant="body2" // Use body2 for main content text size
                  sx={{
                    lineHeight: 1.8,
                    color: "#374151",
                    fontSize: "0.9rem", // Increased font size for readability
                    whiteSpace: "pre-line",
                  }}
                  component="p" // Ensure it renders as a paragraph
                >
                  {linkifyContent(data.content)}
                </Typography>

                {/* List Items (if present) */}
                {data.list_items && (
                  <List sx={{ px: { xs: 0, sm: 1 }, mt: 1 }}>
                    {data.list_items.map((item, index) => (
                      <ListItem sx={{ py: 0.5, px: 0 }} key={index}>
                        <ListItemText
                          primary={
                            <>
                              {/* Custom Bullet Point */}
                              <Box
                                component="span"
                                sx={{
                                  mr: 1,
                                  color: "#4285f4",
                                  fontSize: "1.2rem",
                                  lineHeight: 1,
                                }}
                              >
                                •
                              </Box>
                              {/* List Item Content */}
                              <Box component="span" sx={{ lineHeight: 1.6 }}>
                                {linkifyContent(item)}
                              </Box>
                            </>
                          }
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "#374151",
                            fontSize: "0.9rem",
                            display: "inline-flex",
                            alignItems: "flex-start",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            ))}
          </Paper>
        </Box>

        {/* Fade effect at bottom to indicate scrollable content */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50px",
            background:
              "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
            display: hasScrolledToBottom ? "none" : "block", // Hide when fully scrolled
          }}
        />
      </DialogContent>

      {/* Dialog Actions (Checkbox and Button) */}
      <DialogActions
        sx={{
          padding: "1.5rem", // Increased padding
          borderTop: "1px solid rgba(0,0,0,0.05)",
          flexDirection: "column",
          alignItems: "stretch",
          background: "#ffffff",
        }}
      >
        {/* Acceptance Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={!hasScrolledToBottom || submitting}
              sx={{ color: "primary.main" }}
            />
          }
          label={
            <Typography
              sx={{
                color: hasScrolledToBottom ? "#333333" : "#999999",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              I have read and agree to the Terms and Conditions
              {/* Scroll Reminder */}
              {!hasScrolledToBottom && (
                <Typography
                  component="span"
                  sx={{
                    display: "block",
                    color: "warning.main", // Use theme color for warning
                    fontSize: "0.8rem",
                    mt: 0.5,
                  }}
                >
                  Please scroll to the bottom of the document to enable this
                  option ⬇️
                </Typography>
              )}
            </Typography>
          }
          sx={{ mb: 2, ml: 0 }}
        />

        {/* Accept Button */}
        <Button
          onClick={handleAcceptTerms}
          disabled={!termsAccepted || !hasScrolledToBottom || submitting}
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 700,
            padding: "0.8rem 2rem",
            borderRadius: "8px",
            textTransform: "none",
            boxShadow: "0 2px 8px rgba(66,133,244,0.3)",
            "&:hover": {
              backgroundColor: "primary.dark",
              boxShadow: "0 4px 12px rgba(66,133,244,0.4)",
            },
            "&:disabled": {
              background: "#dddddd",
              color: "#999999",
              boxShadow: "none",
            },
          }}
        >
          {submitting ? (
            <CircularProgress
              size={24}
              sx={{ color: "primary.contrastText" }}
            />
          ) : (
            "Accept Terms & Continue"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsConditionsPopup;
