"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Check if token is missing
  const isTokenMissing = !token || token.trim() === "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!newPassword.trim()) {
      setErrors({ newPassword: "New password is required" });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({
        newPassword: "Password must be at least 6 characters long",
      });
      return;
    }

    if (!confirmPassword.trim()) {
      setErrors({ confirmPassword: "Please confirm your password" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (!token) {
      setErrors({ general: "Invalid reset token" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast.success("Password reset successfully! Redirecting to login...");

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      const message = error.message || "Failed to reset password";
      setErrors({ general: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-emerald-50/40 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40">
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 text-center mb-2">
            Reset Password
          </h1>
          <p className="text-slate-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
            Enter your new password below
          </p>

          {isTokenMissing ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-semibold text-sm mb-1">
                    Invalid or expired reset link
                  </p>
                  <p className="text-red-600 text-xs">
                    The password reset link is invalid or has expired. Please
                    request a new one.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="block w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold text-center hover:bg-emerald-800 transition shadow-lg"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{errors.general}</p>
                </div>
              )}

              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <motion.input
                    animate={errors.newPassword ? { x: [-8, 8, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
                      errors.newPassword
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
                <p className="text-slate-500 text-xs mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <motion.input
                    animate={
                      errors.confirmPassword ? { x: [-8, 8, -6, 6, 0] } : {}
                    }
                    transition={{ duration: 0.3 }}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
                      errors.confirmPassword
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </motion.button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-emerald-700 hover:underline font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
