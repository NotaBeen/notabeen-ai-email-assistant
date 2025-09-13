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
} from "@mui/material";
import { useUser } from "@auth0/nextjs-auth0";
import { Merriweather_Sans } from "next/font/google";
import { motion } from "framer-motion";
import posthog from "posthog-js";
import { terms_conditions } from "@/lib/constants";

const merriweather = Merriweather_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

// Define a proper type for userData
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

interface TermsConditionsPopupProps {
  onAcceptTerms?: () => void;
}

// Create a custom theme with Merriweather Sans font - matching the light theme

const linkifyContent = (content: string) => {
  if (!content) return [];

  const urlRegex = /((https?:\/\/[^\s]+))/gi;
  const emailRegex = /([\w.-]+@[\w.-]+\.\w+)/gi;
  const parts = content.split(/(\s+)/); // split by spaces to preserve spacing

  return parts.map((part: string, index: number) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2563eb" }}
        >
          {part}
        </a>
      );
    } else if (emailRegex.test(part)) {
      return (
        <a key={index} href={`mailto:${part}`} style={{ color: "#2563eb" }}>
          {part}
        </a>
      );
    } else {
      return part;
    }
  });
};

const TermsConditionsPopup: React.FC<TermsConditionsPopupProps> = ({
  onAcceptTerms,
}) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch user data to check if terms have been accepted
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/user", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);

          // If terms haven't been accepted, show the popup
          if (!data.terms_acceptance) {
            setOpen(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Function to handle terms acceptance
  const handleAcceptTerms = async () => {
    if (!termsAccepted || !hasScrolledToBottom) return;

    setSubmitting(true);

    try {
      const accessToken = user?.auth0_access_token;
      // Save cookie preferences in localStorage
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
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          accepted: true,
          cookiePreferences,
        }),
      });

      if (response.ok) {
        posthog.capture("terms_accepted");
        setOpen(false);
        if (onAcceptTerms) {
          onAcceptTerms();
        }
      } else {
        console.error("Failed to update terms acceptance");
      }
    } catch (error) {
      console.error("Error updating terms acceptance:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle scroll in terms content
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Check if user has scrolled to the bottom (or close to it)
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      setHasScrolledToBottom(true);
    }
  };

  if (loading) return null;

  // If terms have already been accepted, don't show popup
  if (userData?.terms_acceptance === true) return null;

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
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
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: "#333333",
          fontSize: "1.5rem",
          background:
            "linear-gradient(135deg, rgba(66,133,244,0.08) 0%, rgba(255,255,255,0) 100%)",
          padding: "1.5rem 1.5rem 1rem",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          position: "relative",
        }}
      >
        Terms and Conditions
      </DialogTitle>

      <DialogContent
        sx={{
          padding: 0,
          position: "relative",
        }}
      >
        <Box
          sx={{
            maxHeight: "400px",
            overflowY: "auto",
            padding: "1.5rem",
            position: "relative",
            // Custom scrollbar
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#a1a1a1" },
          }}
          onScroll={handleScroll}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {terms_conditions.terms.map((data) => (
              <Box
                sx={{
                  bgcolor: "#f8fafc",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                }}
                key={data.id}
              >
                <Typography
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    mb: 2,
                    color: "#1A2138",
                  }}
                  gutterBottom
                >
                  {data.id}. {data.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: "#374151",
                    fontSize: "0.8rem",
                    whiteSpace: "pre-line",
                  }}
                >
                  {data.content}
                </Typography>
                {data.list_items && (
                  <List sx={{ px: { xs: 1, sm: 3 } }}>
                    {data?.list_items.map((item, index) => (
                      <ListItem sx={{ p: 0.01 }} key={index}>
                        <ListItemText
                          primary={
                            <>
                              <span style={{ fontSize: ".8rem" }}>♦︎</span>
                              <span style={{ lineHeight: 1.8 }}>
                                {linkifyContent(item)}
                              </span>
                            </>
                          }
                          primaryTypographyProps={{
                            variant: "body1",
                            color: "#374151",
                            fontSize: "1.05rem",
                            display: "inline-flex",
                            gap: 2.5,
                            alignItems: "flex-start",
                            overflow: "hidden",
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
            display: hasScrolledToBottom ? "none" : "block",
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          padding: "1rem 1.5rem 1.5rem",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          flexDirection: "column",
          alignItems: "stretch",
          background: "#ffffff",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={!hasScrolledToBottom}
              sx={{
                color: "#4285f4",
                "&.Mui-checked": {
                  color: "#4285f4",
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                color: hasScrolledToBottom ? "#333333" : "#999999",
                fontSize: "0.9rem",
              }}
            >
              I have read and agree to the Terms and Conditions
              {!hasScrolledToBottom && (
                <Typography
                  component="span"
                  sx={{
                    display: "block",
                    color: "#ff9800",
                    fontSize: "0.8rem",
                    mt: 0.5,
                  }}
                >
                  Please scroll to the bottom to enable this option
                </Typography>
              )}
            </Typography>
          }
          sx={{ mb: 2 }}
        />

        <Button
          onClick={handleAcceptTerms}
          disabled={!termsAccepted || !hasScrolledToBottom || submitting}
          variant="contained"
          sx={{
            backgroundColor: "#4285f4",
            color: "#ffffff",

            fontWeight: 600,
            padding: "0.8rem 2rem",
            borderRadius: "8px",
            textTransform: "none",
            boxShadow: "0 2px 8px rgba(66,133,244,0.3)",
            "&:hover": {
              backgroundColor: "#3367d6",
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
            <CircularProgress size={24} sx={{ color: "#ffffff" }} />
          ) : (
            "Accept Terms & Continue"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsConditionsPopup;
