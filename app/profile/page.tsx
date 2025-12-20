"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  User,
  Phone,
  Shield,
  LogOut,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Video,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ClipboardList,
  CreditCard,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyAppointments,
  getAppointmentsByPatient,
  type UserAppointment,
} from "@/lib/appointments-user";
import {
  getPendingAppointments,
  getNextStepUrl,
  getStepLabel,
  deletePendingAppointment,
  type PendingAppointment,
} from "@/lib/pending-appointments";
import {
  getMyPatients,
  getPatientDetails,
  type Patient,
  type PatientDetails,
} from "@/lib/patient";
import { useBookingForm } from "@/app/book/context/BookingFormContext";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import SuccessNotification from "@/components/admin/SuccessNotification";
import { ChevronDown } from "lucide-react";
import BabySolidPlanOptions from "@/components/appointments/BabySolidPlanOptions";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading, loggingOut } = useAuth();
  const { setForm } = useBookingForm();
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [pendingAppointments, setPendingAppointments] = useState<
    PendingAppointment[]
  >([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchAppointments = useCallback(async () => {
    setLoadingAppointments(true);
    try {
      const response = await getMyAppointments();
      setAppointments(response.appointments);
    } catch (error: any) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  const fetchPendingAppointments = useCallback(async (patientId?: string) => {
    setLoadingPending(true);
    try {
      const response = await getPendingAppointments(patientId);
      if (response.success && Array.isArray(response.appointments)) {
        setPendingAppointments(response.appointments);
      } else {
        setPendingAppointments([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch pending appointments:", error);
      setPendingAppointments([]);
    } finally {
      setLoadingPending(false);
    }
  }, []);

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

  const fetchPatientAppointments = useCallback(
    async (patientId: string) => {
      setLoadingAppointments(true);
      try {
        const response = await getAppointmentsByPatient(patientId);
        setAppointments(response.appointments);
        // Also fetch pending appointments for this patient
        await fetchPendingAppointments(patientId);
      } catch (error: any) {
        console.error("Failed to fetch patient appointments:", error);
        toast.error("Failed to load appointments");
        setAppointments([]);
        setPendingAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    },
    [fetchPendingAppointments]
  );

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
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      fetchPatients();
      fetchAppointments();
      fetchPendingAppointments();
    }
  }, [user, fetchPatients, fetchAppointments, fetchPendingAppointments]);

  // Profile switching effect - runs when profile type or patient ID changes
  useEffect(() => {
    if (selectedProfileType === "patient" && selectedPatientId) {
      fetchPatientDetails(selectedPatientId);
      fetchPatientAppointments(selectedPatientId);
    } else if (selectedProfileType === "self" && user) {
      fetchAppointments();
      fetchPendingAppointments(); // No patientId = fetch all pending for user
    } else if (selectedProfileType === "patient") {
      // Clear appointments when switching to patient but no patient selected yet
      setAppointments([]);
      setPendingAppointments([]);
    }
  }, [
    selectedProfileType,
    selectedPatientId,
    user,
    fetchPatientDetails,
    fetchPatientAppointments,
    fetchAppointments,
    fetchPendingAppointments,
  ]);

  const handleResumeBooking = async (appointment: PendingAppointment) => {
    try {
      setResuming(appointment.id);
      toast.loading("Resuming booking...", { id: `resume-${appointment.id}` });

      const nextStep = getNextStepUrl(appointment.bookingProgress);

      // Ensure appointmentMode is valid
      const appointmentMode =
        appointment.mode === "IN_PERSON" || appointment.mode === "ONLINE"
          ? appointment.mode
          : "IN_PERSON";

      const formData = {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        slotId: appointment.slotId || null,
        planSlug: appointment.planSlug,
        planName: appointment.planName,
        planPrice: appointment.planPrice.toString(),
        planPriceRaw: appointment.planPrice,
        planDuration: appointment.planDuration,
        planPackageDuration: appointment.planDuration,
        planPackageName: appointment.planPackageName || null,
        appointmentMode: appointmentMode,
      };

      setForm(formData);
      await new Promise((resolve) => setTimeout(resolve, 300));

      toast.success(
        `Continuing from ${getStepLabel(appointment.bookingProgress)}...`,
        {
          id: `resume-${appointment.id}`,
        }
      );

      router.push(nextStep);
    } catch (error: any) {
      console.error("Failed to resume booking:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to resume booking. Please try again.",
        { id: `resume-${appointment.id}` }
      );
    } finally {
      setResuming(null);
    }
  };

  function openDeleteModal(appointmentId: string) {
    setAppointmentToDelete(appointmentId);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (deletingId) return; // Prevent closing while deleting
    setDeleteModalOpen(false);
    setAppointmentToDelete(null);
  }

  async function handleDeleteAppointment() {
    if (!appointmentToDelete) return;

    setDeletingId(appointmentToDelete);
    try {
      await deletePendingAppointment(appointmentToDelete);
      setDeleteModalOpen(false);
      setShowSuccessNotification(true);
      // Refresh the list based on current profile context
      if (selectedProfileType === "patient" && selectedPatientId) {
        fetchPendingAppointments(selectedPatientId);
      } else {
        fetchPendingAppointments();
      }
    } catch (error: any) {
      console.error("Failed to delete appointment:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to delete appointment",
        {
          position: "top-right",
          duration: 3000,
        }
      );
    } finally {
      setDeletingId(null);
      setAppointmentToDelete(null);
    }
  }

  const getProgressIcon = (progress: string | null) => {
    switch (progress) {
      case "USER_DETAILS":
        return User;
      case "RECALL":
        return ClipboardList;
      case "SLOT":
        return Clock;
      case "PAYMENT":
        return CreditCard;
      default:
        return AlertCircle;
    }
  };

  const getProgressColor = (progress: string | null) => {
    switch (progress) {
      case "USER_DETAILS":
        return "bg-blue-100 text-blue-800";
      case "RECALL":
        return "bg-purple-100 text-purple-800";
      case "SLOT":
        return "bg-yellow-100 text-yellow-800";
      case "PAYMENT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          {/* Profile Card */}
          <div className="p-8 rounded-3xl bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40 mb-8">
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
              <h1 className="text-3xl font-bold text-emerald-800 mb-2">
                {selectedProfileType === "patient" && selectedPatientDetails
                  ? `${selectedPatientDetails.name}'s Profile`
                  : "Your Profile"}
              </h1>
              <p className="text-slate-600 text-sm">
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
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <User className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Name</p>
                      <p className="text-slate-800 font-semibold">
                        {selectedProfileType === "patient" &&
                        selectedPatientDetails
                          ? selectedPatientDetails.name
                          : user.name}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl bg-white/60 border border-emerald-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <Phone className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">
                        Phone Number
                      </p>
                      <p className="text-slate-800 font-semibold">
                        +91{" "}
                        {formatPhone(
                          selectedProfileType === "patient" &&
                            selectedPatientDetails
                            ? selectedPatientDetails.phone
                            : user.phone
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

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
                            <div className="p-2 rounded-lg bg-emerald-100">
                              <Shield className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 font-medium">
                                Email
                              </p>
                              <p className="text-slate-800 font-semibold">
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

          {/* Appointments Section - Only for non-admin users */}
          {user.role !== "ADMIN" && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                {selectedProfileType === "patient" && selectedPatientDetails
                  ? `${selectedPatientDetails.name}'s Appointments`
                  : "My Appointments"}
              </h2>

              {loadingAppointments ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse"
                    >
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3 mb-3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/3 mb-4"></div>
                      <div className="h-10 bg-slate-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">
                    No appointments found
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    Book your first appointment to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appointments.map((appointment) => {
                    const statusColors = {
                      PENDING:
                        "bg-yellow-100 text-yellow-800 border-yellow-200",
                      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
                      CANCELLED: "bg-red-100 text-red-800 border-red-200",
                      COMPLETED: "bg-green-100 text-green-800 border-green-200",
                    };

                    const paymentColors = {
                      SUCCESS: "bg-green-50 text-green-700",
                      FAILED: "bg-red-50 text-red-700",
                      PENDING: "bg-yellow-50 text-yellow-700",
                    };

                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                      >
                        {/* Card Header */}
                        <div className="p-5 border-b border-slate-100">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">
                                  {appointment.patient.name}
                                </h3>
                                <p className="text-sm text-slate-500 truncate">
                                  {appointment.patient.phone}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                                statusColors[
                                  appointment.status as keyof typeof statusColors
                                ] || statusColors.PENDING
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 space-y-4">
                          {/* Appointment Time */}
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">
                                Appointment Date
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {new Date(
                                  appointment.startAt
                                ).toLocaleDateString("en-IN", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                              {appointment.status === "CONFIRMED" &&
                                appointment.endAt && (
                                  <>
                                    <p className="text-xs text-slate-500 mb-1 mt-2">
                                      Slot Timing
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {new Date(
                                        appointment.startAt
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      to{" "}
                                      {new Date(
                                        appointment.endAt
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </>
                                )}
                              {appointment.status !== "CONFIRMED" && (
                                <p className="text-sm text-slate-600 mt-1">
                                  {new Date(
                                    appointment.startAt
                                  ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Plan Name */}
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">
                                Plan
                              </p>
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {appointment.planName}
                              </p>
                              {appointment.planSlug === "baby-solid-food" && (
                                <BabySolidPlanOptions
                                  selectedPackageName={
                                    appointment.planPackageName
                                  }
                                  variant="compact"
                                />
                              )}
                            </div>
                          </div>

                          {/* Mode and Payment Status */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              {appointment.mode === "IN_PERSON" ? (
                                <MapPin className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Video className="w-4 h-4 text-purple-600" />
                              )}
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded ${
                                  appointment.mode === "IN_PERSON"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {appointment.mode === "IN_PERSON"
                                  ? "In-Person"
                                  : "Online"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded ${
                                  paymentColors[
                                    appointment.paymentStatus as keyof typeof paymentColors
                                  ] || paymentColors.PENDING
                                }`}
                              >
                                {appointment.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50">
                          <button
                            onClick={() =>
                              router.push(
                                `/profile/appointments/${appointment.id}`
                              )
                            }
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Pending Appointments Section - Only for non-admin users, shown for both self and patient profiles */}
          {user.role !== "ADMIN" && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-emerald-800">
                    {selectedProfileType === "patient" && selectedPatientDetails
                      ? `${selectedPatientDetails.name}'s Pending Appointments`
                      : "Pending Appointments"}
                  </h2>
                  <p className="text-slate-600 mt-1 text-sm">
                    {selectedProfileType === "patient"
                      ? "Continue booking for this patient"
                      : "Continue where you left off with your booking"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (
                      selectedProfileType === "patient" &&
                      selectedPatientId
                    ) {
                      fetchPendingAppointments(selectedPatientId);
                    } else {
                      fetchPendingAppointments();
                    }
                  }}
                  disabled={loadingPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loadingPending ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>

              {loadingPending ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="ml-2 text-slate-600">
                      Loading pending appointments...
                    </span>
                  </div>
                </div>
              ) : pendingAppointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">
                    No pending appointments
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    {selectedProfileType === "patient"
                      ? "This patient doesn't have any incomplete bookings"
                      : "You don't have any incomplete bookings"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {pendingAppointments.map((appointment) => {
                    const ProgressIcon = getProgressIcon(
                      appointment.bookingProgress
                    );
                    const isResuming = resuming === appointment.id;

                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${getProgressColor(
                                    appointment.bookingProgress
                                  )}`}
                                >
                                  <ProgressIcon className="w-6 h-6" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold text-slate-900">
                                    {appointment.planName}
                                  </h3>
                                  {appointment.planPackageName && (
                                    <span className="text-sm text-slate-500">
                                      ({appointment.planPackageName})
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-2 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{appointment.patient.name}</span>
                                  </div>

                                  {appointment.slot ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                          {new Date(
                                            appointment.slot.startAt
                                          ).toLocaleDateString("en-IN", {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                          {new Date(
                                            appointment.slot.startAt
                                          ).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}{" "}
                                          -{" "}
                                          {new Date(
                                            appointment.slot.endAt
                                          ).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span className="capitalize">
                                          {appointment.slot.mode
                                            .toLowerCase()
                                            .replace("_", " ")}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-2 text-amber-600">
                                      <AlertCircle className="w-4 h-4" />
                                      <span>Slot not selected yet</span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Status:</span>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                      Pending
                                    </span>
                                    {appointment.bookingProgress && (
                                      <>
                                        <span className="text-slate-400">
                                          •
                                        </span>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getProgressColor(
                                            appointment.bookingProgress
                                          )}`}
                                        >
                                          {getStepLabel(
                                            appointment.bookingProgress
                                          )}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex gap-2">
                            <button
                              onClick={() => openDeleteModal(appointment.id)}
                              disabled={
                                deletingId === appointment.id || deleteModalOpen
                              }
                              className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              title="Delete appointment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResumeBooking(appointment)}
                              disabled={isResuming}
                              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isResuming ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Resuming...</span>
                                </>
                              ) : (
                                <>
                                  <span>Continue Booking</span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAppointment}
        isLoading={deletingId !== null}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />

      {/* Success Notification */}
      <SuccessNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message="Appointment deleted successfully!"
        duration={3000}
      />
    </div>
  );
}
