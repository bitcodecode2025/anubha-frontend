"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { formatDateIST, formatTimeIST } from "@/lib/date";

export default function AppointmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Initialize pagination from URL
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 20;
  const initialSort = searchParams.get("sort") || "latest";

  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(
    Math.min(200, Math.max(1, initialLimit || 20))
  );
  const [sortByDate, setSortByDate] = useState<"latest" | "oldest">(
    initialSort === "oldest" ? "oldest" : "latest"
  );

  // Track initial mount to prevent URL sync loop
  const isInitialMount = useRef(true);

  // Memoize fetchAppointments to prevent recreation on every render
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMyAppointments({ page, limit, sort: sortByDate });
      setAppointments(response.appointments || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortByDate]);

  // Helper to sync URL with current pagination state
  // Only sync if URL differs from state to prevent infinite loops
  const syncUrlWithState = useCallback(
    (newPage: number, newLimit: number, newSort?: "latest" | "oldest") => {
      // Check if URL already matches state
      const currentPage = Number(searchParams.get("page")) || 1;
      const currentLimit = Number(searchParams.get("limit")) || 20;
      const currentSort = searchParams.get("sort") || "latest";
      const effectiveSort = newSort !== undefined ? newSort : sortByDate;
      
      if (currentPage === newPage && currentLimit === newLimit && currentSort === effectiveSort) {
        return; // URL already matches, no need to update
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());
      if (effectiveSort && effectiveSort !== "latest") {
        params.set("sort", effectiveSort);
      } else {
        params.delete("sort");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, sortByDate]
  );

  // Effect to update URL when state changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip URL sync on initial mount
    }
    syncUrlWithState(page, limit, sortByDate);
  }, [page, limit, sortByDate, syncUrlWithState]);

  // Fetch appointments when auth is ready and pagination changes
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
  }, [user, authLoading, router, fetchAppointments]);

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

          {/* Sort Control */}
          {appointments.length > 0 && (
            <div className="mb-6 flex items-center justify-end gap-2">
              <label className="text-sm font-medium text-slate-700">
                Sort by Date:
              </label>
              <select
                value={sortByDate}
                onChange={(e) => {
                  setSortByDate(e.target.value as "latest" | "oldest");
                  setPage(1); // Reset to page 1 when sort changes
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          )}

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
                                {formatDateIST(appointment.startAt, "EEE, dd MMM yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTimeIST(appointment.startAt, "hh:mm a")}
                                {" - "}
                                {formatTimeIST(appointment.endAt, "hh:mm a")}
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
        </motion.div>
      </div>
    </div>
  );
}
