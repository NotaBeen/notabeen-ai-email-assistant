import {
  Button,
  Typography,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Avatar,
  Divider,
  ClickAwayListener,
  Paper,
  styled,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import { useState, useCallback, useEffect } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { Email } from "@/types/interfaces";

// --- Type Definitions ---

export type ExtractedEntities = {
  senderName: string;
  date: string;
  snippet: string;
  recipientNames: string[];
  subjectTerms: string[];
  attachmentNames: string[];
};

export type NavBarTopProps = {
  setScreen: (screen: string) => void;
  handleImportEmails?: () => Promise<void>;
  setOverviewOpen: (open: boolean) => void;
  setEmails: (emails: Email[]) => void;
  quotaExceeded?: boolean;
};

type UserData = {
  email: string;
  subscription: {
    tier: string;
    request_limit: number;
    end_date: string;
  };
  total_emails_analyzed: number;
  created_at: string;
};

// --- Custom Styled Components (MUI) ---

const ProfileDropdownContainer = styled(Box)({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

const ProfileTrigger = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  padding: "6px 8px",
  borderRadius: "20px",
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MenuContainer = styled(Paper)({
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  width: 240,
  boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
  borderRadius: "8px",
  zIndex: 1300,
});

const CustomMenuItem = styled("div")(({ theme }) => ({
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MenuItemIcon = styled("div")(({ theme }) => ({
  marginRight: "12px",
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.secondary,
}));

// --- NavBarTop Component ---

const NavBarTop: React.FC<NavBarTopProps> = ({
  setScreen,
  handleImportEmails,
  setOverviewOpen,
  quotaExceeded = false,
}) => {
  // Authentication: Use Better Auth's session hook
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const status = isPending ? "loading" : session ? "authenticated" : "unauthenticated";

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Responsive design
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  /**
   * Handles user logout using Better Auth.
   */
  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  /**
   * Fetches application-specific user data (e.g., subscription info) from the backend.
   */
  const fetchUserData = useCallback(async () => {
    if (status !== "authenticated" || !user) return;

    try {
      // Fetch user data. Relies on the NextAuth session cookie for server authentication.
      const response = await fetch("/api/user", { method: "GET" });

      if (response.status === 401) {
        setAuthError(true);
        // Automatically log out after showing error
        setTimeout(() => {
          handleLogout();
        }, 2000);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [user, status]);

  // Fetch user data on successful authentication status change
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, fetchUserData]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setScreen(tab);
    setOverviewOpen(false);
  };

  const handleProfileMenuToggle = () => {
    if (isMobile) {
      // On mobile, show the full drawer
      handleDrawerToggle();
    } else {
      // On desktop, toggle the dropdown
      setProfileMenuOpen(!profileMenuOpen);
    }
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(false);
  };

  const handleProfileSelection = (tab: string) => {
    handleTabClick(tab);
    handleProfileMenuClose();
  };

  /**
   * Handles email import with pre-checks for authentication and subscription status.
   */
  const handleImportWithAuthCheck = async () => {
    if (!handleImportEmails) return;

    try {
      // Fresh auth check before resource-intensive operation
      const authCheck = await fetch("/api/user", { method: "GET" });
      if (authCheck.status === 401) {
        setAuthError(true);
        setTimeout(() => {
          handleLogout();
        }, 2000);
        return;
      }

      // Check subscription status
      const currentDate = new Date();
      const subscriptionEndDate = new Date(
        userData?.subscription?.end_date ?? "",
      );

      if (subscriptionEndDate <= currentDate) {
        alert("Your subscription has expired. Please upgrade for more usage.");
        return;
      }

      setIsLoading(true);
      await handleImportEmails();
    } catch (error) {
      console.error("Error importing emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Auth Error Alert (Fixed Position) */}
      {authError && (
        <Alert
          severity="error"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            borderRadius: 0,
          }}
        >
          Authentication expired. Redirecting to login...
        </Alert>
      )}

      {/* Main Navigation Bar (Header) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: isMobile ? 2 : 3,
          py: 1.5,
          bgcolor: "background.paper",
          height: "100%",
          width: "100%",
        }}
      >
        {/* Left side - Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="button"
            onClick={() => handleTabClick("overview")}
            sx={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="img"
                src="/web-app-manifest-512x512.png"
                alt="NotaBeen Logo"
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Typography variant="h6" noWrap sx={{ fontWeight: 500 }}>
                NotaBeen
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center - Import Button (Desktop only) */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {handleImportEmails && (
              <Tooltip title="Import your latest emails">
                <Button
                  onClick={handleImportWithAuthCheck}
                  disabled={isLoading || authError}
                  startIcon={
                    isLoading ? (
                      <CircularProgress
                        size={16}
                        sx={{ color: "text.primary" }}
                      />
                    ) : null
                  }
                  sx={{
                    color: "text.primary",
                    bgcolor: "primary.main",
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: "20px",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "&:disabled": {
                      bgcolor: "action.disabledBackground",
                      color: "action.disabled",
                    },
                  }}
                >
                  {isLoading ? "Importing..." : "Import Emails"}
                </Button>
              </Tooltip>
            )}
          </Box>
        )}

        {/* Right side - Profile / Menu Toggle */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isMobile ? (
            // Mobile: Hamburger menu icon
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{
                color: "text.secondary",
                padding: "8px",
              }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // Desktop: Profile dropdown
            <ClickAwayListener onClickAway={handleProfileMenuClose}>
              <ProfileDropdownContainer>
                {/* Profile Trigger Button */}
                <ProfileTrigger onClick={handleProfileMenuToggle}>
                  <Avatar
                    src={user?.image || undefined}
                    alt={user?.name || "User"}
                    sx={{
                      width: 32,
                      height: 32,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                  <KeyboardArrowDownIcon
                    sx={{ fontSize: 16, ml: 0.5, color: "text.secondary" }}
                  />
                </ProfileTrigger>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <MenuContainer elevation={2}>
                    {/* User Info Section */}
                    <Box sx={{ p: 2, pb: 1.5 }}>
                      <Avatar
                        src={user?.image || undefined}
                        alt={user?.name || "User"}
                        sx={{
                          width: 40,
                          height: 40,
                          mb: 1,
                        }}
                      />
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        {user?.name || "User"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.8rem",
                        }}
                      >
                        {user?.email || userData?.email || "user@example.com"}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Menu Links */}
                    <CustomMenuItem
                      onClick={() => handleProfileSelection("overview")}
                    >
                      <MenuItemIcon>
                        <HomeIcon sx={{ fontSize: 20 }} />
                      </MenuItemIcon>
                      Overview
                    </CustomMenuItem>

                    <CustomMenuItem
                      onClick={() => handleProfileSelection("profile")}
                    >
                      <MenuItemIcon>
                        <PersonIcon sx={{ fontSize: 20 }} />
                      </MenuItemIcon>
                      Profile
                    </CustomMenuItem>

                    <Divider sx={{ my: 1 }} />

                    {/* Logout */}
                    <CustomMenuItem
                      onClick={handleLogout}
                      sx={{ color: "error.main" }}
                    >
                      <MenuItemIcon sx={{ color: "error.main" }}>
                        <LogoutIcon sx={{ fontSize: 20 }} />
                      </MenuItemIcon>
                      Logout
                    </CustomMenuItem>
                  </MenuContainer>
                )}
              </ProfileDropdownContainer>
            </ClickAwayListener>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer (Left-aligned sidebar) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: "80%",
            maxWidth: 280,
            bgcolor: "background.paper",
            pt: 2,
          },
        }}
      >
        <List>
          {/* Logo in Drawer */}
          <ListItem
            sx={{
              mb: 2,
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              component="button"
              onClick={() => {
                handleTabClick("overview");
                handleDrawerToggle();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "8px",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Typography variant="h6" noWrap sx={{ fontWeight: 500 }}>
                <Box
                  component="img"
                  src="/web-app-manifest-512x512.png"
                  alt="NotaBeen Logo"
                  sx={{ width: 32, height: 32, mr: 1 }}
                />{" "}
                NotaBeen
              </Typography>
            </Box>
          </ListItem>

          {/* Auth Error in Drawer */}
          {authError && (
            <ListItem>
              <Alert severity="error" sx={{ width: "100%" }}>
                Authentication expired
              </Alert>
            </ListItem>
          )}

          {/* User Info in Drawer */}
          <ListItem
            sx={{ mb: 2, flexDirection: "column", alignItems: "flex-start" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                mb: 1,
              }}
            >
              <Avatar
                src={user?.image || undefined}
                alt={user?.name || "User"}
                sx={{ width: 36, height: 36, mr: 2 }}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {user?.name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {user?.email || userData?.email || "user@example.com"}
                </Typography>
              </Box>
            </Box>
          </ListItem>

          <Divider sx={{ mb: 1 }} />

          {/* Import Emails Button */}
          {handleImportEmails && (
            <ListItem>
              <Button
                onClick={handleImportWithAuthCheck}
                fullWidth
                disabled={isLoading || authError}
                startIcon={
                  isLoading ? (
                    <CircularProgress
                      size={20}
                      sx={{ color: "text.primary" }}
                    />
                  ) : null
                }
                sx={{
                  color: "text.primary",
                  bgcolor: "primary.main",
                  textTransform: "none",
                  fontWeight: 600,
                  justifyContent: "flex-start",
                  py: 1.5,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": {
                    bgcolor: "action.disabledBackground",
                    color: "action.disabled",
                  },
                }}
              >
                {isLoading ? "Importing..." : "Import Emails"}
              </Button>
            </ListItem>
          )}

          {/* Navigation Items */}
          <ListItem>
            <Button
              onClick={() => {
                handleTabClick("overview");
                handleDrawerToggle();
              }}
              fullWidth
              startIcon={<HomeIcon />}
              sx={{
                color:
                  activeTab === "overview" ? "text.primary" : "text.secondary",
                textTransform: "none",
                justifyContent: "flex-start",
                py: 1.5,
                bgcolor:
                  activeTab === "overview" ? "action.selected" : "transparent",
                "&:hover": {
                  bgcolor:
                    activeTab === "overview"
                      ? "action.selected"
                      : "action.hover",
                },
              }}
            >
              Overview
            </Button>
          </ListItem>

          <ListItem>
            <Button
              onClick={() => {
                handleTabClick("profile");
                handleDrawerToggle();
              }}
              fullWidth
              startIcon={<PersonIcon />}
              sx={{
                color:
                  activeTab === "profile" ? "text.primary" : "text.secondary",
                textTransform: "none",
                justifyContent: "flex-start",
                py: 1.5,
                bgcolor:
                  activeTab === "profile" ? "action.selected" : "transparent",
                "&:hover": {
                  bgcolor:
                    activeTab === "profile"
                      ? "action.selected"
                      : "action.hover",
                },
              }}
            >
              Profile
            </Button>
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* Logout Button */}
          <ListItem>
            <Button
              onClick={handleLogout}
              fullWidth
              startIcon={<LogoutIcon />}
              sx={{
                color: "error.main",
                textTransform: "none",
                justifyContent: "flex-start",
                py: 1.5,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              Logout
            </Button>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default NavBarTop;
