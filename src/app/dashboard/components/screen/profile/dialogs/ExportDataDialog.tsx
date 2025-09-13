// components/profile/dialogs/ExportDataDialog.tsx
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (format: "json" | "csv") => void;
};

export function ExportDataDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="export-dialog-title"
      aria-describedby="export-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle id="export-dialog-title">{"Export My Data"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="export-dialog-description">
          Choose the format you would like to export your personal data in.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: "8px" }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm("json")}
          variant="contained"
          sx={{ borderRadius: "8px", mr: 1 }}
        >
          Export as JSON
        </Button>
        <Button
          onClick={() => onConfirm("csv")}
          variant="contained"
          sx={{ borderRadius: "8px" }}
        >
          Export as CSV
        </Button>
      </DialogActions>
    </Dialog>
  );
}
