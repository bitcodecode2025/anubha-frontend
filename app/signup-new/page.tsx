"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, Phone, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function SignupNew() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (
      formData.phone &&
      !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Phone must be 10 digits";
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Call backend signup API
      const res = await api.post<{ success: boolean; message?: string }>(
        "/auth/signup",
        {
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email,
          password: formData.password,
        }
      );

      if (res.data.success) {
        toast.success("Account created successfully!");

        // Auto-login with NextAuth
        const result = await signIn("credentials", {
          identifier: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Please login manually");
          router.push("/login-new");
        } else {
          router.push("/");
          router.refresh();
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
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error: any) {
      toast.error("Failed to sign up with Google");
      setGoogleLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-emerald-50/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="p-8 rounded-3xl bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40">
          <h1 className="text-3xl font-bold text-emerald-800 text-center mb-2">
            Create Account
          </h1>
          <p className="text-slate-600 text-center mb-6 text-sm">
            Join Anubha Nutrition Clinic today
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="text-slate-700 font-medium text-sm block mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <motion.input
                  animate={errors.name ? { x: [-8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition
                    ${
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
                Email Address *
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
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition
                    ${
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

            {/* Phone Input (Optional) */}
            <div>
              <label className="text-slate-700 font-medium text-sm block mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <motion.input
                  animate={errors.phone ? { x: [-8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    if (digits.length <= 10) {
                      handleChange("phone", digits);
                    }
                  }}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition
                    ${
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

            {/* Password Input */}
            <div>
              <label className="text-slate-700 font-medium text-sm block mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <motion.input
                  animate={errors.password ? { x: [-8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition
                    ${
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
                Confirm Password *
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
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className={`w-full pl-11 pr-12 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition
                    ${
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
              disabled={loading}
              className={`w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition
                ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-300"></div>
            <span className="text-slate-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-300"></div>
          </div>

          {/* Google Sign Up Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-semibold shadow-md hover:bg-slate-50 transition flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </motion.button>

          {/* Login Link */}
          <p className="text-center text-slate-600 mt-6 text-sm">
            Already have an account?{" "}
            <Link
              href="/login-new"
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
