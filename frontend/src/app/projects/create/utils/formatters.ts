export { formatFileSize } from './file-helpers';

/**
 * Formats a date string into a human-readable date.
 * Handles special cases (TBD, Not specified, empty) and invalid dates gracefully.
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions (optional)
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
): string => {
  if (!dateString || dateString === 'TBD' || dateString === 'Not specified') {
    return dateString;
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}; 