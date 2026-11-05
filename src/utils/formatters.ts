export const formatRuntime = (minutes?: number | null): string => {
  if (!minutes || minutes <= 0) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

export const formatYear = (dateString?: string | null): string => {
  if (!dateString) return '';
  const parsed = new Date(dateString);
  if (isNaN(parsed.getFullYear())) {
    return dateString.substring(0, 4);
  }
  return parsed.getFullYear().toString();
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'TBA';
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRating = (voteAverage?: number | null): string => {
  if (voteAverage === undefined || voteAverage === null || voteAverage === 0) {
    return 'NR';
  }
  return voteAverage.toFixed(1);
};

export const formatVoteCount = (count?: number | null): string => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

export const formatCurrency = (amount?: number | null): string => {
  if (!amount || amount === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

