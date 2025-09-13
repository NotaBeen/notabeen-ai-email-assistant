// components/profile/ui/LoadingSpinner.tsx
import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
      }}
    >
      <CircularProgress />
      <Typography sx={{ fontSize: "1.05rem", mt: 2, color: "text.secondary" }}>
        Loading profile...
      </Typography>
    </Box>
  );
}
