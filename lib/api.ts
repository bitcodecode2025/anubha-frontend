import axios from "axios";

// Default to localhost:4001 if NEXT_PUBLIC_API_URL is not set (development)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "http://localhost:4001/api"
    : "http://localhost:4001/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout (increased for OTP requests that involve external APIs)
  headers: {
    "Content-Type": "application/json",
  },
});

// Log API base URL in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  console.log("[API] Base URL:", API_BASE_URL);
}

// Track retry attempts to prevent infinite loops
const retryAttempts = new Map<string, number>();
const MAX_RETRY_ATTEMPTS = 1; // Max 1 retry per request

// Request interceptor - authentication handled via httpOnly cookies
// No need to add Authorization header from localStorage (XSS risk)
// Cookies are automatically sent with requests via withCredentials: true
api.interceptors.request.use(
  (config) => {
    // Authentication is handled via httpOnly cookies
    // Tokens are NOT stored in localStorage to prevent XSS attacks

    // If FormData is being sent, remove Content-Type header
    // axios will automatically set it with the correct boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors gracefully with automatic token refresh
api.interceptors.response.use(
  (response) => {
    // Clear retry attempt on success
    const requestKey = response.config?.url || "";
    retryAttempts.delete(requestKey);
    return response;
  },
  async (error: any) => {
    const config = error.config as any;

    // Type guard to check if error is an AxiosError-like object
    const axiosError = error as {
      response?: { status: number; data: any };
      request?: any;
      message?: string;
      config?: any;
    };

    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      const url = axiosError.config?.url || "";

      // Handle 401 Unauthorized - user is not authenticated
      if (status === 401) {
        // Clear user data on 401
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          // Dispatch logout event for AuthContext
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }

        // For auth endpoints or if refresh not applicable, just reject
        return Promise.reject(error);
      }

      // Don't log validation errors or expected errors
      // Suppress errors for auth endpoints with 400 status (likely validation errors)
      if (status === 400) {
        // Check if it's an auth endpoint - these are often validation errors
        if (url.includes("/auth/") && (data?.errors || data?.message)) {
          // Validation error on auth endpoint - expected, don't log to console
          return Promise.reject(error);
        }
        if (data?.errors) {
          // Validation error - expected, don't log
          return Promise.reject(error);
        }
      }

      // Log unexpected errors
      if (status >= 500) {
        console.error("Server error:", error);
      }
    } else if (axiosError.request) {
      // Request was made but no response received
      // Don't log timeout errors as they're handled by individual functions
      if (
        axiosError.message &&
        !axiosError.message.includes("Network Error") &&
        !axiosError.message.includes("timeout")
      ) {
        console.error("Network error:", axiosError.message);
      }
    } else {
      // Something else happened
      console.error("Error:", axiosError.message);
    }

    return Promise.reject(error);
  }
);

export default api;
