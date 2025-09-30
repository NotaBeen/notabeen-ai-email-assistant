import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * A full-page loading spinner component for showing a profile or screen is loading.
 * @returns {JSX.Element} The LoadingSpinner component.
 */
export function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // Ensures the spinner is vertically centered on the entire viewport height
        minHeight: "100vh",
        flexDirection: "column",
        width: "100%", // Ensures it spans the full width of its container
      }}
    >
      <CircularProgress size={60} />
      <Typography sx={{ fontSize: "1.05rem", mt: 3, color: "text.secondary" }}>
        Loading profile...
      </Typography>
    </Box>
  );
}
