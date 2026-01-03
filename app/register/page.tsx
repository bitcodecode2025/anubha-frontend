"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import { signupInitiate, signupComplete } from "@/lib/auth";
import { getUserFriendlyError } from "@/lib/errorHandler";
import OtpInput from "@/components/auth/OtpInput";

type SignupStep = "DETAILS" | "OTP";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<SignupStep>("DETAILS");

  // Signup Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    otp?: string;
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const validateDetails = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (formData.phone.length !== 10)
      newErrors.phone = "Phone must be 10 digits";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      // Validate email format using proper regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 chars";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;

    setLoading(true);
    setErrors({});

    try {
      await signupInitiate({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      });
      setStep("OTP");
      setResendCooldown(60);
      toast.success("OTP sent to your email and phone");
    } catch (error: any) {
      const msg = getUserFriendlyError(error);
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrors({ otp: "Invalid OTP" });
      return;
    }
    setLoading(true);
    setErrors({});

    try {
      const response = await signupComplete({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        otp: otp,
      });

      if (response.user) {
        login({
          id: response.user.id,
          name: response.user.name,
          phone: response.user.phone || "",
          email: response.user.email || undefined,
          role: response.user.role,
        });
        toast.success("Account created successfully!");
        router.push("/");
      }
    } catch (error: any) {
      const msg = getUserFriendlyError(error);
      setErrors({ otp: msg });
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
            Create Account
          </h1>
          <p className="text-slate-600 text-center mb-6 text-sm">
            Join Anubha Nutrition Clinic
          </p>

          {step === "DETAILS" && (
            <form onSubmit={handleInitiate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm transition ${
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

              {/* Phone */}
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) =>
                      handleChange(
                        "phone",
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
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

              {/* Email */}
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
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

              {/* Password */}
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
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

              {/* Confirm Password */}
              <div>
                <label className="text-slate-700 font-medium text-sm block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/80 border outline-none shadow-sm transition ${
                      errors.confirmPassword
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                {loading ? "Sending OTP..." : "Sign Up"}
              </motion.button>

              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="text-emerald-700 hover:underline text-sm"
                >
                  Already have an account? Login
                </Link>
              </div>
            </form>
          )}

          {step === "OTP" && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">
                  OTP sent to{" "}
                  <span className="font-medium">{formData.email}</span> and{" "}
                  <span className="font-medium">+91 {formData.phone}</span>
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
                  {loading ? "Verifying..." : "Verify & Sign Up"}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    if (resendCooldown === 0)
                      handleInitiate({ preventDefault: () => {} } as any);
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
