"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginNew() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!identifier.trim()) {
      newErrors.identifier = "Email or phone is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        setErrors({ password: result.error });
      } else {
        toast.success("Logged in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error: any) {
      toast.error("Failed to login with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-emerald-50/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="p-8 rounded-3xl bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40">
          <h1 className="text-3xl font-bold text-emerald-800 text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600 text-center mb-6 text-sm">
            Login to continue to Anubha Nutrition Clinic
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email or Phone Input */}
            <div>
              <label className="text-slate-700 font-medium text-sm block mb-2">
                Email or Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {identifier.includes("@") ? (
                    <Mail className="w-5 h-5" />
                  ) : (
                    <Phone className="w-5 h-5" />
                  )}
                </div>
                <motion.input
                  animate={errors.identifier ? { x: [-8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  type="text"
                  placeholder="email@example.com or 9876543210"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setErrors((prev) => ({ ...prev, identifier: "" }));
                  }}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition
                    ${
                      errors.identifier
                        ? "border-red-400"
                        : "border-emerald-200 focus:border-emerald-500"
                    }`}
                />
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
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

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => toast("Coming soon!", { icon: "🔜" })}
                className="text-sm text-emerald-700 hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              type="submit"
              disabled={loading}
              className={`w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-800 transition
                ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-300"></div>
            <span className="text-slate-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-300"></div>
          </div>

          {/* Google Login Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleGoogleLogin}
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

          {/* Sign Up Link */}
          <p className="text-center text-slate-600 mt-6 text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup-new"
              className="text-emerald-700 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
