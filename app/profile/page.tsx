"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { User, Phone, Shield, LogOut, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-emerald-50/40">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.replace(/(\d{5})(\d{0,5})/, "$1 $2").trim();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-emerald-50/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Profile Card */}
        <div className="p-8 rounded-3xl bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg"
            >
              <User className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">
              Your Profile
            </h1>
            <p className="text-slate-600 text-sm">
              Manage your account information
            </p>
          </div>

          {/* User Information */}
          <div className="space-y-4 mb-6">
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <User className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">Name</p>
                  <p className="text-slate-800 font-semibold">{user.name}</p>
                </div>
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Phone className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Phone Number
                  </p>
                  <p className="text-slate-800 font-semibold">
                    +91 {formatPhone(user.phone)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Role (if available) */}
            {user.role && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Shield className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">Role</p>
                    <p className="text-slate-800 font-semibold capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleLogout}
            disabled={loggingOut}
            className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition flex items-center justify-center gap-2
              ${loggingOut ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                Logout
              </>
            )}
          </motion.button>
        </div>

        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => router.push("/")}
            className="text-slate-600 hover:text-emerald-700 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

