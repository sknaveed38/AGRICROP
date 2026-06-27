/**
 * Validate an email address.
 *
 * @param {string} email - The email string to validate.
 * @returns {string|null} Error message, or null if valid.
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  // RFC-5322 simplified pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate a password against minimum security requirements.
 *
 * Rules:
 * - At least 6 characters
 * - Contains at least one letter
 * - Contains at least one number
 *
 * @param {string} password - The password string to validate.
 * @returns {string|null} Error message, or null if valid.
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (!/[A-Za-z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

/**
 * Validate that a field value is not empty.
 *
 * @param {string} value     - The value to check.
 * @param {string} fieldName - Human-readable field name for the error message.
 * @returns {string|null} Error message, or null if the value is non-empty.
 */
export const validateField = (value, fieldName) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};
