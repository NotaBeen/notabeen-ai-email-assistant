import { Box, useMediaQuery, useTheme, Drawer } from "@mui/material";
import { useState, useEffect } from "react";
import React from "react";
import EmailDetails from "../overview/components/emailDetails/EmailDetails";
import { AttachmentResponse } from "../overview/components/emailDetails/EmailDetails";
import NavBarSelector from "../../navigation/NavBarSelector";
import NavBarMiddle from "../../navigation/navBarMiddle/NavBarMiddle";
import { Email } from "@/types/interfaces";

// The types are fine, we'll keep them as they are
export type ExtractedEntities = {
  senderName: string;
  date: string;
  snippet: string;
  recipientNames: string[];
  subjectTerms: string[];
  attachmentNames: string[];
};

type OverviewProps = {
  emails: Email[];
  setEmails: (emails: Email[]) => void;
  setCurrentEmail: (email: Email | null) => void;
  currentEmail: Email | null;
  setScreen: (screen: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
};

function Overview({
  emails,
  setEmails,
  setCurrentEmail,
  currentEmail,
  activeFilter,
  setActiveFilter,
}: OverviewProps) {
  const [fullEmail, setFullEmail] = useState<{
    body: string;
    attachments: AttachmentResponse[];
  } | null>(null);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>(emails);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // This useEffect sets the "all" filter by default on mobile view, only runs once.
  useEffect(() => {
    if (isMobile && activeFilter !== "all") {
      setActiveFilter("all");
    }
  }, [isMobile, activeFilter, setActiveFilter]);

  // This useEffect handles filtering, keeping sorting concerns in the child component.
  useEffect(() => {
    let newFilteredEmails: Email[] = [];
    const nonArchivedEmails = emails.filter(
      (email) => email.userActionTaken !== "Archived",
    );
    const archivedEmails = emails.filter(
      (email) => email.userActionTaken === "Archived",
    );

    switch (activeFilter) {
      case "urgent":
        newFilteredEmails = nonArchivedEmails.filter(
          (email) => parseInt(email.urgencyScore?.toString() || "0") >= 71,
        );
        break;
      case "important":
        newFilteredEmails = nonArchivedEmails.filter(
          (email) =>
            parseInt(email.urgencyScore?.toString() || "0") >= 41 &&
            parseInt(email.urgencyScore?.toString() || "0") < 71,
        );
        break;
      case "canWait":
        newFilteredEmails = nonArchivedEmails.filter(
          (email) =>
            parseInt(email.urgencyScore?.toString() || "0") >= 11 &&
            parseInt(email.urgencyScore?.toString() || "0") < 41,
        );
        break;
      case "unsubscribe":
        newFilteredEmails = nonArchivedEmails.filter(
          (email) => !!email.unsubscribeLink,
        );
        break;
      case "unimportant":
        newFilteredEmails = nonArchivedEmails.filter(
          (email) =>
            parseInt(email.urgencyScore?.toString() || "0") < 11 &&
            !email.unsubscribeLink,
        );
        break;
      case "archived":
        newFilteredEmails = archivedEmails;
        break;
      case "all":
      default:
        newFilteredEmails = nonArchivedEmails;
        break;
    }
    setFilteredEmails(newFilteredEmails);
  }, [emails, activeFilter]);

  const handleSetCurrentEmail = (email: Email | null) => {
    setCurrentEmail(email);
  };

  const handleSetEmails = (updatedEmails: Email[]) => {
    setEmails(updatedEmails);
    setFilteredEmails(updatedEmails);
  };

  const handleSetFullEmail = (email: Email | null) => {
    if (email) {
      setFullEmail({
        body: email.text ?? "",
        attachments: [],
      });
    } else {
      setFullEmail(null);
    }
  };

  // --- Mobile View ---
  if (isMobile) {
    return (
      <Box sx={{ height: "100vh", width: "100vw", overflowY: "auto" }}>
        {/* Top-level mobile component that shows the list of emails */}
        <Box
          sx={{
            display: currentEmail ? "none" : "block",
            height: "100%",
          }}
        >
          <NavBarSelector
            setFilter={setActiveFilter}
            currentEmail={currentEmail}
            setCurrentEmail={handleSetCurrentEmail}
            emails={emails}
            setEmails={handleSetEmails}
            filteredEmails={filteredEmails}
            setFilteredEmails={setFilteredEmails}
            activeFilter={activeFilter}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
          <NavBarMiddle
            setCurrentEmail={handleSetCurrentEmail}
            emails={filteredEmails.length > 0 ? filteredEmails : emails}
            setEmails={setEmails}
            currentEmail={currentEmail}
            currentFilter={activeFilter}
            setFullEmail={handleSetFullEmail}
          />
        </Box>

        {/* The Email Details view is a full-screen drawer on mobile */}
        <Drawer
          anchor="right"
          open={!!currentEmail}
          onClose={() => setCurrentEmail(null)}
          PaperProps={{ sx: { width: "100%", maxWidth: "100vw" } }}
        >
          {currentEmail && (
            <EmailDetails
              currentEmail={currentEmail}
              setCurrentEmail={setCurrentEmail}
              fullEmail={fullEmail}
              setFullEmail={setFullEmail}
            />
          )}
        </Drawer>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "#F2EEEC",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ height: "6%", width: "100%" }}>
        <NavBarSelector
          setFilter={setActiveFilter}
          currentEmail={currentEmail}
          setCurrentEmail={handleSetCurrentEmail}
          emails={emails}
          setEmails={handleSetEmails}
          filteredEmails={filteredEmails}
          setFilteredEmails={setFilteredEmails}
          activeFilter={activeFilter}
        />
      </Box>
      <Box sx={{ display: "flex", height: "94%", width: "100%" }}>
        <Box
          sx={{
            width: currentEmail ? "35%" : "100%",
            backgroundColor: "#EFEFEF",
            transition: "width 0.3s ease-in-out",
            minWidth: currentEmail ? "35%" : "100%",
            flexShrink: 0,
          }}
        >
          <NavBarMiddle
            setCurrentEmail={handleSetCurrentEmail}
            emails={filteredEmails.length > 0 ? filteredEmails : emails}
            setEmails={setEmails}
            currentEmail={currentEmail}
            currentFilter={activeFilter}
            setFullEmail={handleSetFullEmail}
          />
        </Box>
        <Box
          sx={{
            width: currentEmail ? "65%" : "0",
            minWidth: currentEmail ? "65%" : "0",
            flexShrink: 0,
            transition: "width 0.3s ease-in-out",
            overflow: "hidden",
          }}
        >
          {currentEmail && (
            <EmailDetails
              currentEmail={currentEmail}
              setCurrentEmail={setCurrentEmail}
              fullEmail={fullEmail}
              setFullEmail={setFullEmail}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Overview;
