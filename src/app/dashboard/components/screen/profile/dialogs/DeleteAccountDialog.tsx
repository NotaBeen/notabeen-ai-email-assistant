import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

/**
 * @typedef {Object} DeleteAccountDialogProps
 * @property {boolean} open - Controls whether the dialog is open or closed.
 * @property {() => void} onClose - Function to close the dialog (e.g., triggered by clicking Cancel or outside).
 * @property {() => void} onConfirm - Function to handle the account deletion logic.
 */
type DeleteAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/**
 * A confirmation dialog for permanently deleting a user account.
 * @param {DeleteAccountDialogProps} props - The props for the component.
 * @returns {JSX.Element} The DeleteAccountDialog component.
 */
export function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle id="delete-dialog-title">
        Confirm Account Deletion
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to **permanently delete** your account and all
          associated data? This action is irreversible.
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
          onClick={onConfirm}
          color="error"
          variant="contained"
          sx={{ borderRadius: "8px" }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
