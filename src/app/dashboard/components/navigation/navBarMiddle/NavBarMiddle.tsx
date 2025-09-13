import React, { useState, useMemo, useEffect, useRef } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";

import EmptyState from "./components/EmptyState";
import EmailList from "./components/EmailList";
import { Email } from "@/types/interfaces";

// Type definitions and constants moved from useNavBarMiddle.ts
export interface ExtractedEntities {
  senderName: string;
  date: string;
  snippet: string;
  recipientNames: string[];
  subjectTerms: string[];
  attachmentNames: string[];
}

export interface NavBarMiddleProps {
  emails: Email[];
  setCurrentEmail: (email: Email | null) => void;
  currentEmail: Email | null;
  currentFilter: string;
  setFullEmail: (email: Email | null) => void;
  setMobileOpen?: (open: boolean) => void;
  setEmails: (emails: Email[]) => void;
}

const URGENCY_THRESHOLDS = {
  URGENT: 71,
  IMPORTANT: 41,
  CAN_WAIT: 11,
} as const;

// API call for updating email actions
const handleActionUpdateAPI = async (
  emailId: string,
  action: string,
): Promise<boolean> => {
  try {
    const requestBody = { userActionTaken: action };

    const response = await fetch(`/api/user/emails/${emailId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = { rawResponse: responseText };
    }

    if (!response.ok) {
      let errorMessage = "Update failed";
      if (response.status === 401) {
        errorMessage = "Not authorized. Please refresh and try again.";
      } else if (response.status === 404) {
        errorMessage = "Email not found";
      } else if (response.status === 400) {
        errorMessage = responseData.message || "Invalid request";
      } else {
        errorMessage =
          responseData.message || `Server error (${response.status})`;
      }

      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection.");
    }

    throw error;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const year = date.getFullYear().toString();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
};

const getUrgencyScore = (email: Email): number => {
  return parseInt(email.urgencyScore.toString());
};

const getCategoryDisplayName = (filter: string): string => {
  const categoryNames: Record<string, string> = {
    canWait: "Can Wait",
    urgent: "Urgent",
    important: "Important",
    unsubscribe: "Unsubscribe",
    unimportant: "Unimportant",
  };

  return categoryNames[filter] || filter;
};

const useEmailFiltering = (emails: Email[], currentFilter: string) => {
  return useMemo(() => {
    const categorizeEmails = () => {
      const urgent = emails.filter(
        (email) => getUrgencyScore(email) >= URGENCY_THRESHOLDS.URGENT,
      );

      const important = emails.filter((email) => {
        const score = getUrgencyScore(email);
        return (
          score >= URGENCY_THRESHOLDS.IMPORTANT &&
          score < URGENCY_THRESHOLDS.URGENT
        );
      });

      const canWait = emails.filter((email) => {
        const score = getUrgencyScore(email);
        return (
          score >= URGENCY_THRESHOLDS.CAN_WAIT &&
          score < URGENCY_THRESHOLDS.IMPORTANT
        );
      });

      const unsubscribe = emails.filter((email) => !!email.unsubscribeLink);

      const unimportant = emails.filter(
        (email) =>
          getUrgencyScore(email) < URGENCY_THRESHOLDS.CAN_WAIT &&
          !email.unsubscribeLink,
      );

      return { urgent, important, canWait, unsubscribe, unimportant };
    };

    const categories = categorizeEmails();

    switch (currentFilter) {
      case "urgent":
        return categories.urgent;
      case "important":
        return categories.important;
      case "canWait":
        return categories.canWait;
      case "unsubscribe":
        return categories.unsubscribe;
      case "unimportant":
        return categories.unimportant;
      default:
        return emails;
    }
  }, [emails, currentFilter]);
};

export const useNavBarMiddle = ({
  emails,
  setCurrentEmail,
  currentEmail,
  currentFilter,
  setMobileOpen,
  setEmails,
}: NavBarMiddleProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const filteredEmails = useEmailFiltering(emails, currentFilter);

  const handleUnsubscribe = (unsubscribeLink: string) => {
    window.open(unsubscribeLink, "_blank");
  };

  const handleEmailClick = (email: Email) => {
    setCurrentEmail(email);
  };

  const handleActionUpdate = async (emailId: string, action: string) => {
    try {
      const updatedEmails = emails.map((email) => {
        if (email._id === emailId) {
          return { ...email, userActionTaken: action };
        }
        return email;
      });

      setEmails(updatedEmails);

      if (currentEmail && currentEmail._id === emailId) {
        const updatedCurrentEmail = {
          ...currentEmail,
          userActionTaken: action,
        };
        setCurrentEmail(updatedCurrentEmail);
      }

      await handleActionUpdateAPI(emailId, action);
    } catch (error) {
      const originalEmails = emails.map((email) => {
        if (email._id === emailId) {
          const originalEmail = emails.find((e) => e._id === emailId);
          return originalEmail || email;
        }
        return email;
      });

      setEmails(originalEmails);

      if (currentEmail && currentEmail._id === emailId) {
        const originalCurrentEmail = emails.find((e) => e._id === emailId);
        setCurrentEmail(originalCurrentEmail || null);
      }

      console.error("Failed to update email action:", error);
    }
  };

  return {
    isMobile,
    filteredEmails,
    handleUnsubscribe,
    handleEmailClick,
    handleActionUpdate,
    formatDate,
    formatTimestamp,
    getCategoryDisplayName,
    handleActionUpdateAPI,
    setMobileOpen,
  };
};

export const useEmailItem = (
  email: Email,
  onActionUpdate?: (emailId: string, action: string) => void,
) => {
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [isUpdatingAction, setIsUpdatingAction] = useState(false);
  const [currentAction, setCurrentAction] = useState(
    email.userActionTaken || "No Action",
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success",
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const newAction = email.userActionTaken || "No Action";
    setCurrentAction(newAction);
  }, [email.userActionTaken]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowActionDropdown(false);
      }
    };

    if (showActionDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showActionDropdown]);

  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 160,
      });
    }

    setShowActionDropdown(!showActionDropdown);
  };

  const handleActionClick = async (action: string) => {
    setShowActionDropdown(false);

    if (action === currentAction) {
      return;
    }

    setIsUpdatingAction(true);

    try {
      if (onActionUpdate) {
        await onActionUpdate(email._id, action);
      }

      setFeedbackMessage(`Action updated to "${action}"`);
      setFeedbackType("success");
      setShowFeedback(true);
    } catch (error) {
      setFeedbackMessage(
        `Failed to update: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setFeedbackType("error");
      setShowFeedback(true);
    } finally {
      setIsUpdatingAction(false);
    }
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  return {
    showActionDropdown,
    isUpdatingAction,
    currentAction,
    showFeedback,
    feedbackMessage,
    feedbackType,
    buttonRef,
    dropdownPosition,
    handleActionMenuClick,
    handleActionClick,
    handleFeedbackClose,
    setShowActionDropdown,
  };
};

const NavBarMiddle: React.FC<NavBarMiddleProps> = (props) => {
  const {
    filteredEmails,
    handleUnsubscribe,
    handleEmailClick,
    handleActionUpdate,
    formatDate,
    formatTimestamp,
    isMobile, // Add isMobile to destructuring
  } = useNavBarMiddle(props);

  const { currentEmail, currentFilter } = props; // Add currentFilter to destructuring

  if (filteredEmails.length === 0) {
    return (
      <EmptyState onToggleShowArchived={() => {}} hasArchivedEmails={false} />
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "#F3F4F6",
      }}
    >
      <EmailList
        emails={filteredEmails}
        currentEmail={currentEmail}
        onEmailClick={handleEmailClick}
        onUnsubscribe={handleUnsubscribe}
        onActionUpdate={handleActionUpdate}
        formatDate={formatDate}
        formatTimestamp={formatTimestamp}
        isMobile={isMobile}
        currentFilter={currentFilter}
      />
    </Box>
  );
};

export default NavBarMiddle;
