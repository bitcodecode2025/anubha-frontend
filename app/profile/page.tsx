"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  User,
  Phone,
  Mail,
  Shield,
  LogOut,
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
// Removed appointments imports - now handled in separate pages
import {
  getMyPatients,
  getPatientDetails,
  type Patient,
  type PatientDetails,
} from "@/lib/patient";
import { ChevronDown } from "lucide-react";
import { sendAddEmailOtp, verifyAddEmailOtp } from "@/lib/auth";
import OtpInput from "@/components/auth/OtpInput";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading, loggingOut } = useAuth();
  // Removed appointments and pending appointments state - now handled in separate pages

  // Profile switching state
  const [selectedProfileType, setSelectedProfileType] = useState<
    "self" | "patient"
  >("self");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientDetails, setSelectedPatientDetails] =
    useState<PatientDetails | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);

  // Admin data state (fetched from Admin model)
  const [adminData, setAdminData] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "ADMIN";
  } | null>(null);
  const [loadingAdminData, setLoadingAdminData] = useState(false);

  // Add Email state
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);

  useEffect(() => {
    // Do NOT redirect while auth is loading
    if (loading) return;
    // Only redirect after auth state is fully resolved
    if (!user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Removed fetchAppointments and fetchPendingAppointments - now handled in separate pages

  const fetchPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const patientsList = await getMyPatients();
      setPatients(patientsList);
    } catch (error: any) {
      console.error("Failed to fetch patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  const fetchPatientDetails = useCallback(async (patientId: string) => {
    setLoadingPatientDetails(true);
    try {
      const response = await getPatientDetails(patientId);
      setSelectedPatientDetails(response.patient);
    } catch (error: any) {
      console.error("Failed to fetch patient details:", error);
      toast.error("Failed to load patient details");
      setSelectedPatientDetails(null);
    } finally {
      setLoadingPatientDetails(false);
    }
  }, []);

  // Removed fetchPatientAppointments - now handled in separate pages

  const handleProfileChange = useCallback(
    (profileType: "self" | "patient", patientId?: string | null) => {
      setSelectedProfileType(profileType);
      setSelectedPatientId(patientId || null);
      if (profileType === "self") {
        setSelectedPatientDetails(null);
      }
    },
    []
  );

  // Initial load effect - runs when user is available
  // CRITICAL: Do NOT call APIs while auth is loading or user is null
  useEffect(() => {
    if (loading) return; // Wait for auth to resolve
    if (!user) return; // Do not call APIs if user is null
    if (user.role === "ADMIN") return; // Admins don't need this data

    fetchPatients();
    // Removed appointments and pending appointments fetching - now in separate pages
  }, [user, loading, fetchPatients]);

  // Profile switching effect - runs when profile type or patient ID changes
  // CRITICAL: Do NOT call APIs while auth is loading or user is null
  useEffect(() => {
    if (loading) return; // Wait for auth to resolve
    if (!user) return; // Do not call APIs if user is null

    if (selectedProfileType === "patient" && selectedPatientId) {
      fetchPatientDetails(selectedPatientId);
      // Removed appointments fetching - now in separate pages
    }
  }, [
    selectedProfileType,
    selectedPatientId,
    user,
    loading,
    fetchPatientDetails,
  ]);

  // Removed appointment-related handlers - now handled in separate pages

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Add Email handlers
  const handleSendEmailOtp = async () => {
    if (!emailToAdd.trim()) {
      setEmailOtpError("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToAdd.trim())) {
      setEmailOtpError("Please enter a valid email address");
      return;
    }

    setSendingEmailOtp(true);
    setEmailOtpError("");

    try {
      await sendAddEmailOtp({ email: emailToAdd.trim() });
      setEmailOtpSent(true);
      setEmailResendCooldown(60);
      toast.success("Verification code sent to your email");

      // Start cooldown timer
      const interval = setInterval(() => {
        setEmailResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to send verification code";
      setEmailOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 4) {
      setEmailOtpError("Please enter the 4-digit verification code");
      return;
    }

    setVerifyingEmailOtp(true);
    setEmailOtpError("");

    try {
      const response = (await verifyAddEmailOtp({
        email: emailToAdd.trim(),
        otp: emailOtp,
      })) as { success: boolean; user?: any; message?: string };

      if (response.success && response.user) {
        // Force refresh to get updated user data
        window.location.reload();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to verify code";
      setEmailOtpError(errorMessage);
      toast.error(errorMessage);
      setEmailOtp("");
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (emailResendCooldown > 0) return;
    await handleSendEmailOtp();
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
    let digits = phone.replace(/\D/g, "");
    // Remove leading country code 91 if present
    if (digits.startsWith("91") && digits.length > 10) {
      digits = digits.substring(2);
    }
    // Format as XXXX XXXXX (5 digits, space, 5 digits)
    return digits.replace(/(\d{5})(\d{0,5})/, "$1 $2").trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          {/* Profile Card */}
          <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40 mb-6 sm:mb-8">
            {/* Profile Switcher Dropdown - Only for non-admin users */}
            {user && user.role !== "ADMIN" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  View Profile
                </label>
                <div className="relative">
                  <select
                    value={
                      selectedProfileType === "self"
                        ? "self"
                        : selectedPatientId || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "self") {
                        handleProfileChange("self");
                      } else {
                        handleProfileChange("patient", value);
                      }
                    }}
                    disabled={loadingPatients}
                    className="w-full px-4 py-3 pr-10 bg-white border border-emerald-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="self">Self ({user.name})</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-24 h-24 mx-auto mb-4 rounded-full shadow-lg overflow-hidden ${
                  user?.role === "ADMIN"
                    ? "border-4 border-emerald-400"
                    : "bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"
                }`}
              >
                {user?.role === "ADMIN" ? (
                  <Image
                    src="/images/anubha_profile_hd.webp"
                    alt="Admin Profile"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-2 break-words px-2">
                {selectedProfileType === "patient" && selectedPatientDetails
                  ? `${selectedPatientDetails.name}'s Profile`
                  : "Your Profile"}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm px-2">
                {selectedProfileType === "patient"
                  ? "View patient information and appointments"
                  : "Manage your account information"}
              </p>
            </div>

            {/* User/Patient Information */}
            {loadingPatientDetails && selectedProfileType === "patient" ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                      <User className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium">Name</p>
                      <p className="text-slate-800 font-semibold break-words">
                        {selectedProfileType === "patient" &&
                        selectedPatientDetails
                          ? selectedPatientDetails.name
                          : user.name}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Phone - Only show if phone exists (not null) */}
                {((selectedProfileType === "self" && user.phone) ||
                  (selectedProfileType === "patient" &&
                    selectedPatientDetails?.phone)) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                        <Phone className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 font-medium">
                          Phone Number
                        </p>
                        <p className="text-slate-800 font-semibold break-words min-w-0">
                          {selectedProfileType === "patient" &&
                          selectedPatientDetails
                            ? `+91 ${formatPhone(selectedPatientDetails.phone)}`
                            : user.phone
                            ? `+91 ${formatPhone(user.phone)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Email - Only for self profile */}
                {selectedProfileType === "self" && user.email && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                        <Mail className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 font-medium">
                          Email Address
                        </p>
                        <p className="text-slate-800 font-semibold break-words overflow-wrap-anywhere">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Add Email - Only for self profile when email is null */}
                {selectedProfileType === "self" && !user.email && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                  >
                    {!showAddEmail ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                            <Mail className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-medium">
                              Email Address
                            </p>
                            <p className="text-slate-600 text-sm">
                              No email address added
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddEmail(true)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap"
                        >
                          Add Email
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                            <Mail className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-medium mb-2">
                              Add Email Address
                            </p>
                            {!emailOtpSent ? (
                              <div className="space-y-3">
                                <input
                                  type="email"
                                  value={emailToAdd}
                                  onChange={(e) => {
                                    setEmailToAdd(e.target.value);
                                    setEmailOtpError("");
                                  }}
                                  placeholder="Enter your email address"
                                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                  disabled={sendingEmailOtp}
                                />
                                {emailOtpError && (
                                  <p className="text-sm text-red-600">
                                    {emailOtpError}
                                  </p>
                                )}
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSendEmailOtp}
                                    disabled={sendingEmailOtp}
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {sendingEmailOtp ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                      </span>
                                    ) : (
                                      "Verify Email"
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowAddEmail(false);
                                      setEmailToAdd("");
                                      setEmailOtpError("");
                                    }}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm text-slate-600 mb-2">
                                  Enter the 4-digit code sent to{" "}
                                  <span className="font-semibold">
                                    {emailToAdd}
                                  </span>
                                </p>
                                <OtpInput
                                  value={emailOtp}
                                  onChange={(value) => {
                                    setEmailOtp(value);
                                    setEmailOtpError("");
                                  }}
                                  error={!!emailOtpError}
                                  disabled={verifyingEmailOtp}
                                  autoFocus={true}
                                />
                                {emailOtpError && (
                                  <p className="text-sm text-red-600">
                                    {emailOtpError}
                                  </p>
                                )}
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleVerifyEmailOtp}
                                    disabled={
                                      verifyingEmailOtp || emailOtp.length !== 4
                                    }
                                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {verifyingEmailOtp ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying...
                                      </span>
                                    ) : (
                                      "Verify Code"
                                    )}
                                  </button>
                                  <button
                                    onClick={handleResendEmailOtp}
                                    disabled={emailResendCooldown > 0}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {emailResendCooldown > 0
                                      ? `Resend (${emailResendCooldown}s)`
                                      : "Resend"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Additional Patient Information */}
                {selectedProfileType === "patient" &&
                  selectedPatientDetails && (
                    <>
                      {/* Email */}
                      {selectedPatientDetails.email && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                              <Shield className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 font-medium">
                                Email
                              </p>
                              <p className="text-slate-800 font-semibold break-words overflow-wrap-anywhere">
                                {selectedPatientDetails.email}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Gender */}
                      {selectedPatientDetails.gender && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                              <User className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 font-medium">
                                Gender
                              </p>
                              <p className="text-slate-800 font-semibold capitalize">
                                {selectedPatientDetails.gender.toLowerCase()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Age */}
                      {selectedPatientDetails.age && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                          className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                              <Calendar className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 font-medium">
                                Age
                              </p>
                              <p className="text-slate-800 font-semibold">
                                {selectedPatientDetails.age} years
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Address */}
                      {selectedPatientDetails.address && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                          className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                              <MapPin className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 font-medium mb-1">
                                Address
                              </p>
                              <p className="text-slate-800 font-semibold break-words overflow-wrap-anywhere">
                                {selectedPatientDetails.address}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
              </div>
            )}

            {/* Role (only show for self, not for patients) */}
            {selectedProfileType === "self" && user.role && (
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

          {/* Quick Actions Section - Only for non-admin users */}
          {user.role !== "ADMIN" && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* View Appointments Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => router.push("/profile/appointments")}
                  className="p-6 bg-white rounded-xl shadow-sm border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                      <Calendar className="w-6 h-6 text-emerald-700" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    View Appointments
                  </h3>
                  <p className="text-sm text-slate-600">
                    View all your confirmed and scheduled appointments
                  </p>
                </motion.button>

                {/* View Pending Appointments Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => router.push("/profile/pending-appointments")}
                  className="p-6 bg-white rounded-xl shadow-sm border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                      <Clock className="w-6 h-6 text-amber-700" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    View Pending Appointments
                  </h3>
                  <p className="text-sm text-slate-600">
                    Continue where you left off with incomplete bookings
                  </p>
                </motion.button>
              </div>
            </div>
          )}

          {/* Back to Home Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => router.push("/")}
              className="text-slate-600 hover:text-emerald-700 font-medium transition-colors"
            >
              ← Back to Home
            </button>
          </motion.div>

          {/* Logout Button at Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleLogout}
              disabled={loggingOut}
              className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition flex items-center justify-center gap-2
                ${loggingOut ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? "Logging out..." : "Logout"}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Removed modals - now handled in separate pages */}
    </div>
  );
}
