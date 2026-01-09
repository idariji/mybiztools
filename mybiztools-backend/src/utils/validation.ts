/**
 * Validation utility functions for the backend
 */

/**
 * Safely parse an integer from a string with NaN check
 * @param value - The string value to parse
 * @param defaultValue - The default value to return if parsing fails
 * @returns The parsed integer or the default value
 */
export function safeParseInt(value: string | undefined | null, defaultValue: number): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse a float from a string with NaN check
 * @param value - The string value to parse
 * @param defaultValue - The default value to return if parsing fails
 * @returns The parsed float or the default value
 */
export function safeParseFloat(value: string | undefined | null, defaultValue: number): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate pagination parameters
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Validated pagination parameters
 */
export function validatePagination(
  page: string | undefined | null,
  limit: string | undefined | null,
  maxLimit: number = 100
): { page: number; limit: number } {
  const parsedPage = safeParseInt(page, 1);
  const parsedLimit = safeParseInt(limit, 20);

  return {
    page: Math.max(1, parsedPage),
    limit: Math.min(Math.max(1, parsedLimit), maxLimit),
  };
}
