import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
// 🚨 FIX 1: Replace Auth0's useUser with NextAuth's useSession
import { useSession } from "next-auth/react";

import EmailContentDisplay from "./components/EmailContentDisplay";
import { Email } from "@/types/interfaces";
import { formatDate, getUrgencyColor } from "@/utils/helpers"; // Import helpers

// Type definitions for clarity and consistency
export type ExtractedEntities = {
  senderName: string;
  date: string;
  snippet: string;
  recipientNames: string[];
  subjectTerms: string[];
  attachmentNames: string[];
};

export type AttachmentResponse = {
  filename: string;
  mimeType: string;
  downloadUrl: string;
};

export interface EmailDetailsProps {
  currentEmail: Email;
  setCurrentEmail: (email: Email | null) => void;
  setFullEmail: (
    data: { body: string; attachments: AttachmentResponse[] } | null,
  ) => void;
  fullEmail: { body: string; attachments: AttachmentResponse[] } | null;
}

function EmailDetails({
  currentEmail,
  setCurrentEmail,
  setFullEmail,
  fullEmail,
}: EmailDetailsProps) {
  const [fullEmailLoading, setFullEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 🚨 FIX 2: Use NextAuth's useSession hook
  const { data: session } = useSession();

  // 🚨 FIX 3: Get the Google Access Token from the custom session property
  const accessToken = session?.googleAccessToken;

  const getFullEmail = useCallback(
    async (emailId: string) => {
      // Check if the token is available
      if (!emailId) {
        setError("No email ID provided");
        return;
      }
      if (!accessToken) {
        setError("Authentication token missing. Please sign in again.");
        return;
      }

      setFullEmailLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/gmail/individual-email?emailId=${emailId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // 🚨 FIX 4: Use the NextAuth-derived accessToken
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          const { email, attachments } = data;
          setFullEmail({
            body: email || "Email content not available",
            attachments: attachments || [],
          });
        } else {
          const errorData = await response.json();
          setError(
            errorData.message || `Failed to fetch email (${response.status})`,
          );
        }
      } catch (error) {
        console.error("Failed to fetch full email:", error);
        setError("Network error occurred while fetching email");
      } finally {
        setFullEmailLoading(false);
      }
    },
    // 🚨 FIX 5: Dependency array now correctly includes accessToken
    [accessToken, setFullEmail],
  );

  useEffect(() => {
    // Only attempt to fetch if the current email is set AND we have a token
    if (currentEmail && accessToken) {
      setFullEmail({ body: "", attachments: [] });
      getFullEmail(currentEmail.emailId);
    }
  }, [currentEmail, accessToken, getFullEmail, setFullEmail]); // Added accessToken to dependencies

  const handleCloseViewer = () => {
    setCurrentEmail(null);
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "#FAFAFA",
        borderLeft: isMobile ? "none" : "3px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Email Subject and Meta Section */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            p: isMobile ? 2 : 3,
            pb: 1.5,
            backgroundColor: "#F9FAFB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flexGrow: 1, pr: 2 }}>
            <Typography
              sx={{
                fontSize: isMobile ? "20px" : "18px",
                fontWeight: 600,
                lineHeight: 1.4,
                color: "#1F2937",
                wordBreak: "break-word",
                mb: 2,
              }}
              title={currentEmail.subject}
            >
              {currentEmail.subject}
            </Typography>
            <Box sx={{ flexDirection: "column", color: "#4B5563" }}>
              <Typography
                sx={{ fontSize: isMobile ? "15px" : "14px", mb: 0.5 }}
              >
                From: {currentEmail.sender}
              </Typography>
              <Typography
                sx={{ fontSize: isMobile ? "15px" : "14px", mb: 0.5 }}
              >
                Time: {formatDate(currentEmail.dateReceived)}
              </Typography>
              <Typography
                sx={{
                  fontSize: isMobile ? "15px" : "14px",
                  color: getUrgencyColor(currentEmail.urgencyScore),
                  fontWeight: 500,
                }}
              >
                Urgency: {currentEmail.urgencyScore}/100
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseViewer}
            sx={{ display: isMobile ? "inherit" : "inherit" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {/* AI Summary Section */}
        <Box
          sx={{
            backgroundColor: "#F9FAFB",
            borderRadius: "8px",
            m: isMobile ? 2 : 3,
            my: isMobile ? 2 : 3,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              color: "#1F2937",
            }}
          >
            <SmartToyIcon
              sx={{
                fontSize: isMobile ? 20 : 18,
                color: getUrgencyColor(currentEmail.urgencyScore),
                mr: 1,
              }}
            />
            <Typography
              sx={{ fontSize: isMobile ? "16px" : "15px", fontWeight: 600 }}
            >
              AI Summary
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: isMobile ? "15px" : "14px",
              lineHeight: 1.6,
              color: "#4B5563",
            }}
          >
            {currentEmail.summary}
          </Typography>
        </Box>
      </Box>
      {/* Email Content Display */}
      <Box
        sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 3,
          pt: 0,
        }}
      >
        <EmailContentDisplay
          isMobile={isMobile}
          fullEmailLoading={fullEmailLoading}
          error={error}
          setError={setError}
          fullEmail={fullEmail}
          currentEmail={currentEmail}
        />
      </Box>
    </Box>
  );
}

export default EmailDetails;
