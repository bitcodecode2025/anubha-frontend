"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import {
  sendLoginOtp,
  verifyLoginOtp,
  sendLinkPhoneEmailOtp,
  verifyLinkPhoneEmailOtp,
} from "@/lib/auth";
import OtpInput from "@/components/auth/OtpInput";

type LoginMethod = "password" | "otp";
type ViewMode = "login" | "forgot-password";
type LinkPhoneState = "none" | "choice" | "link-existing" | "create-new";
type OtpLoginStep =
  | "ENTER_PHONE"
  | "VERIFY_OTP"
  | "PHONE_VERIFIED_NO_ACCOUNT"
  | "LINK_EXISTING_ACCOUNT";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [method, setMethod] = useState<LoginMethod>("password");
  const [viewMode, setViewMode] = useState<ViewMode>("login");

  // Password login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // OTP login state - Step-based flow
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoginStep, setOtpLoginStep] = useState<OtpLoginStep>("ENTER_PHONE");
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Link phone state (for backward compatibility, but now controlled by otpLoginStep)
  const [linkPhoneState, setLinkPhoneState] = useState<LinkPhoneState>("none");
  const [linkEmail, setLinkEmail] = useState("");
  const [linkEmailOtp, setLinkEmailOtp] = useState("");
  const [linkEmailOtpSent, setLinkEmailOtpSent] = useState(false);
  const [linkEmailOtpLoading, setLinkEmailOtpLoading] = useState(false);
  const [sendLinkEmailOtpLoading, setSendLinkEmailOtpLoading] = useState(false);
  const [linkEmailResendCooldown, setLinkEmailResendCooldown] = useState(0);

  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
    phone?: string;
    otp?: string;
    forgotEmail?: string;
    linkEmail?: string;
    linkEmailOtp?: string;
  }>({});

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

  // Password login handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!identifier.trim()) {
      setErrors({ identifier: "Email is required" });
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await api.post<{
        success: boolean;
        user: {
          id: string;
          name: string;
          phone?: string;
          email?: string;
          role?: string;
        };
      }>("/auth/login", {
        identifier,
        password,
      });

      if (res.data?.success && res.data?.user) {
        login({
          id: res.data.user.id,
          name: res.data.user.name,
          phone: res.data.user.phone || "",
          email: (res.data.user as any).email,
          role: res.data.user.role as any,
        });
        toast.success("Logged in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to login";
      const statusCode = error.response?.status;

      toast.error(errorMessage);

      // Show error in appropriate field based on status code
      if (statusCode === 404) {
        // Account not found - show in identifier field
        setErrors({ identifier: errorMessage });
      } else {
        // Invalid credentials (401) or other errors - show in password field
        setErrors({ password: errorMessage });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // OTP login handlers
  const handleSendOtp = async () => {
    setErrors({});

    if (!phone.trim()) {
      setErrors({ phone: "Phone number is required" });
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setErrors({ phone: "Phone must be 10 digits" });
      return;
    }

    try {
      setSendOtpLoading(true);
      await sendLoginOtp({ phone: phoneDigits });
      setOtpLoginStep("VERIFY_OTP"); // Move to OTP verification step
      setResendCooldown(60); // Start 60 second cooldown
      toast.success("OTP sent to your phone!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to send OTP";
      toast.error(errorMessage);
      setErrors({ phone: errorMessage });

      // If rate limited, extract cooldown time
      if (error.response?.status === 429) {
        const match = errorMessage.match(/(\d+)\s+seconds/);
        if (match) {
          setResendCooldown(parseInt(match[1]));
        }
      }
    } finally {
      setSendOtpLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await handleSendOtp();
  };

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    if (otp.length !== 4) {
      setErrors({ otp: "OTP must be 4 digits" });
      return;
    }

    try {
      setOtpLoading(true);
      const phoneDigits = phone.replace(/\D/g, "");
      const response = await verifyLoginOtp({ phone: phoneDigits, otp });

      // Check if user not found (needs to link phone or create account)
      const responseData = response as any;
      if (responseData.success && responseData.userNotFound) {
        // Immediately transition away from VERIFY_OTP step
        setOtpLoginStep("PHONE_VERIFIED_NO_ACCOUNT");
        setLinkPhoneState("choice");
        setOtp(""); // Clear OTP
        setOtpLoading(false);
        return;
      }

      if (responseData.success && responseData.user) {
        login({
          id: responseData.user.id,
          name: responseData.user.name,
          phone: responseData.user.phone || "",
          email: responseData.user.email,
          role: responseData.user.role as any,
        });
        toast.success("Logged in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Invalid OTP";
      toast.error(errorMessage);
      setErrors({ otp: errorMessage });
    } finally {
      setOtpLoading(false);
    }
  };

  const resetOtpFlow = () => {
    setOtpLoginStep("ENTER_PHONE"); // Reset to initial step
    setOtp("");
    setPhone("");
    setErrors({});
    setResendCooldown(0);
    setLinkPhoneState("none");
    setLinkEmail("");
    setLinkEmailOtp("");
    setLinkEmailOtpSent(false);
    setLinkEmailResendCooldown(0);
  };

  // Handle linking phone to existing account
  const handleSendLinkEmailOtp = async () => {
    setErrors({});

    if (!linkEmail.trim()) {
      setErrors({ linkEmail: "Email is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(linkEmail.trim())) {
      setErrors({ linkEmail: "Invalid email format" });
      return;
    }

    try {
      setSendLinkEmailOtpLoading(true);
      const phoneDigits = phone.replace(/\D/g, "");
      await sendLinkPhoneEmailOtp({
        email: linkEmail.trim(),
        phone: phoneDigits,
      });
      setLinkEmailOtpSent(true);
      setLinkEmailResendCooldown(60);
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send verification code";
      toast.error(errorMessage);
      setErrors({ linkEmail: errorMessage });
    } finally {
      setSendLinkEmailOtpLoading(false);
    }
  };

  const handleVerifyLinkEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!linkEmailOtp.trim()) {
      setErrors({ linkEmailOtp: "OTP is required" });
      return;
    }

    if (linkEmailOtp.length !== 4) {
      setErrors({ linkEmailOtp: "OTP must be 4 digits" });
      return;
    }

    try {
      setLinkEmailOtpLoading(true);
      const phoneDigits = phone.replace(/\D/g, "");
      const response = (await verifyLinkPhoneEmailOtp({
        email: linkEmail.trim(),
        phone: phoneDigits,
        otp: linkEmailOtp,
      })) as any;

      if (response.success && response.user) {
        login({
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone || "",
          email: response.user.email || linkEmail.trim(),
          role: response.user.role as any,
        });
        toast.success("Phone number linked successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invalid verification code";
      toast.error(errorMessage);
      setErrors({ linkEmailOtp: errorMessage });
    } finally {
      setLinkEmailOtpLoading(false);
    }
  };

  const handleResendLinkEmailOtp = async () => {
    if (linkEmailResendCooldown > 0) return;

    try {
      setSendLinkEmailOtpLoading(true);
      const phoneDigits = phone.replace(/\D/g, "");
      await sendLinkPhoneEmailOtp({
        email: linkEmail.trim(),
        phone: phoneDigits,
      });
      setLinkEmailResendCooldown(60);
      toast.success("Verification code resent!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend verification code";
      toast.error(errorMessage);
    } finally {
      setSendLinkEmailOtpLoading(false);
    }
  };

  // Resend cooldown timer for link email OTP
  useEffect(() => {
    if (linkEmailResendCooldown > 0) {
      const timer = setTimeout(() => {
        setLinkEmailResendCooldown(linkEmailResendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [linkEmailResendCooldown]);

  // Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setForgotPasswordMessage("");

    if (!forgotEmail.trim()) {
      setErrors({ forgotEmail: "Email is required" });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail.trim())) {
      setErrors({ forgotEmail: "Invalid email format" });
      return;
    }

    try {
      setForgotPasswordLoading(true);
      const response = await api.post<{
        success: boolean;
        message: string;
      }>("/auth/forgot-password", {
        email: forgotEmail.trim(),
      });

      if (response.data?.success) {
        // Always show the same message regardless of email validity
        setForgotPasswordMessage(
          "If an account exists with this email, we've sent a password reset link. Check your email"
        );
        setForgotEmail(""); // Clear email field
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to process request";

      // Show error only for validation errors (400), not for other errors
      if (error.response?.status === 400) {
        setErrors({ forgotEmail: errorMessage });
      } else {
        // For other errors, still show the generic message
        setForgotPasswordMessage(
          "If an account exists with this email, we've sent a password reset link. Check your email"
        );
      }
    } finally {
      setForgotPasswordLoading(false);
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
          {viewMode === "login" ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 text-center mb-2">
                Welcome Back
              </h1>
              <p className="text-slate-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
                Login to continue to Anubha Nutrition Clinic
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 text-center mb-2">
                Forgot Password
              </h1>
              <p className="text-slate-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
                Enter your registered email to reset your password
              </p>
            </>
          )}

          {/* Forgot Password Form */}
          {viewMode === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Enter your Registered Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <motion.input
                    animate={errors.forgotEmail ? { x: [-8, 8, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    type="email"
                    placeholder="email@example.com"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, forgotEmail: "" }));
                      setForgotPasswordMessage("");
                    }}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
                      errors.forgotEmail
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                    autoFocus
                  />
                </div>
                {errors.forgotEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.forgotEmail}
                  </p>
                )}
                {forgotPasswordMessage && (
                  <p className="text-emerald-700 text-xs mt-2 text-center bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    {forgotPasswordMessage}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => {
                    setViewMode("login");
                    setForgotEmail("");
                    setForgotPasswordMessage("");
                    setErrors({});
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-slate-300 transition"
                >
                  Back to Login
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.03 }}
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className={`flex-1 bg-emerald-700 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:bg-emerald-800 transition ${
                    forgotPasswordLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {forgotPasswordLoading ? "Processing..." : "Continue"}
                </motion.button>
              </div>
            </form>
          )}

          {/* Login Forms */}
          {viewMode === "login" && (
            <>
              {/* Method Toggle */}
              <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-1 bg-emerald-50 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("password");
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition ${
                    method === "password"
                      ? "bg-emerald-700 text-white shadow-md"
                      : "text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <span className="hidden sm:inline">Email/Password</span>
                  <span className="sm:hidden">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod("otp");
                    resetOtpFlow();
                  }}
                  className={`flex-1 py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition ${
                    method === "otp"
                      ? "bg-emerald-700 text-white shadow-md"
                      : "text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <span className="hidden sm:inline">Phone/OTP</span>
                  <span className="sm:hidden">OTP</span>
                </button>
              </div>

              {/* Password Login Form */}
              {method === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="text-slate-700 font-medium text-sm block mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <motion.input
                        animate={
                          errors.identifier ? { x: [-8, 8, -6, 6, 0] } : {}
                        }
                        transition={{ duration: 0.3 }}
                        type="email"
                        placeholder="email@example.com"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setErrors((prev) => ({ ...prev, identifier: "" }));
                        }}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
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
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <motion.input
                        animate={
                          errors.password ? { x: [-8, 8, -6, 6, 0] } : {}
                        }
                        transition={{ duration: 0.3 }}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
                          errors.password
                            ? "border-red-400"
                            : "border-emerald-200 focus:border-emerald-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode("forgot-password");
                        setErrors({});
                      }}
                      className="text-sm text-emerald-700 hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.03 }}
                    type="submit"
                    disabled={passwordLoading}
                    className={`w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition ${
                      passwordLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {passwordLoading ? "Logging in..." : "Login"}
                  </motion.button>
                </form>
              )}

              {/* OTP Login Form */}
              {method === "otp" && (
                <div className="space-y-4">
                  {/* Step 1: Enter Phone Number */}
                  {otpLoginStep === "ENTER_PHONE" && (
                    <>
                      <div>
                        <label className="text-slate-700 font-medium text-sm block mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                            +91
                          </div>
                          <motion.input
                            animate={
                              errors.phone ? { x: [-8, 8, -6, 6, 0] } : {}
                            }
                            transition={{ duration: 0.3 }}
                            type="tel"
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => {
                              // Only allow digits, max 10 digits
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);
                              setPhone(value);
                              setErrors((prev) => ({ ...prev, phone: "" }));
                            }}
                            className={`w-full pl-14 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
                              errors.phone
                                ? "border-red-400"
                                : "border-emerald-200 focus:border-emerald-500"
                            }`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={handleSendOtp}
                        disabled={sendOtpLoading}
                        className={`w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition ${
                          sendOtpLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {sendOtpLoading ? "Sending..." : "Send OTP"}
                      </motion.button>
                    </>
                  )}

                  {/* Step 2: Verify OTP - ONLY shown in VERIFY_OTP step */}
                  {otpLoginStep === "VERIFY_OTP" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <label className="text-slate-700 font-medium text-sm block mb-3 text-center">
                          Enter OTP
                        </label>
                        <div className="flex justify-center mb-3">
                          <OtpInput
                            value={otp}
                            onChange={(value) => {
                              setOtp(value);
                              setErrors((prev) => ({ ...prev, otp: "" }));
                            }}
                            error={!!errors.otp}
                            disabled={otpLoading}
                            autoFocus
                          />
                        </div>
                        {errors.otp && (
                          <p className="text-red-500 text-xs mt-2 text-center">
                            {errors.otp}
                          </p>
                        )}
                        <p className="text-slate-500 text-xs mt-3 text-center break-words">
                          OTP sent to{" "}
                          <span className="font-medium">+91 {phone}</span>
                        </p>
                        <div className="text-center mt-2">
                          {resendCooldown > 0 ? (
                            <p className="text-xs text-slate-500">
                              Resend OTP in{" "}
                              <span className="font-semibold text-emerald-700">
                                {resendCooldown}s
                              </span>
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendOtp}
                              disabled={sendOtpLoading}
                              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline transition"
                            >
                              {sendOtpLoading ? "Sending..." : "Resend OTP"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={resetOtpFlow}
                          className="flex-1 bg-slate-200 text-slate-700 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-slate-300 transition"
                        >
                          Change Number
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          whileHover={{ scale: 1.03 }}
                          type="submit"
                          disabled={otpLoading}
                          className={`flex-1 bg-emerald-700 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:bg-emerald-800 transition ${
                            otpLoading ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          {otpLoading ? "Verifying..." : "Verify OTP"}
                        </motion.button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Phone Verified but No Account - Show choice buttons */}
                  {otpLoginStep === "PHONE_VERIFIED_NO_ACCOUNT" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-blue-800 text-center">
                          No account found with phone number{" "}
                          <span className="font-semibold">+91 {phone}</span>
                        </p>
                      </div>

                      <p className="text-slate-700 font-medium text-center mb-4">
                        Do you already have an account?
                      </p>

                      <div className="flex flex-col gap-3">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            setOtpLoginStep("LINK_EXISTING_ACCOUNT");
                            setLinkPhoneState("link-existing");
                          }}
                          className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition"
                        >
                          Yes, I already have an account
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            router.push("/register");
                          }}
                          className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300 transition"
                        >
                          No, create a new account
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => resetOtpFlow()}
                          className="w-full text-slate-600 py-2 text-sm hover:text-slate-800 transition"
                        >
                          Use different phone number
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Link Existing Account - Email OTP flow */}
                  {otpLoginStep === "LINK_EXISTING_ACCOUNT" && (
                    <div className="space-y-4">
                      {!linkEmailOtpSent ? (
                        <>
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <p className="text-sm text-blue-800 text-center">
                              Linking phone{" "}
                              <span className="font-semibold">+91 {phone}</span>{" "}
                              to your account
                            </p>
                          </div>

                          <div>
                            <label className="text-slate-700 font-medium text-sm block mb-2">
                              Enter your registered email
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail className="w-5 h-5" />
                              </div>
                              <motion.input
                                animate={
                                  errors.linkEmail
                                    ? { x: [-8, 8, -6, 6, 0] }
                                    : {}
                                }
                                transition={{ duration: 0.3 }}
                                type="email"
                                placeholder="email@example.com"
                                value={linkEmail}
                                onChange={(e) => {
                                  setLinkEmail(e.target.value);
                                  setErrors((prev) => ({
                                    ...prev,
                                    linkEmail: "",
                                  }));
                                }}
                                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
                                  errors.linkEmail
                                    ? "border-red-400"
                                    : "border-emerald-200 focus:border-emerald-500"
                                }`}
                                autoFocus
                              />
                            </div>
                            {errors.linkEmail && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.linkEmail}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => {
                                setOtpLoginStep("PHONE_VERIFIED_NO_ACCOUNT");
                                setLinkPhoneState("choice");
                              }}
                              className="flex-1 bg-slate-200 text-slate-700 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-slate-300 transition"
                            >
                              Back
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              whileHover={{ scale: 1.03 }}
                              onClick={handleSendLinkEmailOtp}
                              disabled={sendLinkEmailOtpLoading}
                              className={`flex-1 bg-emerald-700 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:bg-emerald-800 transition ${
                                sendLinkEmailOtpLoading
                                  ? "opacity-70 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {sendLinkEmailOtpLoading
                                ? "Sending..."
                                : "Send Verification Code"}
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <form
                          onSubmit={handleVerifyLinkEmailOtp}
                          className="space-y-4"
                        >
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <p className="text-sm text-blue-800 text-center">
                              Verification code sent to{" "}
                              <span className="font-semibold">{linkEmail}</span>
                            </p>
                          </div>

                          <div>
                            <label className="text-slate-700 font-medium text-sm block mb-3 text-center">
                              Enter Verification Code
                            </label>
                            <div className="flex justify-center mb-3">
                              <OtpInput
                                value={linkEmailOtp}
                                onChange={(value) => {
                                  setLinkEmailOtp(value);
                                  setErrors((prev) => ({
                                    ...prev,
                                    linkEmailOtp: "",
                                  }));
                                }}
                                error={!!errors.linkEmailOtp}
                                disabled={linkEmailOtpLoading}
                                autoFocus
                              />
                            </div>
                            {errors.linkEmailOtp && (
                              <p className="text-red-500 text-xs mt-2 text-center">
                                {errors.linkEmailOtp}
                              </p>
                            )}
                            <div className="text-center mt-2">
                              {linkEmailResendCooldown > 0 ? (
                                <p className="text-xs text-slate-500">
                                  Resend code in{" "}
                                  <span className="font-semibold text-emerald-700">
                                    {linkEmailResendCooldown}s
                                  </span>
                                </p>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleResendLinkEmailOtp}
                                  disabled={sendLinkEmailOtpLoading}
                                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline transition"
                                >
                                  {sendLinkEmailOtpLoading
                                    ? "Sending..."
                                    : "Resend Code"}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => {
                                setLinkEmailOtpSent(false);
                                setLinkEmailOtp("");
                              }}
                              className="flex-1 bg-slate-200 text-slate-700 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-slate-300 transition"
                            >
                              Change Email
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              whileHover={{ scale: 1.03 }}
                              type="submit"
                              disabled={linkEmailOtpLoading}
                              className={`flex-1 bg-emerald-700 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:bg-emerald-800 transition ${
                                linkEmailOtpLoading
                                  ? "opacity-70 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {linkEmailOtpLoading
                                ? "Verifying..."
                                : "Verify & Link Phone"}
                            </motion.button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sign Up Link */}
              <p className="text-center text-slate-600 mt-4 sm:mt-6 text-xs sm:text-sm">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
