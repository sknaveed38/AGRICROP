import { RISK_LEVELS } from './constants';

/**
 * Format an ISO date string into a human-readable locale string.
 *
 * @param {string} dateString - ISO-8601 date string.
 * @returns {string} Formatted date, e.g. "23 Jun 2026, 05:32 PM".
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

/**
 * Format a numeric value as a percentage string.
 *
 * @param {number} value - Raw numeric value (0–100 or 0–1, caller decides).
 * @param {number} [decimals=1] - Number of decimal places.
 * @returns {string} e.g. "85.5%"
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Get the hex colour associated with a risk level.
 *
 * @param {string} riskLevel - One of 'low', 'medium', 'high', 'critical'.
 * @returns {string} Hex colour string.
 */
export const getRiskColor = (riskLevel) => {
  const level = RISK_LEVELS[riskLevel?.toLowerCase()];
  return level ? level.color : RISK_LEVELS.medium.color;
};

/**
 * Get the human-readable label for a risk level.
 *
 * @param {string} riskLevel - One of 'low', 'medium', 'high', 'critical'.
 * @returns {string} Label string, e.g. "High Risk".
 */
export const getRiskLabel = (riskLevel) => {
  const level = RISK_LEVELS[riskLevel?.toLowerCase()];
  return level ? level.label : 'Unknown';
};

/**
 * Truncate a text string, appending "…" if it exceeds `maxLength`.
 *
 * @param {string} text      - Input text.
 * @param {number} maxLength - Maximum allowed characters (default 100).
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
};

/**
 * Convert an ISO date string to a human-friendly relative time.
 *
 * Returns strings like "just now", "5 minutes ago", "2 hours ago",
 * "yesterday", or "3 days ago".
 *
 * @param {string} dateString - ISO-8601 date string.
 * @returns {string}
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '—';

  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return '1 week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  return formatDate(dateString);
};
