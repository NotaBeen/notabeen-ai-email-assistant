import React, { useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AttachmentIcon from "@mui/icons-material/Attachment";
import EmailIcon from "@mui/icons-material/Email";
import MailIcon from "@mui/icons-material/Mail";

/**
 * @typedef {Object} AttachmentResponse
 * @property {string} filename The original filename of the attachment.
 * @property {string} mimeType The MIME type of the attachment.
 * @property {string} downloadUrl The secure, temporary URL for downloading the attachment.
 */
export type AttachmentResponse = {
  filename: string;
  mimeType: string;
  downloadUrl: string;
};

// Local component import (assuming standard location)
import SecurityDialog from "./SecurityDialog";
// Global type import (assuming standard path alias)
import { Email } from "@/types/interfaces";
// Helper import (assuming standard path alias)
import { getUrgencyColor } from "@/utils/helpers";

/**
 * Props for the EmailContentDisplay component.
 * @interface EmailContentDisplayProps
 * @property {boolean} isMobile Flag indicating if the current view is mobile.
 * @property {boolean} fullEmailLoading Flag for the loading state of the full email body.
 * @property {string | null} error Any error message to display.
 * @property {(error: string | null) => void} setError Setter for the error state.
 * @property {object | null} fullEmail The complete email object including the body and attachments.
 * @property {string} fullEmail.body The full raw body of the email (HTML or plain text).
 * @property {AttachmentResponse[]} [fullEmail.attachments] Optional array of email attachments.
 * @property {Email} currentEmail The summary email object, used for metadata like urgencyScore.
 */
interface EmailContentDisplayProps {
  isMobile: boolean;
  fullEmailLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  fullEmail: {
    body: string;
    attachments?: AttachmentResponse[];
  } | null;
  currentEmail: Email;
}

/**
 * Formats a plain text email body for display, converting line breaks to paragraphs
 * and identifying/making URLs clickable.
 *
 * NOTE: This function handles simple link detection for security purposes,
 * prompting a dialog before navigation.
 *
 * @param {string} text The raw plain text body of the email.
 * @param {(url: string, e: React.MouseEvent) => void} handleLinkClick Callback for link clicks to show security dialog.
 * @param {string} linkColor The color to use for the link text.
 * @returns {React.ReactNode[]} An array of React elements and strings for rendering.
 */
const formatPlainTextEmailBody = (
  text: string,
  handleLinkClick: (url: string, e: React.MouseEvent) => void,
  linkColor: string,
) => {
  // Defensive cleanup to remove headers, signature lines, and excessive whitespace.
  const cleanedText = text
    .replace(/ +(?=\n)/g, "")
    .replace(/^From:.*$\n?/m, "")
    .replace(/^Subject:.*$\n?/m, "")
    .replace(/^-{2,}.*$/gm, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  // Regex to find standard HTTP/HTTPS or 'www.' URLs.
  const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})/gi;

  // Split the text by the URL regex to separate text from links.
  const parts = cleanedText.split(urlRegex).filter(Boolean);

  // Map parts into an array of React elements (Links) and text fragments.
  return parts.map((part, index) => {
    if (urlRegex.test(part) && part.length > 5) {
      // Prepend 'http://' if the link doesn't start with a protocol for proper `href`.
      const href = part.startsWith("http") ? part : `http://${part}`;
      return (
        <Link
          key={index}
          href={href}
          onClick={(e) => handleLinkClick(href, e)}
          sx={{
            color: linkColor,
            textDecoration: "underline",
            wordBreak: "break-all",
            fontWeight: 500,
            "&:hover": {
              textDecoration: "none",
            },
          }}
        >
          {part}
        </Link>
      );
    } else {
      // Render text content directly within a Fragment.
      // The parent Box's `whiteSpace: 'pre-wrap'` handles line breaks.
      return <React.Fragment key={index}>{part}</React.Fragment>;
    }
  });
};

/**
 * Component to display the full content of a selected email.
 * It handles loading states, error messages, rendering of HTML via iframe (for security),
 * plain text formatting, and attachment display with link security checks.
 *
 * @param {EmailContentDisplayProps} props The component props.
 * @returns {React.FC} The EmailContentDisplay component.
 */
const EmailContentDisplay: React.FC<EmailContentDisplayProps> = ({
  isMobile,
  fullEmailLoading,
  error,
  setError,
  fullEmail,
  currentEmail,
}) => {
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  /**
   * Memoize the link color based on the email's urgency score.
   * This is used for both plaintext links and attachment icons.
   */
  const linkColor = useMemo(
    () => getUrgencyColor(currentEmail.urgencyScore),
    [currentEmail.urgencyScore],
  );

  /**
   * Handle function for a link click in the plain text body.
   * It prevents default navigation and opens the security confirmation dialog.
   */
  const handleLinkClick = useCallback((url: string, e: React.MouseEvent) => {
    e.preventDefault();
    setPendingUrl(url);
    setSecurityDialogOpen(true);
  }, []);

  /**
   * Confirms the navigation action from the security dialog.
   * Opens the link in a new tab with security attributes.
   */
  const handleConfirm = useCallback(() => {
    if (pendingUrl) {
      // Opens link in a new, secure window.
      window.open(pendingUrl, "_blank", "noopener,noreferrer");
    }
    setSecurityDialogOpen(false);
    setPendingUrl(null);
  }, [pendingUrl]);

  /**
   * Cancels the navigation action, closing the security dialog.
   */
  const handleCancel = useCallback(() => {
    setSecurityDialogOpen(false);
    setPendingUrl(null);
  }, []);

  // Get the email body and prepare for HTML detection.
  const emailBody = fullEmail?.body?.trim() || "";
  const lowerBody = emailBody.toLowerCase();

  /**
   * Robustly detect HTML content by checking for common top-level HTML tags
   * in the first part of the body.
   */
  const isHtmlEmail =
    lowerBody.includes("<html") ||
    lowerBody.includes("<!doctype html>") ||
    lowerBody.includes("</head>"); // Added common tag for robustness

  /**
   * Memoize the content to be rendered in the iframe for HTML emails.
   */
  const htmlContentToRender = useMemo(() => {
    if (!fullEmail || !isHtmlEmail) return null;

    // SECURITY NOTE: In a production environment, implement **HTML Sanitization**
    // using a trusted library like **DOMPurify** before rendering.
    // Example: const sanitizedHtml = DOMPurify.sanitize(fullEmail.body);
    // return sanitizedHtml;

    // Rendering raw HTML directly. The iframe's `sandbox` attribute is
    // currently the primary defense mechanism against malicious content.
    return fullEmail.body;
  }, [fullEmail, isHtmlEmail]);

  // --- JSX Rendering ---

  return (
    <Box>
      {/* Error Display */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, flexShrink: 0 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Loading Display */}
      {fullEmailLoading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
            color: "#6B7280",
          }}
        >
          <CircularProgress size={isMobile ? 32 : 24} sx={{ mb: 2 }} />
          <Typography sx={{ fontSize: isMobile ? "14px" : "13px" }}>
            Loading email content...
          </Typography>
        </Box>
      )}

      {/* Email Content Display: Only render if data is available and not loading */}
      {fullEmail && !fullEmailLoading && (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              mt: isMobile ? 0 : 2,
            }}
          >
            <MailIcon
              sx={{
                fontSize: isMobile ? 20 : 18,
                color: "#9CA3AF",
                mr: 1,
              }}
            />
            <Typography
              sx={{
                fontSize: isMobile ? "1rem" : "0.9375rem",
                fontWeight: 600,
                color: "#4B5563",
              }}
            >
              Original Email
            </Typography>
          </Box>

          {/* HTML or Plain Text Rendering */}
          {isHtmlEmail && htmlContentToRender ? (
            <iframe
              // Keying the iframe forces a re-render when the email changes, crucial for new `srcDoc` content.
              key={currentEmail._id}
              title="Email Content"
              // Use the raw or sanitized HTML string as the source document.
              srcDoc={htmlContentToRender}
              // Explicit, restrictive sandbox for security:
              // - allow-same-origin: Allows scripts to access content (needed for some complex emails).
              // - allow-popups: Allows links to open new windows.
              // - allow-forms: Allows form submissions.
              // - allow-scripts: Allows JavaScript execution (if necessary).
              // - allow-top-navigation-by-user: Allows user-initiated top-level navigation (e.g., clicking a link).
              sandbox="allow-same-origin allow-popups allow-forms allow-scripts allow-top-navigation-by-user"
              style={{
                width: "100%",
                minHeight: "50vh",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
          ) : (
            <Box
              sx={{
                p: 2,
                backgroundColor: "white",
                borderRadius: "8px",
                fontSize: isMobile ? "1rem" : "0.9375rem",
                color: "#374151",
                lineHeight: 1.8,
                wordBreak: "break-word",
                // Crucial for plain text line breaks and spacing.
                whiteSpace: "pre-wrap",
              }}
            >
              <Typography
                component="div"
                sx={{
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  lineHeight: "inherit",
                }}
              >
                {/* Format and render plain text body with clickable links */}
                {formatPlainTextEmailBody(
                  emailBody,
                  handleLinkClick,
                  linkColor,
                )}
              </Typography>
            </Box>
          )}

          {/* Attachments Section */}
          {fullEmail.attachments && fullEmail.attachments.length > 0 && (
            <Box sx={{ mt: 3, pb: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="h6"
                sx={{
                  fontSize: isMobile ? "1rem" : "0.9375rem",
                  mb: 2,
                  color: "#1F2937",
                }}
              >
                Attachments
              </Typography>
              <List sx={{ p: 0 }}>
                {fullEmail.attachments.map((attachment, index) => (
                  <ListItem
                    disableGutters
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRadius: "8px",
                      backgroundColor: "#F9FAFB",
                      mb: 1,
                      "&:hover": {
                        backgroundColor: "#E5E7EB",
                      },
                    }}
                  >
                    <AttachmentIcon
                      sx={{
                        minWidth: "32px",
                        color: linkColor,
                        fontSize: isMobile ? 18 : 16,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Link
                          href={attachment.downloadUrl}
                          download={attachment.filename}
                          // Secure link opening for external downloads.
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontSize: isMobile ? "15px" : "14px",
                            color: linkColor,
                            textDecoration: "none",
                            cursor: "pointer",
                            fontWeight: 500,
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {attachment.filename}
                        </Link>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}

      {/* No Email Selected Display */}
      {!fullEmail && !fullEmailLoading && !error && (
        <Box
          sx={{
            p: isMobile ? 3 : 4,
            backgroundColor: "#F9FAFB",
            borderRadius: "8px",
            textAlign: "center",
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EmailIcon
            sx={{ fontSize: isMobile ? 32 : 28, color: "#9CA3AF", mb: 1.5 }}
          />
          <Typography
            sx={{ fontSize: isMobile ? "14px" : "13px", color: "#6B7280" }}
          >
            Click the **Fetch Original Email** button to view the complete
            content.
          </Typography>
        </Box>
      )}

      {/* Security Dialog for Link Confirmation */}
      <SecurityDialog
        open={securityDialogOpen}
        url={pendingUrl}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export default EmailContentDisplay;