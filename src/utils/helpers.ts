// src/utils/helpers.ts

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

export const getUrgencyColor = (score: number | string) => {
  const numericScore = typeof score === "string" ? parseFloat(score) : score;
  if (numericScore > 70) return "#EE8802";
  if (numericScore > 40) return "#FF5733";
  return "#808080";
};
