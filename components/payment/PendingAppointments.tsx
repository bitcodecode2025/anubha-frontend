"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPendingAppointments,
  getNextStepUrl,
  getStepLabel,
  updateBookingProgress,
  type PendingAppointment,
} from "@/lib/pending-appointments";
import { getExistingOrder } from "@/lib/payment";
import { useBookingForm } from "@/app/book/context/BookingFormContext";
import { useAuth } from "@/app/context/AuthContext";
import {
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  User,
  ClipboardList,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface PendingAppointmentsProps {
  onResumePayment?: (appointmentId: string, orderId: string) => void;
}

export default function PendingAppointments({
  onResumePayment,
}: PendingAppointmentsProps) {
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);
  const router = useRouter();
  const { setForm } = useBookingForm();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // CRITICAL: Do NOT call APIs while auth is loading or user is null
    if (authLoading) return; // Wait for auth to resolve
    if (!user) return; // Do not call APIs if user is null

    fetchPendingAppointments();
  }, [user, authLoading]);

  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      const response = await getPendingAppointments();

      if (response.success && Array.isArray(response.appointments)) {
        setAppointments(response.appointments);
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load pending appointments"
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeBooking = async (appointment: PendingAppointment) => {
    try {
      setResuming(appointment.id);
      toast.loading("Resuming booking...", { id: `resume-${appointment.id}` });

      // Determine next step based on booking progress
      const nextStep = getNextStepUrl(appointment.bookingProgress);

      // Load appointment data into booking form context
      // Include all required fields to prevent redirects
      // Ensure appointmentMode is valid
      const appointmentMode =
        appointment.mode === "IN_PERSON" || appointment.mode === "ONLINE"
          ? appointment.mode
          : "IN_PERSON"; // Default fallback

      const formData = {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        slotId: appointment.slotId || null,
        planSlug: appointment.planSlug,
        planName: appointment.planName,
        planPrice: appointment.planPrice.toString(),
        planPriceRaw: appointment.planPrice,
        planDuration: appointment.planDuration,
        planPackageDuration: appointment.planDuration, // Also set this for compatibility
        planPackageName: appointment.planPackageName || null,
        appointmentMode: appointmentMode, // Always valid: "IN_PERSON" or "ONLINE"
      };

      setForm(formData);

      // Wait a bit for form context to update and persist to localStorage
      // This ensures the form data is saved before navigation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // If next step is payment and we have onResumePayment handler, try to resume payment
      if (
        nextStep === "/book/payment" &&
        appointment.slotId &&
        onResumePayment
      ) {
        try {
          const orderResponse = await getExistingOrder(appointment.id);
          if (orderResponse.success && orderResponse.order) {
            toast.success("Resuming payment...", {
              id: `resume-${appointment.id}`,
            });
            onResumePayment(appointment.id, orderResponse.order.id);
            return;
          }
        } catch (error) {
          // If no order exists, just continue to payment page
        }
      }

      // Navigate to next step
      toast.success(
        `Continuing from ${getStepLabel(appointment.bookingProgress)}...`,
        {
          id: `resume-${appointment.id}`,
        }
      );

      // Use replace instead of push to avoid back button issues
      router.push(nextStep);
    } catch (error: any) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-slate-600">
          Loading pending appointments...
        </span>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border-2 border-slate-200 p-8 text-center"
      >
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No Pending Appointments
        </h3>
        <p className="text-slate-600">
          You don't have any pending appointments. Start a new booking to
          continue.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Pending Appointments
          </h2>
          <p className="text-slate-600 mt-1">
            Continue where you left off with your booking
          </p>
        </div>
        <button
          onClick={fetchPendingAppointments}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {appointments.map((appointment) => {
        const ProgressIcon = getProgressIcon(appointment.bookingProgress);
        const isResuming = resuming === appointment.id;

        return (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-emerald-300 transition-colors"
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
                            <span>{formatDate(appointment.slot.startAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatTime(appointment.slot.startAt)} -{" "}
                              {formatTime(appointment.slot.endAt)}
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
                            <span className="text-slate-400">•</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getProgressColor(
                                appointment.bookingProgress
                              )}`}
                            >
                              {getStepLabel(appointment.bookingProgress)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
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
  );
}
