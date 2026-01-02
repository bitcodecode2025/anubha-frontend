"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import {
  loginInitiate,
  loginComplete,
  loginWithPassword,
  forgotPassword,
} from "@/lib/auth";
import OtpInput from "@/components/auth/OtpInput";

type LoginMode = "PASSWORD" | "OTP";
type LoginStep = "DETAILS" | "OTP" | "FORGOT_PASSWORD";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<LoginMode>("PASSWORD");
  const [step, setStep] = useState<LoginStep>("DETAILS");

  // Form fields
  const [identifier, setIdentifier] = useState(""); // Email or phone for password login
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
    phone?: string;
    email?: string;
    otp?: string;
    forgotPasswordEmail?: string;
    general?: string;
  }>({});

  // Cooldown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Reset form when mode changes
  useEffect(() => {
    setStep("DETAILS");
    setErrors({});
    setIdentifier("");
    setPassword("");
    setPhone("");
    setEmail("");
    setOtp("");
  }, [mode]);

  const validatePasswordLogin = () => {
    const newErrors: any = {};
    if (!identifier.trim()) {
      newErrors.identifier = "Email or phone is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpLogin = () => {
    const newErrors: any = {};
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phone.length !== 10) {
      newErrors.phone = "Phone must be 10 digits";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordLogin()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = (await loginWithPassword({
        identifier,
        password,
      })) as any;
      login({
        id: response.user.id,
        name: response.user.name,
        phone: response.user.phone,
        email: response.user.email,
        role: response.user.role,
      });
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error: any) {
      const msg =
        error.message || error.response?.data?.message || "Invalid credentials";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInitiate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateOtpLogin()) return;

    setLoading(true);
    setErrors({});

    try {
      await loginInitiate({ phone, email });
      setStep("OTP");
      setResendCooldown(60);
      toast.success("OTP sent to your email and phone");
    } catch (error: any) {
      const msg =
        error.message || error.response?.data?.message || "Failed to send OTP";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrors({ otp: "Please enter a valid OTP" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = (await loginComplete({ phone, email, otp })) as any;
      if (response.userNotFound) {
        setErrors({ general: "No account found. Please Sign Up." });
        toast.error("No account found. Please Sign Up.");
        return;
      }

      login({
        id: response.user.id,
        name: response.user.name,
        phone: response.user.phone,
        email: response.user.email,
        role: response.user.role,
      });

      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error: any) {
      const msg =
        error.message || error.response?.data?.message || "Invalid OTP";
      setErrors({ otp: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!forgotPasswordEmail.trim()) {
      newErrors.forgotPasswordEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      newErrors.forgotPasswordEmail = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await forgotPassword(forgotPasswordEmail);
      toast.success(
        "If an account exists with this email, we've sent a password reset link. Check your email."
      );
      setStep("DETAILS");
      setForgotPasswordEmail("");
    } catch (error: any) {
      const msg =
        error.message ||
        error.response?.data?.message ||
        "Failed to send reset email";
      setErrors({ forgotPasswordEmail: msg });
      toast.error(msg);
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
            Welcome Back
          </h1>
          <p className="text-slate-600 text-center mb-6 text-sm">
            Choose your login method
          </p>

          {/* Mode Selection Buttons */}
          {step === "DETAILS" && (
            <div className="flex gap-2 mb-6 bg-white/50 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMode("PASSWORD")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  mode === "PASSWORD"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setMode("OTP")}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  mode === "OTP"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                OTP
              </button>
            </div>
          )}

          {/* Forgot Password Step */}
          {step === "FORGOT_PASSWORD" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm transition ${
                      errors.forgotPasswordEmail
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.forgotPasswordEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.forgotPasswordEmail}
                  </p>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  setStep("DETAILS");
                  setForgotPasswordEmail("");
                  setErrors({});
                }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 text-center"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Password Login Form */}
          {step === "DETAILS" && mode === "PASSWORD" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="email@example.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm transition ${
                      errors.identifier
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.identifier}
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/80 border outline-none shadow-sm transition ${
                      errors.password
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep("FORGOT_PASSWORD")}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {errors.general && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                  {errors.general}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>

              <div className="text-center mt-4">
                <Link
                  href="/register"
                  className="text-emerald-700 hover:underline text-sm"
                >
                  Don't have an account? Sign Up
                </Link>
              </div>
            </form>
          )}

          {/* OTP Login Form - Details */}
          {step === "DETAILS" && mode === "OTP" && (
            <form onSubmit={handleOtpInitiate} className="space-y-4">
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm transition ${
                      errors.phone
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm transition ${
                      errors.email
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {errors.general && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                  {errors.general}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition disabled:opacity-70"
              >
                {loading ? "Sending..." : "Get OTP"}
              </motion.button>

              <div className="text-center mt-4">
                <Link
                  href="/register"
                  className="text-emerald-700 hover:underline text-sm"
                >
                  Don't have an account? Sign Up
                </Link>
              </div>
            </form>
          )}

          {/* OTP Verification Step */}
          {step === "OTP" && (
            <form onSubmit={handleOtpVerify} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">
                  OTP sent to <span className="font-medium">{email}</span> and{" "}
                  <span className="font-medium">+91 {phone}</span>
                </p>
                <div className="flex justify-center">
                  <OtpInput value={otp} onChange={setOtp} />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-2">{errors.otp}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    if (resendCooldown === 0) handleOtpInitiate();
                  }}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm text-emerald-700 hover:underline disabled:text-slate-400"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("DETAILS");
                    setOtp("");
                    setErrors({});
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Change Details
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
