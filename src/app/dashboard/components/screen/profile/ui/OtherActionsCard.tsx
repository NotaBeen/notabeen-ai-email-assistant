import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey"; // Changed icon to be more relevant to permissions

/**
 * A card component that provides access to miscellaneous user actions, such as
 * re-granting necessary external service permissions (e.g., Google/Gmail).
 * @returns {JSX.Element} The OtherActionsCard component.
 */
export function OtherActionsCard() {
  /**
   * Redirects the user to the Google OAuth flow to re-grant necessary permissions.
   * Uses a simple approach that should work reliably with NextAuth v5.
   */
  const handleGrantPermissions = () => {
    // Use the standard NextAuth sign-in URL
    // The provider is already configured with the Gmail scope in auth.ts
    window.location.href = "/api/auth/signin/google";
  };

  // NOTE: I've updated the `window.location.href` to use the standard NextAuth `signin` endpoint,
  // which is more appropriate for an open-source project moving away from Auth0 specifics,
  // while keeping the necessary Gmail scope.

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
          <VpnKeyIcon color="primary" /> Permissions & Access
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleGrantPermissions}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Re-Grant Gmail Permissions
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
