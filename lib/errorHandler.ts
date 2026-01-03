/**
 * Convert backend error messages to user-friendly messages
 * Removes technical details and provides clear, actionable feedback
 */
export function getUserFriendlyError(error: any): string {
  // If no error object, return generic message
  if (!error) {
    return "Something went wrong. Please reload the page.";
  }

  // Network errors - backend not reachable
  if (!error.response) {
    return "Something went wrong. Please reload the page.";
  }

  // Get backend message
  const backendMessage = error.response?.data?.message || error.message || "";

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
  if (
    backendMessage.toLowerCase().includes("account not found") ||
    backendMessage.toLowerCase().includes("register")
  ) {
    return "No account found. Please sign up first.";
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
