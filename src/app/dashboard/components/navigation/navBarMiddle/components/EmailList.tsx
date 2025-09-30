// src\app\dashboard\components\navigation\navBarMiddle\components\EmailList.tsx

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
  isMobile: boolean;
  currentFilter: string;
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
  /**
   * Helper function to determine the urgency tier based on the score.
   * Lower tier number means higher urgency.
   * @param email The email object.
   * @returns The urgency tier number (1 to 4).
   */
  const getUrgencyTier = (email: Email): number => {
    // Safely parse the urgencyScore, defaulting to 0 if null/invalid.
    const score = parseInt(email.urgencyScore?.toString() || "0");
    if (score >= 71) return 1; // 1: Urgent (Highest Priority)
    if (score >= 41) return 2; // 2: Important
    if (score >= 11) return 3; // 3: Can Wait
    return 4; // 4: Unimportant / Other (Lowest Priority)
  };

  /**
   * Defines the custom sorting logic for the email list.
   * @param a The first email for comparison.
   * @param b The second email for comparison.
   */
  const sortEmails = (a: Email, b: Email) => {
    const aArchived = a.userActionTaken === "Archived";
    const bArchived = b.userActionTaken === "Archived";

    // ✅ Priority Logic 1: Mobile "All" Filter (Urgency First)
    if (isMobile && currentFilter === "all") {
      const aTier = getUrgencyTier(a);
      const bTier = getUrgencyTier(b);

      // If tiers are different, sort by tier (1 before 2, 2 before 3, etc.)
      if (aTier !== bTier) {
        return aTier - bTier;
      }
    }

    // ✅ Priority Logic 2: Archived Status (Archived always at the bottom, regardless of filter)
    if (aArchived && !bArchived) return 1;
    if (!aArchived && bArchived) return -1;

    // ✅ Default Logic: Sort by dateReceived (newest first, descending)
    return (
      new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime()
    );
  };

  // Apply sorting logic to a copy of the emails array
  const sortedEmails = [...emails].sort(sortEmails);

  return (
    <Box
      sx={{
        height: "100%",
        flex: 1,
        overflowY: "auto", // Enables vertical scrolling
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Render the sorted list of emails */}
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
          // formatTimestamp is not used in EmailItem but kept for prop consistency
        />
      ))}
    </Box>
  );
};

export default EmailList;
