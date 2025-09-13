"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Snackbar, Alert, Stack } from "@mui/material";
import { useUser } from "@auth0/nextjs-auth0";
import { UserData } from "./ProfileTypes";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ProfileHeader } from "./ui/ProfileHeader";
import { AccountInfoCard } from "./ui/AccountInfoCard";
import { GdprInfoCard } from "./ui/GdprInfoCard";
import { OtherActionsCard } from "./ui/OtherActionsCard";
import { DeleteAccountDialog } from "./dialogs/DeleteAccountDialog";
import { ExportDataDialog } from "./dialogs/ExportDataDialog";
import { DataManagementCard } from "./ui/DataManagementCard";

export default function Profile() {
  const { user, isLoading: isAuth0Loading } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
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
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
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
  }, [user]);

  useEffect(() => {
    if (!isAuth0Loading) {
      fetchUserData();
    }
  }, [isAuth0Loading, fetchUserData]);

  const handleLogout = () => {
    window.location.href = "/auth/logout";
  };

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

  const confirmExportData = async (format: "json" | "csv") => {
    setIsExporting(true);
    setOpenExportDialog(false);
    try {
      const res = await fetch(`/api/user/export?format=${format}`, {
        method: "GET",
      });
      if (res.ok) {
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

  if (isAuth0Loading || loading) {
    return <LoadingSpinner />;
  }

  const gdprInfo = userData?.gdpr_compliance_information;

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#F2EEEC",
        overflowY: "auto",
        mx: "auto",
        maxWidth: "900px", // Constrains the width on large screens
        px: { xs: 2, sm: 3 }, // Adds padding on smaller screens
        py: { xs: 3, sm: 5 }, // Adds vertical padding
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
        {gdprInfo && <GdprInfoCard gdprInfo={gdprInfo} />}
        <OtherActionsCard />
      </Stack>
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
