"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getMyAppointments,
  type UserAppointment,
} from "@/lib/appointments-user";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/profile");
      return;
    }

    fetchAppointments();
  }, [user, authLoading, router]);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const response = await getMyAppointments();
      setAppointments(response.appointments || []);
    } catch (error: any) {
      console.error("Failed to fetch appointments:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "COMPLETED":
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case "PENDING":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/profile")}
              className="text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Profile
            </button>
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">
              My Appointments
            </h1>
            <p className="text-slate-600">
              View all your confirmed and scheduled appointments
            </p>
          </div>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/40 shadow-lg">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No Appointments Found
              </h3>
              <p className="text-slate-500 mb-6">
                You don't have any appointments yet. Book your first appointment
                to get started.
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-xl rounded-xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left Section - Appointment Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                          <Calendar className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {appointment.planName}
                          </h3>
                          {appointment.planPackageName && (
                            <p className="text-sm text-slate-600 mb-2">
                              {appointment.planPackageName}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(
                                  appointment.startAt
                                ).toLocaleDateString("en-IN", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(
                                  appointment.startAt
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {" - "}
                                {new Date(appointment.endAt).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {appointment.mode === "IN_PERSON" ? (
                                <>
                                  <MapPin className="w-4 h-4" />
                                  <span>In-Person</span>
                                </>
                              ) : (
                                <>
                                  <Video className="w-4 h-4" />
                                  <span>Online</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Patient Info */}
                      {appointment.patient && (
                        <div className="pl-11 text-sm text-slate-600">
                          <span className="font-medium">Patient:</span>{" "}
                          {appointment.patient.name}
                        </div>
                      )}

                      {/* Payment Info */}
                      {appointment.amount && (
                        <div className="pl-11 text-sm">
                          <span className="text-slate-600">Amount: </span>
                          <span className="font-semibold text-slate-900">
                            ₹{appointment.amount}
                          </span>
                          <span className="ml-2 text-slate-600">
                            ({appointment.paymentStatus})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Status and View Details Button */}
                    <div className="flex items-start gap-3 sm:flex-col sm:items-end">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status}</span>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/profile/appointments/${appointment.id}`)
                        }
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
