// src\app\dashboard\components\navigation\NavBarSelector.tsx

import React, { useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { Email } from "@/types/interfaces";
import { CATEGORY_STYLES } from "@/constants/urgencyColors";

// Type definitions remain in the same file for now
export type ExtractedEntities = {
  senderName: string;
  date: string;
  snippet: string;
  recipientNames: string[];
  subjectTerms: string[];
  attachmentNames: string[];
};

export type NavBarSelectorProps = {
  emails: Email[];
  setCurrentEmail: (email: Email | null) => void;
  currentEmail: Email | null;
  setFilter: (filter: string) => void;
  setEmails: (emails: Email[]) => void;
  filteredEmails: Email[];
  setFilteredEmails: (emails: Email[]) => void;
  mobileOpen?: boolean;
  activeFilter: string;
  setMobileOpen?: (open: boolean) => void;
};

// Define all available filters
const filters = [
  { key: "urgent", label: "Urgent" },
  { key: "important", label: "Important" },
  { key: "canWait", label: "Can Wait" },
  { key: "unsubscribe", label: "Unsubscribe" },
  { key: "unimportant", label: "Unimportant" },
  { key: "archived", label: "Archived" }, // ✅ Added archived filter
  { key: "all", label: "All" }, // ✅ Added all filter
];

const NavBarSelector: React.FC<NavBarSelectorProps> = ({
  emails,
  setCurrentEmail,
  setFilter,
  mobileOpen = false,
  setMobileOpen,
  activeFilter,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleClick = useCallback(
    (filterKey: string) => {
      setFilter(filterKey);
      if (setMobileOpen) {
        setMobileOpen(false);
      }
    },
    [setFilter, setMobileOpen],
  );

  const emailCounts = useMemo(() => {
    // Separate archived emails for filtering purposes
    const archivedEmails = emails.filter(
      (email) => email.userActionTaken === "Archived",
    );
    const nonArchivedEmails = emails.filter(
      (email) => email.userActionTaken !== "Archived",
    );

    // Calculate main filter counts using non-archived emails
    const urgent = nonArchivedEmails.filter(
      (email) => parseInt(email.urgencyScore?.toString() || "0") >= 71,
    );
    const important = nonArchivedEmails.filter(
      (email) =>
        parseInt(email.urgencyScore?.toString() || "0") >= 41 &&
        parseInt(email.urgencyScore?.toString() || "0") < 71,
    );
    const canWait = nonArchivedEmails.filter(
      (email) =>
        parseInt(email.urgencyScore?.toString() || "0") >= 11 &&
        parseInt(email.urgencyScore?.toString() || "0") < 41,
    );
    const unsubscribe = nonArchivedEmails.filter(
      (email) => !!email.unsubscribeLink,
    );
    const unimportant = nonArchivedEmails.filter(
      (email) =>
        parseInt(email.urgencyScore?.toString() || "0") < 11 &&
        !email.unsubscribeLink,
    );

    const counts: Record<string, number> = {
      urgent: urgent.length,
      important: important.length,
      canWait: canWait.length,
      unsubscribe: unsubscribe.length,
      unimportant: unimportant.length,
      archived: archivedEmails.length, // ✅ Archived count
      all: emails.length, // ✅ 'All' filter now includes ALL emails (archived or not)
    };
    return counts;
  }, [emails]);

  // Separate filters into two logical groups to match the UI layout
  const mainFilters = filters.slice(0, 3); // Urgent, Important, Can Wait
  const subFilters = filters.slice(3); // Unsubscribe, Unimportant, Archived, All

  // All UI rendering logic (Mobile Drawer and Desktop Box) correctly maps and renders the `mainFilters` and `subFilters` arrays.

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen && setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            border: "none",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "flex-end",
            backgroundColor: "#FAFAFA",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          {/* First Section: Main Filters */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {mainFilters.map((filter) => {
              const isActive = activeFilter === filter.key;
              const { color } =
                CATEGORY_STYLES[filter.key] || CATEGORY_STYLES.default;
              return (
                <Box
                  key={filter.key}
                  onClick={() => {
                    handleClick(filter.key);
                    if (setCurrentEmail) setCurrentEmail(null);
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    py: 2,
                    px: 3,
                    textTransform: "none",
                    borderRadius: "0",
                    color: color,
                    backgroundColor: isActive ? "#FBFBFB" : "#FAFAFA",
                    borderBottom: isActive
                      ? `3px solid ${color}`
                      : "3px solid transparent",
                    "&:hover": {
                      backgroundColor: "#FBFBFB",
                    },
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: isMobile ? "1.125rem" : "1rem",
                        color: isActive ? color : undefined,
                      }}
                    >
                      {filter.label}
                    </Typography>
                    <Box
                      sx={{
                        color: isActive ? color : undefined,
                        minWidth: isMobile ? "28px" : "24px",
                        height: isMobile ? "28px" : "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "1rem" : "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {emailCounts[filter.key] > 99 ? (
                        <Typography
                          sx={{
                            fontSize: isMobile ? "0.875rem" : "0.70rem",
                            fontWeight: 600,
                          }}
                        >
                          99+
                        </Typography>
                      ) : (
                        emailCounts[filter.key]
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Spacer to separate the two sections */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Second Section: Sub-Filters */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {subFilters.map((filter) => {
              const isActive = activeFilter === filter.key;
              const { color } =
                CATEGORY_STYLES[filter.key] || CATEGORY_STYLES.default;
              return (
                <Box
                  key={filter.key}
                  onClick={() => {
                    handleClick(filter.key);
                    if (setCurrentEmail) setCurrentEmail(null);
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    py: 2,
                    px: 3,
                    textTransform: "none",
                    borderRadius: "8px 8px 0 0",
                    color: color,
                    backgroundColor: isActive ? "#FBFBFB" : "#FAFAFA",
                    border: "none",
                    borderBottom: isActive
                      ? `3px solid ${color}`
                      : "3px solid transparent",
                    "&:hover": {
                      backgroundColor: "#FBFBFB",
                    },
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: isMobile ? "1.125rem" : "1rem",
                        fontWeight: isActive ? "bold" : "normal",
                        color: isActive ? color : undefined,
                      }}
                    >
                      {filter.label}
                    </Typography>
                    <Box
                      sx={{
                        color: isActive ? color : undefined,
                        minWidth: isMobile ? "28px" : "24px",
                        height: isMobile ? "28px" : "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "1rem" : "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {emailCounts[filter.key] > 99 ? (
                        <Typography
                          sx={{
                            fontSize: isMobile ? "0.875rem" : "0.70rem",
                            fontWeight: 600,
                          }}
                        >
                          99+
                        </Typography>
                      ) : (
                        emailCounts[filter.key]
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: { xs: "none", md: "block" },
        backgroundColor: "#ffffff",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        {/* First Section: Main Filters */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            height: "100%",
            pl: 5,
          }}
        >
          {mainFilters.map((filter) => {
            const isActive = activeFilter === filter.key;
            const { color } =
              CATEGORY_STYLES[filter.key] || CATEGORY_STYLES.default;
            return (
              <Box
                key={filter.key}
                onClick={() => {
                  handleClick(filter.key);
                  if (setCurrentEmail) setCurrentEmail(null);
                }}
                sx={{
                  minWidth: "7vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  textTransform: "none",
                  borderRadius: " 8px 8px 0 0",
                  color: color,
                  backgroundColor: isActive ? "#FAFAFA" : "#ffffff",
                  borderTop: isActive
                    ? `1px solid ${color}`
                    : "1px solid transparent",
                  borderLeft: isActive
                    ? `1px solid ${color}`
                    : "1px solid transparent",
                  borderRight: isActive
                    ? `1px solid ${color}`
                    : "1px solid transparent",
                  // Remove bottom border to make the active tab connect to the content below
                  borderBottom: isActive
                    ? "1px solid #FAFAFA"
                    : "1px solid #E5E7EB",
                  "&:hover": {
                    backgroundColor: "#FBFBFB",
                  },
                  overflow: "hidden",
                  p: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      color: isActive ? color : undefined,
                    }}
                  >
                    {filter.label}
                  </Typography>
                  <Box
                    sx={{
                      color: isActive ? color : undefined,
                      minWidth: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {emailCounts[filter.key] > 99 ? (
                      <Typography
                        sx={{
                          fontSize: "0.70rem",
                          fontWeight: 600,
                        }}
                      >
                        99+
                      </Typography>
                    ) : (
                      emailCounts[filter.key]
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Spacer to separate the two sections */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Second Section: Sub-Filters */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            height: "100%",
            pr: 5,
          }}
        >
          {subFilters.map((filter) => {
            const isActive = activeFilter === filter.key;
            const { color } =
              CATEGORY_STYLES[filter.key] || CATEGORY_STYLES.default;
            return (
              <Box
                key={filter.key}
                onClick={() => {
                  handleClick(filter.key);
                  if (setCurrentEmail) setCurrentEmail(null);
                }}
                sx={{
                  minWidth: "7vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  textTransform: "none",
                  borderRadius: " 8px 8px 0 0",
                  color: color,
                  backgroundColor: isActive ? "#FAFAFA" : "#ffffff",
                  borderTop: isActive
                    ? `1px solid ${color}`
                    : "1px solid transparent",
                  borderLeft: isActive
                    ? `1px solid ${color}`
                    : "1px solid transparent",
                  borderRight: isActive
                    ? `1px solid ${color}`
                    : "1px solid transparent",
                  // Remove bottom border to make the active tab connect to the content below
                  borderBottom: isActive
                    ? "1px solid #FAFAFA"
                    : "1px solid #E5E7EB",
                  "&:hover": {
                    backgroundColor: "#FBFBFB",
                  },
                  overflow: "hidden",
                  p: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      color: isActive ? color : undefined,
                    }}
                  >
                    {filter.label}
                  </Typography>
                  <Box
                    sx={{
                      color: isActive ? color : undefined,
                      minWidth: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {emailCounts[filter.key] > 99 ? (
                      <Typography
                        sx={{
                          fontSize: "0.70rem",
                          fontWeight: 600,
                        }}
                      >
                        99+
                      </Typography>
                    ) : (
                      emailCounts[filter.key]
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default NavBarSelector;
