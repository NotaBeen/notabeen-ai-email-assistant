/**
 * Centralized urgency color configuration
 *
 * This file provides consistent urgency colors across all components:
 * - Navigation tabs
 * - Email list items
 * - Email detail view
 * - Email content display
 */

export interface UrgencyColorConfig {
  main: string;
  light: string;
  background: string;
}

export const URGENCY_COLORS = {
  urgent: {
    main: "#DC2626",
    light: "rgba(220, 38, 38, 0.1)",
    background: "rgba(220, 38, 38, 0.05)",
  },
  important: {
    main: "#F97316",
    light: "rgba(249, 115, 22, 0.1)",
    background: "rgba(249, 115, 22, 0.05)",
  },
  canWait: {
    main: "#478978",
    light: "rgba(71, 137, 120, 0.1)",
    background: "rgba(71, 137, 120, 0.05)",
  },
  unsubscribe: {
    main: "#3a5683",
    light: "rgba(58, 86, 131, 0.1)",
    background: "#F5F5F5",
  },
  unimportant: {
    main: "#9CA3AF",
    light: "rgba(156, 163, 175, 0.1)",
    background: "#F5F5F5",
  },
} as const;

/**
 * Get urgency color based on score
 * @param score - Urgency score (0-100)
 * @returns Color configuration object with main, light, and background colors
 */
export const getUrgencyColor = (score: number | string): UrgencyColorConfig => {
  const numericScore = typeof score === "string" ? parseFloat(score) : score;

  if (numericScore >= 71) {
    return URGENCY_COLORS.urgent;
  } else if (numericScore >= 41) {
    return URGENCY_COLORS.important;
  } else if (numericScore >= 11) {
    return URGENCY_COLORS.canWait;
  } else {
    return URGENCY_COLORS.unimportant;
  }
};

/**
 * Get urgency color main value only (for backwards compatibility)
 * @param score - Urgency score (0-100)
 * @returns Main color hex string
 */
export const getUrgencyColorMain = (score: number | string): string => {
  return getUrgencyColor(score).main;
};

/**
 * Get category colors for navigation tabs
 */
export const CATEGORY_STYLES: Record<
  string,
  { backgroundColor: string; color: string }
> = {
  urgent: {
    backgroundColor: URGENCY_COLORS.urgent.background,
    color: URGENCY_COLORS.urgent.main,
  },
  important: {
    backgroundColor: URGENCY_COLORS.important.background,
    color: URGENCY_COLORS.important.main,
  },
  canWait: {
    backgroundColor: URGENCY_COLORS.canWait.background,
    color: URGENCY_COLORS.canWait.main,
  },
  unsubscribe: {
    backgroundColor: URGENCY_COLORS.unsubscribe.background,
    color: URGENCY_COLORS.unsubscribe.main,
  },
  unimportant: {
    backgroundColor: URGENCY_COLORS.unimportant.background,
    color: URGENCY_COLORS.unimportant.main,
  },
  archived: {
    backgroundColor: "#F5F5F5",
    color: "#6B7280",
  },
  all: {
    backgroundColor: "#F5F5F5",
    color: "#1F2937",
  },
  default: {
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
  },
};
