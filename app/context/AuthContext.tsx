"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  loggingOut: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  loggingOut: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // ---------------- LOGIN ----------------
  const login = (user: User) => {
    setUser(user);
    // Store user data in localStorage for UI state persistence
    // Authentication is handled via httpOnly cookies (secure, XSS-resistant)
    localStorage.setItem("user", JSON.stringify(user));
    // Toast notification is handled by the login/register pages
  };

  // ---------------- LOGOUT ----------------
  const logout = useCallback(async () => {
    setLoggingOut(true);

    // Small delay for animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Logout error, silently continue
    }

    // Clear all auth-related localStorage
    // Note: auth_token is not stored in localStorage (uses httpOnly cookies)
    localStorage.removeItem("user");
    localStorage.removeItem("login_otp_expiry");
    localStorage.removeItem("bookingForm");

    setUser(null);

    // Show success toast
    toast.success("Logged out successfully", {
      icon: "👋",
      duration: 2000,
    });

    // Reset logging out state after animation
    setTimeout(() => {
      setLoggingOut(false);
    }, 500);
  }, []);

  // ---------------- FETCH USER FROM /me ----------------
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; user: User }>("/auth/me");
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        // Store user data in localStorage only for UI state (not for auth)
        // Authentication is handled via httpOnly cookies
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        // If API returns success:false, clear user state
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const errorMessage = err?.response?.data?.message || err?.message;
      const errorType = err?.response?.data?.errorType;
      const isDatabaseError = status === 500 && errorType === "database_error";

      // Handle 401 specifically - user is not authenticated
      if (status === 401) {
        setUser(null);
        localStorage.removeItem("user");
      } else if (status === 400) {
        // Handle 400 - Bad request (invalid token, invalid role, etc.)
        // But check if it's actually a database error that was misclassified
        if (
          errorMessage?.includes("database") ||
          errorMessage?.includes("Can't reach")
        ) {
          // Database error misclassified as 400 - treat as server error
          // Keep user logged in using localStorage fallback
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              localStorage.removeItem("user");
            }
          }
        } else {
          // Actual authentication/validation error
          // Clear potentially invalid auth data
          setUser(null);
          localStorage.removeItem("user");
        }
      } else if (status === 500 || isDatabaseError) {
        // Server error (including database errors) - keep user logged in
        // Use stored user data as fallback
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            // Invalid stored user, clear it
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } else {
        // For other errors (404, etc.), try to use stored user as fallback
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            // Invalid stored user, clear it
            localStorage.removeItem("user");
          }
        } else {
          // No stored user, clear auth state
          setUser(null);
        }
      }
    }
  }, []);

  // ---------------- INITIAL APP HYDRATION ----------------
  useEffect(() => {
    const loadAuth = async () => {
      try {
        // First, try to fetch from backend
        await fetchUser();
      } catch (err) {
        // Load error, silently continue
      }
      setLoading(false);
    };

    loadAuth();

    // Listen for logout events from Axios interceptor
    const handleLogout = () => {
      setUser(null);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:logout", handleLogout);
      return () => {
        window.removeEventListener("auth:logout", handleLogout);
      };
    }
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loggingOut,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
