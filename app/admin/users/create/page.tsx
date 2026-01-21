"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  Loader2,
  ArrowLeft,
  UserPlus,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createUser } from "@/lib/admin-users";

export default function CreateUserPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  // Handle phone input - only allow 10 digits
  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, "");
    // Limit to 10 digits
    if (digitsOnly.length <= 10) {
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    }
  };

  // Route protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.role !== "ADMIN") {
        router.replace("/");
        return;
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // At least one of phone or email is required
    if (!formData.phone.trim() && !formData.email.trim()) {
      toast.error("Either phone number or email is required");
      return;
    }

    // Validate phone number - must be exactly 10 digits
    if (formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        toast.error("Phone number must be exactly 10 digits");
        return;
      }
    }

    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setLoading(true);
    try {
      // Prepare phone: if provided, send the 10 digits (backend will add 91 prefix)
      // IMPORTANT: Send null if empty, never empty string
      let phoneToSend: string | null = null;
      if (formData.phone.trim()) {
        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (phoneDigits.length === 10) {
          phoneToSend = phoneDigits; // Send 10 digits, backend normalizer will add 91
        }
      }

      // IMPORTANT: Send null if empty, never empty string
      const emailToSend = formData.email.trim() ? formData.email.trim() : null;

      // Verify at least one of phone or email is provided
      if (!phoneToSend && !emailToSend) {
        toast.error("Either phone number or email is required");
        setLoading(false);
        return;
      }

      const newUser = await createUser({
        name: formData.name.trim(),
        phone: phoneToSend, // null if not provided
        email: emailToSend, // null if not provided
        password: formData.password,
      });

      toast.success("User created successfully!");
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="min-h-[70vh] px-6 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Create User
          </h1>
          <p className="text-slate-600">
            Create a new user account. Fill in the details below.
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative flex items-center">
                {/* 91 Prefix Display */}
                <div className="absolute left-3 flex items-center gap-1 text-slate-600 font-semibold z-10">
                  <span>+91</span>
                </div>
                <Phone className="absolute left-12 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="10 digit mobile number"
                  maxLength={10}
                  className="w-full pl-20 pr-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {formData.phone.length > 0 && formData.phone.length !== 10 && (
                  <span className="text-red-500">
                    Phone number must be exactly 10 digits
                  </span>
                )}
                {formData.phone.length === 0 && (
                  <span>Either phone or email is required</span>
                )}
                {formData.phone.length === 10 && (
                  <span className="text-emerald-600">✓ Valid phone number</span>
                )}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Minimum 6 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Create User</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
