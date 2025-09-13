import React from "react";
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
import SecurityDialog from "./SecurityDialog";
import { Email } from "@/types/interfaces";
import { getUrgencyColor } from "@/utils/helpers"; // Import helper from the new file

// Type definitions remain in the same file
export type AttachmentResponse = {
  filename: string;
  mimeType: string;
  downloadUrl: string;
};

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

// Function to format plain text emails
const formatPlainTextEmailBody = (
  text: string,
  handleLinkClick: (url: string, e: React.MouseEvent) => void,
  linkColor: string,
) => {
  // Normalize and clean the text
  const cleanedText = text
    .replace(/ +(?=\n)/g, "")
    .replace(/^From:.*$\n?/m, "")
    .replace(/^Subject:.*$\n?/m, "")
    .replace(/^-{2,}.*$/gm, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  // Regex to find URLs, including those with or without http/https
  const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})/gi;

  const parts = cleanedText.split(urlRegex).filter(Boolean);

  return parts.map((part, index) => {
    if (urlRegex.test(part) && part.length > 5) {
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
      return part.split("\n").map((line, lineIndex) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          <br />
        </React.Fragment>
      ));
    }
  });
};

const EmailContentDisplay: React.FC<EmailContentDisplayProps> = ({
  isMobile,
  fullEmailLoading,
  error,
  setError,
  fullEmail,
  currentEmail,
}) => {
  const [securityDialogOpen, setSecurityDialogOpen] = React.useState(false);
  const [pendingUrl, setPendingUrl] = React.useState<string | null>(null);

  const handleLinkClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    setPendingUrl(url);
    setSecurityDialogOpen(true);
  };

  const handleConfirm = () => {
    if (pendingUrl) {
      window.open(pendingUrl, "_blank", "noopener,noreferrer");
    }
    setSecurityDialogOpen(false);
    setPendingUrl(null);
  };

  const handleCancel = () => {
    setSecurityDialogOpen(false);
    setPendingUrl(null);
  };

  const linkColor = getUrgencyColor(currentEmail.urgencyScore);

  const isHtmlEmail =
    fullEmail?.body?.trim().toLowerCase().startsWith("<!doctype html>") ||
    fullEmail?.body?.trim().toLowerCase().startsWith("<html");

  const renderHtmlContent = (htmlString: string) => {
    const srcDoc = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Email Content</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 15px; }
            img { max-width: 100%; height: auto; }
            a { color: ${linkColor}; }
          </style>
        </head>
        <body>
          ${htmlString}
        </body>
        </html>
      `;
    return (
      <iframe
        title="Email Content"
        srcDoc={srcDoc}
        sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
        style={{
          width: "100%",
          minHeight: "50vh",
          border: "none",
        }}
      />
    );
  };

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, flexShrink: 0 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
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
          {isHtmlEmail ? (
            renderHtmlContent(fullEmail.body)
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
                {formatPlainTextEmailBody(
                  fullEmail.body,
                  handleLinkClick,
                  linkColor,
                )}
              </Typography>
            </Box>
          )}
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
                          target="_blank"
                          rel="noopener noreferrer"
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
