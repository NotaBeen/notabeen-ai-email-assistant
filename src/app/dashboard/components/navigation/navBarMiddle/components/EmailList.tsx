import React from "react";
import { Box } from "@mui/material";
import EmailItem from "./EmailItem";
import { Email } from "@/types/interfaces";

interface EmailListProps {
  emails: Email[];
  currentEmail: Email | null;
  onEmailClick: (email: Email) => void;
  onUnsubscribe: (unsubscribeLink: string) => void;
  onActionUpdate: (emailId: string, action: string) => void;
  formatDate: (dateString: string) => string;
  formatTimestamp: (dateString: string) => string;
  isMobile: boolean; // Add isMobile to props
  currentFilter: string; // Add currentFilter to props
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  currentEmail,
  onEmailClick,
  onUnsubscribe,
  onActionUpdate,
  formatDate,
  formatTimestamp,
  isMobile,
  currentFilter,
}) => {
  const getUrgencyTier = (email: Email): number => {
    const score = parseInt(email.urgencyScore?.toString() || "0");
    if (score >= 71) return 1; // Urgent
    if (score >= 41) return 2; // Important
    if (score >= 11) return 3; // Can Wait
    return 4; // Unimportant / Other
  };

  const sortEmails = (a: Email, b: Email) => {
    const aArchived = a.userActionTaken === "Archived";
    const bArchived = b.userActionTaken === "Archived";

    // Special sorting for mobile "all" view
    if (isMobile && currentFilter === "all") {
      const aTier = getUrgencyTier(a);
      const bTier = getUrgencyTier(b);

      if (aTier !== bTier) {
        return aTier - bTier;
      }
    }

    // Default sorting logic: archived emails at the bottom, then by date (newest first)
    if (aArchived && !bArchived) return 1;
    if (!aArchived && bArchived) return -1;

    return (
      new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime()
    );
  };

  const sortedEmails = [...emails].sort(sortEmails);

  return (
    <Box
      sx={{
        height: "100%",
        flex: 1,
        overflowY: "auto",
      }}
    >
      {sortedEmails.map((email) => (
        <EmailItem
          key={email._id}
          email={email}
          isSelected={currentEmail?._id === email._id}
          onEmailClick={onEmailClick}
          onUnsubscribe={onUnsubscribe}
          onActionUpdate={onActionUpdate}
          formatDate={formatDate}
          formatTimestamp={formatTimestamp}
        />
      ))}
    </Box>
  );
};

export default EmailList;
