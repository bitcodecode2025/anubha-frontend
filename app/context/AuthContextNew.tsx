"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession, signOut } from "next-auth/react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  phone?: string;
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
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loading = status === "loading";

  // Sync NextAuth session with local user state
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const sessionUser = session.user as any;
      setUser({
        id: sessionUser.id,
        name: sessionUser.name || "",
        email: sessionUser.email || "",
        phone: sessionUser.phone || "",
        role: sessionUser.role || "USER",
      });
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status]);

  // ---------------- LOGIN ----------------
  const login = (user: User) => {
    setUser(user);
    toast.success("Logged in");
  };

  // ---------------- LOGOUT ----------------
  const logout = useCallback(async () => {
    setLoggingOut(true);

    // Small delay for animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Call backend logout
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Backend logout error:", err);
    }

    try {
      // Sign out from NextAuth
      await signOut({ redirect: false });
    } catch (err) {
      console.error("NextAuth signOut error:", err);
    }

    // Clear all auth-related localStorage
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

  return (
    <AuthContext.Provider value={{ user, loading, loggingOut, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
