import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Link,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";

// --- Type Definitions ---

interface SecurityDialogProps {
  open: boolean;
  url: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

// --- Component ---

/**
 * A dialog to warn the user before they click an external link within an email.
 * This is a crucial security measure to prevent accidental phishing attempts.
 */
const SecurityDialog: React.FC<SecurityDialogProps> = ({
  open,
  url,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.warning.light, // Use warning color for the title background
          color: theme.palette.warning.contrastText, // Ensure text is visible
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontWeight: 700,
        }}
      >
        <SecurityIcon sx={{ color: theme.palette.warning.dark }} />
        Security Warning
      </DialogTitle>
      <DialogContent sx={{ pt: theme.spacing(3) }}>
        <DialogContentText sx={{ mb: 2 }}>
          You are about to leave this application and be redirected to an{" "}
          external website.
          <Box component="span" sx={{ fontWeight: "bold" }}>
            {" "}
            Be extremely cautious
          </Box>{" "}
          before proceeding, especially if you did not expect a link or if the
          sender is unknown or suspicious.
        </DialogContentText>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: theme.palette.grey[100],
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.grey[300]}`,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
            Destination URL:
          </Typography>
          <Link
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              wordBreak: "break-all",
              color: theme.palette.text.primary,
              textDecoration: "underline",
              // Prevent navigating from the dialog itself on link click
              cursor: "text",
            }}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            {url || "N/A"}
          </Link>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onCancel} color="inherit" variant="outlined">
          Stay Here
        </Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Proceed Anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SecurityDialog;
