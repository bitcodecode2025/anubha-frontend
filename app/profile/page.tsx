"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Pencil,
  Upload,
  Trash2,
  X,
  Image as ImageIcon,
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
import {
  getAdminProfilePicture,
  uploadAdminProfilePicture,
  updateAdminProfilePicture,
  deleteAdminProfilePicture,
} from "@/lib/admin-profile";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";

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

  // Profile picture state (for admin)
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  const [loadingProfilePicture, setLoadingProfilePicture] = useState(false);
  const [showProfilePictureMenu, setShowProfilePictureMenu] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  const [deletePictureModalOpen, setDeletePictureModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (user.role === "ADMIN") {
      // Fetch admin profile picture
      fetchAdminProfilePicture();
      return;
    }

    fetchPatients();
    // Removed appointments and pending appointments fetching - now in separate pages
  }, [user, loading, fetchPatients]);

  // Fetch admin profile picture
  const fetchAdminProfilePicture = useCallback(async () => {
    if (user?.role !== "ADMIN") return;
    setLoadingProfilePicture(true);
    try {
      const data = await getAdminProfilePicture();
      setProfilePictureUrl(data.profilePictureUrl);
    } catch (error: any) {
      // Silently fail - profile picture is optional
      console.error("Failed to load profile picture:", error);
    } finally {
      setLoadingProfilePicture(false);
    }
  }, [user]);

  // Handle profile picture file selection
  const handleProfilePictureFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    handleUploadProfilePicture(file);
  };

  // Upload/Update profile picture
  const handleUploadProfilePicture = async (file: File) => {
    setUploadingPicture(true);
    setShowProfilePictureMenu(false);
    try {
      const hasExistingPicture = !!profilePictureUrl;
      const result = hasExistingPicture
        ? await updateAdminProfilePicture(file)
        : await uploadAdminProfilePicture(file);

      if (result.success) {
        setProfilePictureUrl(result.profilePictureUrl);
        toast.success(
          hasExistingPicture
            ? "Profile picture updated successfully!"
            : "Profile picture uploaded successfully!"
        );
        // Refresh the page to update navbar
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to upload profile picture"
      );
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Delete profile picture
  const handleDeleteProfilePicture = async () => {
    setDeletingPicture(true);
    try {
      const result = await deleteAdminProfilePicture();
      if (result.success) {
        setProfilePictureUrl(null);
        toast.success(
          result.message || "Profile picture deleted successfully!"
        );
        setDeletePictureModalOpen(false);
        // Refresh the page to update navbar
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete profile picture"
      );
    } finally {
      setDeletingPicture(false);
    }
  };

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
                className={`relative w-32 h-32 mx-auto mb-4 rounded-full shadow-xl overflow-visible ${
                  user?.role === "ADMIN"
                    ? "border-4 border-emerald-400"
                    : "bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"
                }`}
              >
                {user?.role === "ADMIN" ? (
                  <>
                    {loadingProfilePicture ? (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100 rounded-full">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                      </div>
                    ) : profilePictureUrl ? (
                      <Image
                        src={profilePictureUrl}
                        alt="Admin Profile"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Image
                        src="/images/anubha_profile_hd.webp"
                        alt="Admin Profile"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                    {/* Upload Progress Overlay */}
                    {uploadingPicture && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-full flex flex-col items-center justify-center z-10"
                      >
                        {/* Modern Spinner */}
                        <div className="relative w-20 h-20 mb-4">
                          {/* Outer ring with gradient */}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(from 0deg, transparent 0deg, #10b981 90deg, transparent 90deg)`,
                            }}
                          />
                          {/* Inner white ring */}
                          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.8, 1, 0.8],
                              }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                            >
                              <Upload className="w-4 h-4 text-white" />
                            </motion.div>
                          </div>
                        </div>
                        <motion.p
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="text-white text-base font-bold"
                        >
                          Uploading...
                        </motion.p>
                        <p className="text-white/90 text-sm mt-1">
                          Please wait
                        </p>
                      </motion.div>
                    )}
                    {/* Edit Icon - Bottom Right Outside */}
                    {!uploadingPicture && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowProfilePictureMenu(true)}
                        disabled={uploadingPicture || deletingPicture}
                        className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl border-4 border-white flex items-center justify-center hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20"
                      >
                        <Pencil className="w-5 h-5 text-white" />
                      </motion.button>
                    )}
                  </>
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-2 break-words px-2">
                {selectedProfileType === "patient" && selectedPatientDetails
                  ? `${selectedPatientDetails.name}'s Profile`
                  : "Your Profile in localhost"}
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

      {/* Profile Picture Menu Modal */}
      <AnimatePresence>
        {showProfilePictureMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfilePictureMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
            />
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  duration: 0.3,
                }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-slate-200/50"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 py-5">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Profile Picture
                      </h3>
                      <p className="text-emerald-50 text-sm">
                        Update your profile photo
                      </p>
                    </div>
                    <button
                      onClick={() => setShowProfilePictureMenu(false)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Upload Area */}
                  <div className="mb-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleProfilePictureFileSelect}
                      className="hidden"
                      id="profile-picture-input"
                      disabled={uploadingPicture}
                    />
                    <label
                      htmlFor="profile-picture-input"
                      className={`group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden ${
                        uploadingPicture
                          ? "border-emerald-400 bg-emerald-50 cursor-wait"
                          : "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {uploadingPicture ? (
                        <div className="flex flex-col items-center gap-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                          />
                          <div className="text-center">
                            <p className="text-emerald-700 font-semibold">
                              Uploading...
                            </p>
                            <p className="text-emerald-600 text-sm mt-1">
                              Please wait
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Upload className="w-7 h-7 text-white" />
                            </div>
                            <div className="text-center">
                              <p className="text-slate-700 font-semibold text-base">
                                {profilePictureUrl
                                  ? "Choose a new photo"
                                  : "Upload a photo"}
                              </p>
                              <p className="text-slate-500 text-sm mt-1">
                                Click to browse or drag and drop
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-400/0 group-hover:from-emerald-400/5 group-hover:to-teal-400/5 transition-all" />
                        </>
                      )}
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {profilePictureUrl && (
                      <button
                        onClick={() => {
                          setShowProfilePictureMenu(false);
                          setDeletePictureModalOpen(true);
                        }}
                        disabled={deletingPicture || uploadingPicture}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Remove Current Picture</span>
                      </button>
                    )}
                  </div>

                  {/* Info Footer */}
                  <div className="mt-6 pt-5 border-t border-slate-200">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 flex-shrink-0">
                        <ImageIcon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-700 mb-1">
                          Supported formats
                        </p>
                        <p className="text-xs text-slate-500">
                          JPG, PNG, or JPEG • Maximum 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Profile Picture Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deletePictureModalOpen}
        onClose={() => setDeletePictureModalOpen(false)}
        onConfirm={handleDeleteProfilePicture}
        title="Delete Profile Picture"
        message="Are you sure you want to delete your profile picture? This action cannot be undone."
        isLoading={deletingPicture}
      />
    </div>
  );
}
