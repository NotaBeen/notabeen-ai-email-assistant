// src/utils/helpers.ts

import { getUrgencyColorMain } from "@/constants/urgencyColors";

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};

/**
 * @deprecated Use getUrgencyColorMain from @/constants/urgencyColors instead
 * This function is kept for backwards compatibility but will be removed in a future version
 */
export const getUrgencyColor = (score: number | string) => {
  // Import from centralized location for consistency
  return getUrgencyColorMain(score);
};
