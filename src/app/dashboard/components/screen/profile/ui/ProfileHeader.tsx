import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * A reusable header component for the profile screen, displaying a title and a brief description.
 * @returns {JSX.Element} The ProfileHeader component.
 */
export function ProfileHeader() {
  return (
    <Box sx={{ textAlign: "center", mb: 5 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }} // Increased font weight for a stronger heading
      >
        My Profile
      </Typography>
      {/* Decorative separator line */}
      <Box
        sx={{
          height: "3px",
          width: "60px",
          mx: "auto",
          mb: 2,
          bgcolor: "primary.main",
          borderRadius: "999px", // Added rounded ends for style
        }}
      />
      <Typography variant="body1" color="text.secondary">
        Manage your **account**, **data**, and **permissions**.
      </Typography>
    </Box>
  );
}
