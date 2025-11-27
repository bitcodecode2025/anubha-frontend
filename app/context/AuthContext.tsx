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
  role?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------- LOGIN ----------------
  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    toast.success("Logged in");
  };

  // ---------------- LOGOUT ----------------
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("user");
    setUser(null);
    toast("Logged out");
  }, []);

  // ---------------- FETCH USER FROM /me ----------------
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; user: User }>("/auth/me");
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // Fall back to localStorage if API fails
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
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
        console.error("Auth load error:", err);
      }
      setLoading(false);
    };

    loadAuth();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
