"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Snackbar, Alert, Stack } from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import { UserData } from "./ProfileTypes";

// UI Components
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ProfileHeader } from "./ui/ProfileHeader";
import { AccountInfoCard } from "./ui/AccountInfoCard";
import { GdprInfoCard } from "./ui/GdprInfoCard";
import { OtherActionsCard } from "./ui/OtherActionsCard";
import { DataManagementCard } from "./ui/DataManagementCard";

// Dialogs
import { DeleteAccountDialog } from "./dialogs/DeleteAccountDialog";
import { ExportDataDialog } from "./dialogs/ExportDataDialog";

/**
 * The main Profile component handles user data display, state management for loading/actions,
 * and integration with NextAuth and backend API endpoints.
 * @returns {JSX.Element} The Profile page component.
 */
export default function Profile() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isSessionLoading = status === "loading";

  const [userData, setUserData] = useState<UserData | null>(null);
  // Separate loading state for API calls *after* the session is established
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const fetchUserData = useCallback(async () => {
    // Only fetch user data if the session is authenticated
    if (status !== "authenticated" || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // API call to fetch custom user data and GDPR information
      const res = await fetch("/api/user", { method: "GET" });
      if (res.ok) {
        const data: UserData = await res.json();
        setUserData(data);
      } else {
        const errorData = await res.json();
        setSnackbar({
          open: true,
          message: `Failed to load profile data: ${
            errorData.message || res.statusText
          }`,
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "An unexpected error occurred while loading profile data.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [user, status]);

  // Effect hook to run data fetch once the session status is resolved
  useEffect(() => {
    if (status !== "loading") {
      fetchUserData();
    }
  }, [status, fetchUserData]);

  /**
   * Handles the successful deletion of an account, logging the user out afterwards.
   */
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  /**
   * Confirms and executes the API call to permanently delete the user's account.
   */
  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    setOpenDeleteDialog(false);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Account and data successfully deleted. Redirecting...",
          severity: "success",
        });
        // Redirect after a short delay for the user to see the success message
        setTimeout(handleLogout, 3000);
      } else {
        const errorData = await res.json();
        setSnackbar({
          open: true,
          message: `Failed to delete account: ${
            errorData.message || res.statusText
          }`,
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "An unexpected error occurred during account deletion.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Confirms the data export format and initiates the API call to download the data.
   * @param {"json" | "csv"} format - The requested export format.
   */
  const confirmExportData = async (format: "json" | "csv") => {
    setIsExporting(true);
    setOpenExportDialog(false);
    try {
      const res = await fetch(`/api/user/export?format=${format}`, {
        method: "GET",
      });
      if (res.ok) {
        // Handle file download
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `user_data.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setSnackbar({
          open: true,
          message: `Data successfully exported as ${format.toUpperCase()}.`,
          severity: "success",
        });
      } else {
        const errorData = await res.json();
        setSnackbar({
          open: true,
          message: `Failed to export data: ${
            errorData.message || res.statusText
          }`,
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "An unexpected error occurred during data export.",
        severity: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Show a loading spinner if either the NextAuth session or the custom user data is loading
  if (isSessionLoading || loading) {
    return <LoadingSpinner />;
  }

  // Get GDPR info for conditional rendering
  const gdprInfo = userData?.gdpr_compliance_information;

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#F2EEEC",
        overflowY: "auto",
        mx: "auto",
        maxWidth: "900px", // Constrains the content width
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
      }}
    >
      <ProfileHeader />
      <Stack spacing={3}>
        <AccountInfoCard user={user} userData={userData} />
        <DataManagementCard
          onExportData={() => setOpenExportDialog(true)}
          onDeleteAccount={() => setOpenDeleteDialog(true)}
          isExporting={isExporting}
          isDeleting={isDeleting}
        />
        {/* Only render GDPR card if data is available */}
        {gdprInfo && <GdprInfoCard gdprInfo={gdprInfo} />}
        <OtherActionsCard />
      </Stack>

      {/* Dialogs */}
      <DeleteAccountDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDeleteAccount}
      />
      <ExportDataDialog
        open={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        onConfirm={confirmExportData}
      />

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
