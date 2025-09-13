import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

export function OtherActionsCard() {
  const handleGrantPermissions = () => {
    window.location.href =
      "/auth/login?audience=urn:my-api&scope=openid%20profile%20email%20https://www.googleapis.com/auth/gmail.readonly&access_type=offline&prompt=consent";
  };
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
          <CloudDownloadIcon color="primary" /> Other
        </Typography>

        {/* Improved layout using a single flexbox container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2, // Consistent spacing between the elements
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
            Grant Gmail Permissions
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
