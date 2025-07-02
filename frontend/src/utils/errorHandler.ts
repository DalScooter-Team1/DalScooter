/**
 * Utility for handling authentication errors with user-friendly messages
 */

// Define types for error handling
interface ErrorMapping {
  [key: string]: string;
}

// Map of common Cognito error messages to user-friendly messages
const cognitoErrorMap: ErrorMapping = {
  'Incorrect username or password.': 'The email or password you entered is incorrect. Please try again.',
  'User does not exist.': 'We couldn\'t find an account with that email address. Please check and try again.',
  'Password attempts exceeded': 'Too many failed login attempts. Please try again later or reset your password.',
  'User is not confirmed.': 'Your account is not verified. Please check your email for a verification link.',
  'User is disabled.': 'Your account has been disabled. Please contact support for assistance.',
  'SECURITY_QUESTION': 'The security question answer is incorrect. Please try again.',
  'CAESAR_CIPHER': 'The cipher solution is incorrect. Please try again.',
  'Challenge failed': 'Authentication verification failed. Please try again.',
};

/**
 * Formats authentication errors into user-friendly messages
 * @param errorMessage The raw error message from Cognito or other auth provider
 * @param authStage Current authentication stage (login, security question, caesar cipher)
 * @returns User-friendly error message
 */
export const formatAuthError = (
  errorMessage: string, 
  authStage: 'login' | 'factor2' | 'factor3' = 'login'
): string => {
  // Check if we have a specific mapping for this error
  for (const [errorPattern, friendlyMessage] of Object.entries(cognitoErrorMap)) {
    if (errorMessage.includes(errorPattern)) {
      return friendlyMessage;
    }
  }

  // If no specific mapping is found, provide stage-specific generic messages
  if (authStage === 'factor2') {
    return 'The security answer you provided is incorrect. Please try again.';
  } else if (authStage === 'factor3') {
    return 'The cipher solution you provided is incorrect. Please try again.';
  }
  
  // Default generic message
  return 'Authentication error. Please try again or contact support if the issue persists.';
};
