"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyAppointments,
  type UserAppointment,
} from "@/lib/appointments-user";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading, loggingOut } = useAuth();
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      fetchAppointments();
    }
  }, [user]);

  async function fetchAppointments() {
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
  }

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
    const digits = phone.replace(/\D/g, "");
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
                  <img
                    src="/images/anubha_profile_hd.jpg"
                    alt="Admin Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </motion.div>
              <h1 className="text-3xl font-bold text-emerald-800 mb-2">
                Your Profile
              </h1>
              <p className="text-slate-600 text-sm">
                Manage your account information
              </p>
            </div>

            {/* User Information */}
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
                    <p className="text-slate-800 font-semibold">{user.name}</p>
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
                      +91 {formatPhone(user.phone)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Role (if available) */}
              {user.role && (
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
          </div>

          {/* Appointments Section - Only for non-admin users */}
          {user.role !== "ADMIN" && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                My Appointments
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
                                Appointment Time
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
                              <p className="text-sm text-slate-600">
                                {new Date(
                                  appointment.startAt
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
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
    </div>
  );
}
