// components/profile/ui/DataManagementCard.tsx
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

type Props = {
  onExportData: () => void;
  onDeleteAccount: () => void;
  isExporting: boolean;
  isDeleting: boolean;
};

export function DataManagementCard({
  onExportData,
  onDeleteAccount,
  isExporting,
  isDeleting,
}: Props) {
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

        {/* Replaced Grid with a flexbox Box container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2, // Space between buttons and disclaimer
          }}
        >
          {/* Box for the buttons, arranged in a row on medium screens and up */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<CloudDownloadIcon />}
              onClick={onExportData}
              disabled={isExporting}
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

            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<DeleteForeverIcon />}
              onClick={onDeleteAccount}
              disabled={isDeleting}
              sx={{
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {isDeleting ? (
                <CircularProgress size={24} />
              ) : (
                "Delete My Account (GDPR)"
              )}
            </Button>
          </Box>

          {/* Box for the disclaimer text */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              <strong>Important:</strong> Deleting your account is irreversible
              and will remove all associated data.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
