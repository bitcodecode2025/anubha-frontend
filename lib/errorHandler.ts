/**
 * Convert backend error messages to user-friendly messages
 * Removes technical details and provides clear, actionable feedback
 */
export function getUserFriendlyError(error: any): string {
  // If no error object, return generic message
  if (!error) {
    return "Something went wrong. Please reload the page.";
  }

  // Network errors - backend not reachable (no response means connection failed)
  if (!error.response) {
    return "Something went wrong. Please reload the page.";
  }

  // Get status code and backend message
  const statusCode = error.response?.status;
  const backendMessage = error.response?.data?.message || error.message || "";

  // Handle 404 - Account not found
  if (statusCode === 404) {
    if (
      backendMessage.toLowerCase().includes("account not found") ||
      backendMessage.toLowerCase().includes("sign up") ||
      backendMessage.toLowerCase().includes("register")
    ) {
      return backendMessage || "Account not found. Please sign up.";
    }
    return "Account not found. Please sign up.";
  }

  // OTP-related errors
  if (backendMessage.toLowerCase().includes("invalid otp")) {
    return "Invalid OTP. Please check and try again.";
  }
  if (backendMessage.toLowerCase().includes("otp expired")) {
    return "OTP has expired. Please request a new one.";
  }
  if (backendMessage.toLowerCase().includes("otp not found")) {
    return "OTP not found. Please request a new one.";
  }

  // Authentication errors
  if (backendMessage.toLowerCase().includes("invalid credentials")) {
    return "Invalid email/phone or password. Please try again.";
  }

  // OTP login specific errors
  if (
    backendMessage
      .toLowerCase()
      .includes("phone number and email do not belong to the same account")
  ) {
    return "The phone number and email do not belong to the same account.";
  }
  if (
    backendMessage
      .toLowerCase()
      .includes("either the phone number or email is incorrect")
  ) {
    return "Either the phone number or email is incorrect. Please check and try again.";
  }
  if (
    backendMessage.toLowerCase().includes("account not found") ||
    backendMessage.toLowerCase().includes("sign up to continue")
  ) {
    return backendMessage || "Account not found. Please sign up.";
  }
  if (
    backendMessage.toLowerCase().includes("already exists") ||
    backendMessage.toLowerCase().includes("already registered")
  ) {
    return "An account with this email or phone already exists. Please login instead.";
  }

  // Password reset errors
  if (
    backendMessage.toLowerCase().includes("expired") &&
    backendMessage.toLowerCase().includes("token")
  ) {
    return "Reset link is invalid or expired. Please request a new one.";
  }
  if (
    backendMessage.toLowerCase().includes("invalid") &&
    backendMessage.toLowerCase().includes("token")
  ) {
    return "Reset link is invalid. Please request a new one.";
  }

  // Rate limiting
  if (
    backendMessage.toLowerCase().includes("wait") ||
    backendMessage.toLowerCase().includes("rate limit")
  ) {
    return backendMessage; // Keep rate limit messages as-is
  }

  // Generic fallback - use backend message if it's user-friendly, otherwise generic
  if (
    backendMessage &&
    backendMessage.length < 100 &&
    !backendMessage.includes("status")
  ) {
    return backendMessage;
  }

  return "Something went wrong. Please try again.";
}
