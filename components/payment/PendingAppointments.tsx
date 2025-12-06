"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyAppointments, UserAppointment } from "@/lib/appointments-user";
import { getExistingOrder } from "@/lib/payment";
import {
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface PendingAppointmentsProps {
  onResumePayment: (appointmentId: string, orderId: string) => void;
}

export default function PendingAppointments({
  onResumePayment,
}: PendingAppointmentsProps) {
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      const response = await getMyAppointments();
      // Filter for PENDING appointments with payment status PENDING or FAILED
      const pending = response.appointments.filter(
        (apt) =>
          apt.status === "PENDING" &&
          (apt.paymentStatus === "PENDING" ||
            apt.paymentStatus === "FAILED" ||
            apt.paymentStatus === "INITIATED")
      );
      setAppointments(pending);
    } catch (error: any) {
      console.error("Failed to fetch pending appointments:", error);
      toast.error("Failed to load pending appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleContinuePayment = async (appointmentId: string) => {
    try {
      setResuming(appointmentId);
      toast.loading("Resuming payment...", { id: "resume-payment" });

      // Fetch existing order
      const orderResponse = await getExistingOrder(appointmentId);

      if (orderResponse.success && orderResponse.order) {
        toast.success("Payment order found. Redirecting...", {
          id: "resume-payment",
        });
        // Call parent handler to resume payment
        onResumePayment(appointmentId, orderResponse.order.id);
      } else {
        throw new Error(
          orderResponse.error ||
            "No payment order found. Please start a new booking."
        );
      }
    } catch (error: any) {
      console.error("Failed to resume payment:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to resume payment. Please try booking again.",
        { id: "resume-payment" }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 text-center"
      >
        <p className="text-slate-600 text-sm">
          No pending appointments found. Start a new booking to continue.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-amber-900 mb-1">
            Continue Where You Left Off
          </h3>
          <p className="text-sm text-amber-700">
            You have pending appointments waiting for payment. Complete the
            payment to confirm your booking.
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {appointments.map((appointment) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg border border-amber-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-800">
                    {appointment.planName}
                  </h4>
                  {appointment.planPackageName && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {appointment.planPackageName}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(appointment.startAt)}</span>
                  </div>
                  {appointment.slot && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(appointment.slot.startAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium text-emerald-600">
                      ₹{appointment.amount || appointment.planPrice}
                    </span>
                  </div>
                </div>

                {appointment.paymentStatus === "FAILED" && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded w-fit">
                    <AlertCircle className="w-3 h-3" />
                    Payment Failed
                  </div>
                )}
              </div>

              <button
                onClick={() => handleContinuePayment(appointment.id)}
                disabled={resuming === appointment.id}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {resuming === appointment.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Resuming...
                  </>
                ) : (
                  <>
                    Continue Payment
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
