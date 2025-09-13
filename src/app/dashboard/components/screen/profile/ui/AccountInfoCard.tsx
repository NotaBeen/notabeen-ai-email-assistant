// components/profile/ui/AccountInfoCard.tsx
import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { useUser } from "@auth0/nextjs-auth0";
import { UserData } from "../ProfileTypes";

type Props = {
  userData: UserData | null;
  user: ReturnType<typeof useUser>["user"] | undefined;
};

export function AccountInfoCard({ userData, user }: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
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
            <EmailIcon color="primary" /> Account Information
          </Typography>

          {/* Replaced Grid with a single Box */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Email:
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: "medium", wordBreak: "break-word" }}
            >
              {userData?.email || user?.email || "N/A"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
