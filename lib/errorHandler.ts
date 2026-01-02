/**
 * Frontend error handling utilities
 * Provides consistent error handling and user-friendly error messages
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  status?: number;
}

/**
 * Extract error message from API error response
 */
export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const err = error as {
      response?: { data?: { message?: string; error?: string } };
      message?: string;
    };

    // Check for API error response
    if (err.response?.data) {
      return (
        err.response.data.message ||
        err.response.data.error ||
        "An error occurred. Please try again."
      );
    }

    // Check for error message
    if (err.message) {
      return err.message;
    }
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Extract full error details for logging (dev only)
 */
export function extractErrorDetails(error: unknown): ApiError {
  if (error && typeof error === "object") {
    const err = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          error?: string;
          code?: string;
          details?: any;
        };
      };
      message?: string;
      code?: string;
    };

    return {
      message:
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unknown error",
      code: err.response?.data?.code || err.code,
      details: err.response?.data?.details,
      status: err.response?.status,
    };
  }

  return {
    message: "Unknown error",
  };
}

/**
 * Check if error is a network error (retryable)
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const err = error as {
      message?: string;
      code?: string;
      response?: { status?: number };
      request?: any;
    };

    // Network errors typically have request but no response
    if (err.request && !err.response) {
      return true;
    }

    // Check for common network error messages
    if (
      err.message?.includes("Network Error") ||
      err.message?.includes("timeout")
    ) {
      return true;
    }

    // Check for specific error codes
    if (err.code === "ECONNABORTED" || err.code === "ENOTFOUND") {
      return true;
    }
  }

  return false;
}

/**
 * Check if error is a client error (4xx - not retryable)
 */
export function isClientError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const err = error as { response?: { status?: number } };
    const status = err.response?.status;
    return status !== undefined && status >= 400 && status < 500;
  }

  return false;
}

/**
 * Check if error is a server error (5xx - retryable)
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const err = error as { response?: { status?: number } };
    const status = err.response?.status;
    return status !== undefined && status >= 500;
  }

  return false;
}

/**
 * Log error in development only
 */
export function logError(error: unknown, context: string): void {
  // Error logging removed for production
}
