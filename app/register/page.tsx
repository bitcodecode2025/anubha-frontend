"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Phone, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { sendRegisterOtp, verifyRegisterOtp } from "@/lib/auth";
import OtpInput from "@/components/auth/OtpInput";

type RegisterMethod = "signup" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [method, setMethod] = useState<RegisterMethod>("signup");

  // Signup state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // OTP signup state
  const [otpName, setOtpName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [errors, setErrors] = useState<any>({});

  // Signup validation
  const validateSignup = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignup()) return;

    try {
      setSignupLoading(true);

      const res = await api.post<{ success: boolean; message?: string }>(
        "/auth/signup",
        {
          name: formData.name,
          phone: null,
          email: formData.email,
          password: formData.password,
        }
      );

      if (res.data.success) {
        toast.success("Account created successfully! Logging you in...");

        // Auto-login after signup
        try {
          const loginRes = await api.post<{
            success: boolean;
            user: {
              id: string;
              name: string;
              phone?: string;
              email?: string;
              role?: string;
            };
          }>("/auth/login", {
            identifier: formData.email,
            password: formData.password,
          });

          if (loginRes.data?.success && loginRes.data?.user) {
            login({
              id: loginRes.data.user.id,
              name: loginRes.data.user.name,
              phone: loginRes.data.user.phone || "",
              email: (loginRes.data.user as any).email,
              role: loginRes.data.user.role as any,
            });
            toast.success("Welcome! 🎉");
            router.push("/");
            router.refresh();
          }
        } catch (loginError) {
          console.error("[REGISTER] Auto-login failed:", loginError);
          toast.error("Account created. Please login manually.");
          router.push("/login");
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to create account";
      toast.error(errorMessage);
      setErrors({ email: errorMessage });
    } finally {
      setSignupLoading(false);
    }
  };

  // OTP signup handlers
  const handleSendOtp = async () => {
    setErrors({});

    if (!otpName.trim()) {
      setErrors({ otpName: "Full name is required" });
      return;
    }

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
      await sendRegisterOtp({ name: otpName.trim(), phone: phoneDigits });
      setOtpSent(true);
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
      const response = await verifyRegisterOtp({
        name: otpName.trim(),
        phone: phoneDigits,
        otp,
      });

      if ((response as any).success && (response as any).user) {
        login({
          id: (response as any).user.id,
          name: (response as any).user.name,
          phone: (response as any).user.phone || "",
          email: (response as any).user.email,
          role: (response as any).user.role as any,
        });
        toast.success("Account created and logged in successfully! 🎉");
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
    setOtpSent(false);
    setOtp("");
    setOtpName("");
    setPhone("");
    setErrors({});
    setResendCooldown(0);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
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
            Create Account
          </h1>
          <p className="text-slate-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
            Join Anubha Nutrition Clinic today
          </p>

          {/* Method Toggle */}
          <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-1 bg-emerald-50 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMethod("signup");
                setErrors({});
              }}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition ${
                method === "signup"
                  ? "bg-emerald-700 text-white shadow-md"
                  : "text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Sign Up
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
              <span className="hidden sm:inline">Sign Up with OTP</span>
              <span className="sm:hidden">OTP Signup</span>
            </button>
          </div>

          {/* Signup Form */}
          {method === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <motion.input
                    animate={errors.name ? { x: [-8, 8, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
                      errors.name
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <motion.input
                    animate={errors.email ? { x: [-8, 8, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
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

              {/* Password Input */}
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <motion.input
                    animate={errors.password ? { x: [-8, 8, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
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
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Input */}
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
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
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

              {/* Sign Up Button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                type="submit"
                disabled={signupLoading}
                className={`w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition ${
                  signupLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {signupLoading ? "Creating Account..." : "Sign Up"}
              </motion.button>
            </form>
          )}

          {/* OTP Signup Form */}
          {method === "otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="text-slate-700 font-medium text-sm block mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                      <motion.input
                        animate={errors.otpName ? { x: [-8, 8, -6, 6, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        type="text"
                        placeholder="Enter your full name"
                        value={otpName}
                        onChange={(e) => {
                          setOtpName(e.target.value);
                          setErrors((prev) => ({ ...prev, otpName: "" }));
                        }}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition ${
                          errors.otpName
                            ? "border-red-400"
                            : "border-emerald-200 focus:border-emerald-500"
                        }`}
                      />
                    </div>
                    {errors.otpName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.otpName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-700 font-medium text-sm block mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-slate-600 font-medium">
                        +91
                      </div>
                      <motion.input
                        animate={errors.phone ? { x: [-8, 8, -6, 6, 0] } : {}}
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
              ) : (
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
            </div>
          )}

          {/* Login Link */}
          <p className="text-center text-slate-600 mt-4 sm:mt-6 text-xs sm:text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-700 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
