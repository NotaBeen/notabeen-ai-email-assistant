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
 * @typedef {Object} ExportDataDialogProps
 * @property {boolean} open - Controls whether the dialog is open or closed.
 * @property {() => void} onClose - Function to close the dialog.
 * @property {(format: "json" | "csv") => void} onConfirm - Function to trigger the data export with the specified format.
 */
type ExportDataDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (format: "json" | "csv") => void;
};

/**
 * A dialog component that allows the user to select the desired format (JSON or CSV)
 * for exporting their personal data.
 * @param {ExportDataDialogProps} props - The props for the component.
 * @returns {JSX.Element} The ExportDataDialog component.
 */
export function ExportDataDialog({
  open,
  onClose,
  onConfirm,
}: ExportDataDialogProps) {
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
      <DialogTitle id="export-dialog-title">Export My Data</DialogTitle>
      <DialogContent>
        <DialogContentText id="export-dialog-description">
          Choose the format you would like to export your personal data in. JSON
          is ideal for programmatic use, while CSV is better for spreadsheets.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
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
          color="primary"
          sx={{ borderRadius: "8px" }}
        >
          Export as **JSON**
        </Button>
        <Button
          onClick={() => onConfirm("csv")}
          variant="contained"
          color="primary"
          sx={{ borderRadius: "8px" }}
        >
          Export as **CSV**
        </Button>
      </DialogActions>
    </Dialog>
  );
}
