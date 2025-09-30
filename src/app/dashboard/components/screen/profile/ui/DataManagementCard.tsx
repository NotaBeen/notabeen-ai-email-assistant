import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

/**
 * @typedef {Object} DataManagementCardProps
 * @property {() => void} onExportData - Function to trigger the data export dialog/process.
 * @property {() => void} onDeleteAccount - Function to trigger the account deletion confirmation dialog.
 * @property {boolean} isExporting - State flag indicating if data export is currently in progress.
 * @property {boolean} isDeleting - State flag indicating if account deletion is currently in progress.
 */
type DataManagementCardProps = {
  onExportData: () => void;
  onDeleteAccount: () => void;
  isExporting: boolean;
  isDeleting: boolean;
};

/**
 * A card component containing actions for managing user data, including export and account deletion,
 * aligned with data privacy regulations (e.g., GDPR).
 * @param {DataManagementCardProps} props - The props for the component.
 * @returns {JSX.Element} The DataManagementCard component.
 */
export function DataManagementCard({
  onExportData,
  onDeleteAccount,
  isExporting,
  isDeleting,
}: DataManagementCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            color: "primary.main",
          }}
        >
          <CloudDownloadIcon color="primary" /> Data Management
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            {/* Export Button */}
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<CloudDownloadIcon />}
              onClick={onExportData}
              disabled={isExporting || isDeleting}
              sx={{
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {isExporting ? (
                <CircularProgress size={24} />
              ) : (
                "Export My Data (GDPR)"
              )}
            </Button>

            {/* Delete Button */}
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<DeleteForeverIcon />}
              onClick={onDeleteAccount}
              disabled={isDeleting || isExporting}
              sx={{
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {isDeleting ? (
                <CircularProgress size={24} sx={{ color: "error.main" }} />
              ) : (
                "Delete My Account (GDPR)"
              )}
            </Button>
          </Box>

          {/* Disclaimer */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              **Important:** Deleting your account is irreversible and will
              remove all associated data.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
