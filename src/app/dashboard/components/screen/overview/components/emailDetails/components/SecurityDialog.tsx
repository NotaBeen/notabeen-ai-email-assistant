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
} from "@mui/material";

interface SecurityDialogProps {
  open: boolean;
  url: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const SecurityDialog: React.FC<SecurityDialogProps> = ({
  open,
  url,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: "#fff", color: "#000" }}>
        Security Warning
      </DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        <DialogContentText sx={{ mb: 2 }}>
          You are about to be redirected to an external website. Be cautious
          about visiting links from unknown senders.
        </DialogContentText>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Destination:
        </Typography>
        <Link
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ wordBreak: "break-all" }}
          onClick={(e) => {
            // Prevent navigating from the dialog itself
            e.preventDefault();
          }}
        >
          {url}
        </Link>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "flex-end" }}>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SecurityDialog;
