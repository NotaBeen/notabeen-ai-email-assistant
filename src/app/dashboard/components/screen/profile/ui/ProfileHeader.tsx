// components/profile/ui/ProfileHeader.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

export function ProfileHeader() {
  return (
    <Box sx={{ textAlign: "center", mb: 5 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        My Profile
      </Typography>
      <Box
        sx={{
          height: "3px",
          width: "60px",
          mx: "auto",
          mb: 2,
          bgcolor: "primary.main",
        }}
      />
      <Typography variant="body1" color="text.secondary">
        Manage your account, data, and permissions.
      </Typography>
    </Box>
  );
}
