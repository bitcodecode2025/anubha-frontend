"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getPendingAppointments,
  deletePendingAppointment,
  getNextStepUrl,
  getStepLabel,
  type PendingAppointment,
} from "@/lib/pending-appointments";
import {
  Clock,
  Calendar,
  MapPin,
  Video,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowRight,
  Trash2,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateIST, formatTimeIST } from "@/lib/date";

export default function PendingAppointmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Refs to prevent infinite loops
  const isInitialMount = useRef(true);
  const hasLoadedInitialData = useRef(false);

  // Initialize pagination from URL
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;

  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(
    Math.min(200, Math.max(1, initialLimit || 10))
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );

  // Memoize fetch function to prevent unnecessary re-renders
  const fetchPendingAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPendingAppointments({ page, limit });
      setAppointments(response.appointments || []);
      setTotal(response.total || 0);
      hasLoadedInitialData.current = true;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load pending appointments"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Helper to sync URL with current pagination state
  const syncUrlWithState = useCallback(
    (newPage: number, newLimit: number) => {
      // Prevent URL update if it already matches the state
      const currentPage = Number(searchParams.get("page")) || 1;
      const currentLimit = Number(searchParams.get("limit")) || 10;
      
      if (currentPage === newPage && currentLimit === newLimit) {
        return; // URL already matches, no need to update
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Effect to update URL when state changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    syncUrlWithState(page, limit);
  }, [page, limit, syncUrlWithState]);

  // Effect to fetch data when user/auth/page/limit changes
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

    fetchPendingAppointments();
  }, [user, authLoading, router, fetchPendingAppointments]);

  async function handleContinueBooking(appointment: PendingAppointment) {
    const nextStepUrl = getNextStepUrl(appointment.bookingProgress);
    // Store appointment ID in sessionStorage to resume booking
    sessionStorage.setItem("resumeAppointmentId", appointment.id);
    router.push(nextStepUrl);
  }

  function handleDeleteClick(appointmentId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setAppointmentToDelete(appointmentId);
    setShowDeleteModal(true);
  }

  function handleCloseDeleteModal() {
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!appointmentToDelete) return;

    setDeletingId(appointmentToDelete);
    try {
      await deletePendingAppointment(appointmentToDelete);
      toast.success("Pending appointment deleted successfully");
      setAppointments((prev) =>
        prev.filter((apt) => apt.id !== appointmentToDelete)
      );
      handleCloseDeleteModal();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete appointment"
      );
    } finally {
      setDeletingId(null);
    }
  }

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
              Pending Appointments
            </h1>
            <p className="text-slate-600">
              Continue where you left off with incomplete bookings
            </p>
          </div>

          {/* Pending Appointments List */}
          {appointments.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/40 shadow-lg">
              <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No Pending Appointments
              </h3>
              <p className="text-slate-500 mb-6">
                You don't have any incomplete bookings. Start a new appointment
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
              {/* Note about deleting pending appointments */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Note:</span> If the given
                  pending appointment is already confirmed, you can safely
                  delete the pending entry.
                </p>
              </div>

              {/* Appointments */}
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-xl rounded-xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header Section */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                            <Clock className="w-5 h-5 text-amber-700" />
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
                            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full w-fit">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium">
                                Next Step:{" "}
                                {getStepLabel(appointment.bookingProgress)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Appointment Details */}
                        {appointment.slot && (
                          <div className="pl-11 space-y-2 text-sm text-slate-600">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {formatDateIST(appointment.slot.startAt, "EEE, dd MMM yyyy")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {formatTimeIST(appointment.slot.startAt, "hh:mm a")}
                                  {" - "}
                                  {formatTimeIST(appointment.slot.endAt, "hh:mm a")}
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
                        )}

                        {/* Patient Info */}
                        {appointment.patient && (
                          <div className="pl-11 mt-2 text-sm text-slate-600">
                            <span className="font-medium">Patient:</span>{" "}
                            {appointment.patient.name}
                          </div>
                        )}

                        {/* Price Info */}
                        <div className="pl-11 mt-2 text-sm">
                          <span className="text-slate-600">Price: </span>
                          <span className="font-semibold text-slate-900">
                            ₹{appointment.planPrice}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteClick(appointment.id, e)}
                        disabled={deletingId === appointment.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="Delete pending appointment"
                      >
                        {deletingId === appointment.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Continue Button */}
                    <div className="pl-11">
                      <button
                        onClick={() => handleContinueBooking(appointment)}
                        className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Continue Booking
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              {total > limit && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-emerald-50/80 to-white rounded-xl p-5 border-2 border-emerald-200/60 shadow-md shadow-emerald-100/50">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Page Size:
                    </label>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1); // Reset to page 1 when limit changes
                      }}
                      className="px-3 py-1.5 border-2 border-emerald-300/60 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-800 shadow-sm hover:border-emerald-400 transition-colors"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>

                  {/* Pagination Info */}
                  <div className="text-sm font-semibold text-slate-800">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, total)} of {total} appointments
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2.5 border-2 border-emerald-300/60 bg-white rounded-lg hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-300/60 transition-all duration-200 text-emerald-700 font-semibold"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1.5">
                      {Array.from(
                        { length: Math.min(5, Math.ceil(total / limit)) },
                        (_, i) => {
                          const totalPages = Math.ceil(total / limit);
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                page === pageNum
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200/50 scale-105"
                                  : "border-2 border-emerald-300/60 bg-white hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm text-slate-800"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(Math.ceil(total / limit), p + 1))
                      }
                      disabled={page >= Math.ceil(total / limit)}
                      className="p-2.5 border-2 border-emerald-300/60 bg-white rounded-lg hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-300/60 transition-all duration-200 text-emerald-700 font-semibold"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteModal && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCloseDeleteModal}
                  className="fixed inset-0 bg-black/50 z-40"
                />
                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <div
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          Delete Pending Appointment
                        </h3>
                      </div>
                      <button
                        onClick={handleCloseDeleteModal}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>

                    <p className="text-slate-600 mb-6">
                      Are you sure you want to delete this pending appointment?
                      This action cannot be undone.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCloseDeleteModal}
                        disabled={deletingId !== null}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={deletingId !== null}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {deletingId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
