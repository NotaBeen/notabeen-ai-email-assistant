import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
// Import the necessary Session type from next-auth
import { Session } from "next-auth";
import { UserData } from "../ProfileTypes";

/**
 * @typedef {Object} AccountInfoCardProps
 * @property {UserData | null} userData - Custom application-specific user data.
 * @property {Session["user"] | undefined} user - The user object from the NextAuth session.
 */
type AccountInfoCardProps = {
  userData: UserData | null;
  user: Session["user"] | undefined;
};

/**
 * A display card for essential user account information, primarily showing the email address.
 * @param {AccountInfoCardProps} props - The props for the component.
 * @returns {JSX.Element} The AccountInfoCard component.
 */
export function AccountInfoCard({ userData, user }: AccountInfoCardProps) {
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

          {/* Email Display */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              Email:
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: "medium", wordBreak: "break-word" }}
            >
              {/* Prioritize custom userData email, fall back to session user email */}
              {userData?.email || user?.email || "N/A"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
