"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getAdminAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  type Appointment,
} from "@/lib/appointments-admin";
import {
  Loader2,
  Clock,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  MapPin,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Trash2,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import SuccessNotification from "@/components/admin/SuccessNotification";
import BabySolidPlanOptions from "@/components/appointments/BabySolidPlanOptions";
import { formatDateIST, formatTimeIST } from "@/lib/date";

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 400;

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searching, setSearching] = useState(false);

  // Initialize pagination & filters from URL (for sharable links / back-forward)
  const initialPage = Number(searchParams.get("page") || "1");
  const initialLimit = Number(searchParams.get("limit") || "20");
  const initialStatus = searchParams.get("status") || "";
  const initialMode = searchParams.get("mode") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "latest";

  const [page, setPage] = useState(Math.max(1, initialPage));
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(
    Math.min(200, Math.max(1, initialLimit || 20))
  );
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [modeFilter, setModeFilter] = useState<string>(initialMode);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortByDate, setSortByDate] = useState<"latest" | "oldest">(
    initialSort === "oldest" ? "oldest" : "latest"
  );

  // Refs for cleanup and cancellation
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);

  // 🔒 ROUTE PROTECTION: Wait for auth, then check permissions
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.role !== "ADMIN") {
        router.replace("/");
        return;
      }
    }
  }, [user, loading, router]);

  // Helper to keep URL in sync with current filters & pagination
  const syncUrlWithState = useCallback(
    (overrides?: Partial<{ page: number; limit: number; status: string; mode: string; q: string; sort: string }>) => {
      const params = new URLSearchParams(searchParams.toString());

      const effectivePage = overrides?.page ?? page;
      const effectiveLimit = overrides?.limit ?? limit;
      const effectiveStatus = overrides?.status ?? statusFilter;
      const effectiveMode = overrides?.mode ?? modeFilter;
      const effectiveQuery = overrides?.q ?? searchQuery;
      const effectiveSort = overrides?.sort ?? sortByDate;

      params.set("page", String(effectivePage));
      params.set("limit", String(effectiveLimit));

      if (effectiveStatus) params.set("status", effectiveStatus);
      else params.delete("status");

      if (effectiveMode) params.set("mode", effectiveMode);
      else params.delete("mode");

      if (effectiveQuery && effectiveQuery.trim().length >= MIN_SEARCH_LENGTH) {
        params.set("q", effectiveQuery.trim());
      } else {
        params.delete("q");
      }

      if (effectiveSort && effectiveSort !== "latest") {
        params.set("sort", effectiveSort);
      } else {
        params.delete("sort");
      }

      const queryString = params.toString();
      router.replace(
        queryString ? `/admin/appointments?${queryString}` : "/admin/appointments",
        { scroll: false }
      );
    },
    [router, searchParams, page, limit, statusFilter, modeFilter, searchQuery, sortByDate]
  );

  // Fetch appointments with cancellation support
  const fetchAppointments = useCallback(
    async (search?: string) => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Set loading states at the start
      setLoadingData(true);
      if (search) {
        setSearching(true);
      }

      try {
        const params: any = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (modeFilter) params.mode = modeFilter;
        if (sortByDate && sortByDate !== "latest") params.sort = sortByDate;
        if (search && search.trim().length >= MIN_SEARCH_LENGTH) {
          params.q = search.trim();
        }

        // Preserve any existing date filter from URL (if present)
        const dateParam = searchParams.get("date");
        if (dateParam) {
          params.date = dateParam;
        }

        const response = await getAdminAppointments(params);

        // Only update state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setAppointments(response.appointments);
          setTotal(response.total);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === "AbortError" || abortController.signal.aborted) {
          // Reset loading state even if aborted to prevent stuck loader
          setLoadingData(false);
          setSearching(false);
          return;
        }
        toast.error(
          error?.response?.data?.message || "Failed to load appointments"
        );
      } finally {
        // Always reset loading state, even if aborted
        if (!abortController.signal.aborted) {
          setLoadingData(false);
          setSearching(false);
        } else {
          // If aborted, still reset loading state to prevent stuck loader
          setLoadingData(false);
          setSearching(false);
        }
      }
    },
    [page, limit, statusFilter, modeFilter, sortByDate, searchParams]
  );

  // Debounced search query state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Search with debounce and minimum length
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const trimmedQuery = searchQuery.trim();
    const shouldSearch = trimmedQuery.length >= MIN_SEARCH_LENGTH;

    // If query is too short, set empty debounced query
    if (!shouldSearch && trimmedQuery.length === 0) {
      setDebouncedSearchQuery("");
      setSearching(false);
      return;
    }

    // If query is too short but there's a query, show helper text only
    if (!shouldSearch && trimmedQuery.length > 0) {
      setSearching(false);
      return;
    }

    // Don't set searching state here - let fetchAppointments handle it
    // This prevents the loader from showing while user is still typing

    // Debounce the search query update
    timeoutRef.current = setTimeout(() => {
      if (shouldSearch) {
        setDebouncedSearchQuery(trimmedQuery);
        // When search becomes active, reset to page 1 & sync URL
        setPage(1);
        syncUrlWithState({ page: 1, q: trimmedQuery });
      } else {
        setDebouncedSearchQuery("");
        syncUrlWithState({ q: "" });
      }
    }, DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [searchQuery, syncUrlWithState]);

  // Initial load and filter changes (including debounced search)
  useEffect(() => {
    // CRITICAL: Do NOT call APIs until user is authenticated
    if (!user || user.role !== "ADMIN") return;

    // Reset to page 1 when filters change (except initial mount)
    if (
      !isInitialMount.current &&
      (statusFilter || modeFilter || sortByDate !== "latest" || debouncedSearchQuery)
    ) {
      setPage(1);
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
    }

    // Use debounced search query
    const searchToUse =
      debouncedSearchQuery.trim().length >= MIN_SEARCH_LENGTH
        ? debouncedSearchQuery.trim()
        : undefined;

    fetchAppointments(searchToUse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // NOTE: fetchAppointments is intentionally NOT in the dependency array.
    // It's a useCallback that depends on [page, limit, statusFilter, modeFilter],
    // which are already in this effect's dependencies. Including fetchAppointments
    // would cause the effect to run whenever the function reference changes,
    // creating an infinite loop. The function is stable via useCallback.
  }, [
    page,
    statusFilter,
    modeFilter,
    sortByDate,
    debouncedSearchQuery,
    user?.role,
    user?.id,
    // fetchAppointments removed to prevent infinite loop
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setPage(1);
    syncUrlWithState({ page: 1, q: "" });
  };

  function handleViewDetails(appointmentId: string) {
    router.push(`/admin/appointments/${appointmentId}`);
  }

  async function handleStatusChange(
    appointmentId: string,
    newStatus: "CANCELLED" | "COMPLETED"
  ) {
    // Guard: Do not proceed if backend token is not ready
    if (!user || user.role !== "ADMIN") {
      toast.error("Please wait for authentication to complete");
      return;
    }

    setUpdatingStatus(appointmentId);

    // Optimistic update: update local state immediately
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === appointmentId ? { ...appt, status: newStatus } : appt
      )
    );
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      toast.success(`Appointment marked as ${newStatus.toLowerCase()}`);
    } catch (error: any) {
      // Revert optimistic update on error
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId
            ? {
                ...appt,
                status:
                  appt.status === "CANCELLED" || appt.status === "COMPLETED"
                    ? "CONFIRMED"
                    : appt.status,
              }
            : appt
        )
      );
      toast.error(
        error?.response?.data?.error || "Failed to update appointment status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  }

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

    // Guard: Do not proceed if backend token is not ready
    if (!user || user.role !== "ADMIN") {
      toast.error("Please wait for authentication to complete");
      return;
    }

    setDeletingId(appointmentToDelete);
    try {
      await deleteAppointment(appointmentToDelete);
      setDeleteModalOpen(false);
      setShowSuccessNotification(true);
      fetchAppointments();
    } catch (error: any) {
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

  const totalPages = Math.ceil(total / limit);

  // Show loading state or return null if not authenticated
  if (loading) {
    return null;
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  if (loadingData) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="h-9 w-64 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-80 bg-slate-200 rounded animate-pulse" />
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4">
            <div className="flex-1">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Appointment Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
              >
                {/* Card Header Skeleton */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Card Body Skeleton */}
                <div className="p-5 flex-1 space-y-4">
                  {/* Slot Time */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-slate-200 rounded animate-pulse flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-1" />
                      <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Booking Time */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-slate-200 rounded animate-pulse flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-1" />
                      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Plan */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-slate-200 rounded animate-pulse flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="h-3 w-10 bg-slate-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Mode and Payment */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Card Footer Skeleton */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-2">
                  <div className="flex-1 h-10 bg-slate-200 rounded-lg animate-pulse" />
                  <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between border border-slate-200">
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </div>
      </div>
    </main>
  );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Appointments
          </h1>
          <p className="text-slate-600">
            Manage all patient appointments ({total} total)
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, phone, or email (min 2 characters)..."
              className="w-full pl-10 pr-10 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              autoComplete="off"
            />
            {searching && (
              <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 animate-spin pointer-events-none" />
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery.trim().length > 0 &&
            searchQuery.trim().length < MIN_SEARCH_LENGTH && (
              <p className="mt-2 text-sm text-slate-500">
                Type at least {MIN_SEARCH_LENGTH} characters to search
              </p>
            )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mode
            </label>
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Modes</option>
              <option value="IN_PERSON">In-Person</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sort by Date
            </label>
            <select
              value={sortByDate}
              onChange={(e) => {
                setSortByDate(e.target.value as "latest" | "oldest");
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          {/* Page size selector */}
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Page Size
            </label>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Math.min(
                  200,
                  Math.max(1, Number(e.target.value) || 20)
                );
                setLimit(newLimit);
                setPage(1);
                syncUrlWithState({ page: 1, limit: newLimit });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Appointments Cards */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-500 text-lg">No appointments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {appointments.map((appointment) => {
              const statusColors = {
                PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
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
                <div
                  key={appointment.id}
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
                    {/* Slot Time */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Slot Time</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDateIST(appointment.startAt, "EEE, dd MMM yyyy")}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatTimeIST(appointment.startAt, "hh:mm a")}{" "}
                          -{" "}
                          {formatTimeIST(appointment.endAt, "hh:mm a")}
                        </p>
                      </div>
                    </div>

                    {/* Booking Time */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">
                          Booking Time
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDateIST(appointment.createdAt, "EEE, dd MMM yyyy")}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatTimeIST(appointment.createdAt, "hh:mm a")}
                        </p>
                      </div>
                    </div>

                    {/* Plan Name */}
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">Plan</p>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {appointment.planName}
                        </p>
                        {appointment.planSlug === "baby-solid-food" && (
                          <BabySolidPlanOptions
                            selectedPackageName={appointment.planPackageName}
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
                        <CreditCard className="w-4 h-4 text-slate-400" />
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

                    {/* Status Dropdown (for PENDING/CONFIRMED) */}
                    {(appointment.status === "PENDING" ||
                      appointment.status === "CONFIRMED") && (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                          Update Status
                        </label>
                        <select
                          value={appointment.status}
                          onChange={(e) =>
                            handleStatusChange(
                              appointment.id,
                              e.target.value as "CANCELLED" | "COMPLETED"
                            )
                          }
                          disabled={updatingStatus === appointment.id}
                          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                          <option value={appointment.status} disabled>
                            {appointment.status === "PENDING"
                              ? "Pending"
                              : "Confirmed"}
                          </option>
                          <option value="CANCELLED">Cancel</option>
                          <option value="COMPLETED">Complete</option>
                        </select>
                        {updatingStatus === appointment.id && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Updating...
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-2">
                    <button
                      onClick={() => handleViewDetails(appointment.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => openDeleteModal(appointment.id)}
                      disabled={
                        deletingId === appointment.id || deleteModalOpen
                      }
                      className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title="Delete appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gradient-to-br from-emerald-50/80 to-white rounded-xl shadow-md shadow-emerald-100/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-emerald-200/60">
            <div className="text-sm font-semibold text-slate-800">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} appointments
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-white border-2 border-emerald-300/60 rounded-lg hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-300/60 flex items-center gap-1.5 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="text-sm font-semibold text-slate-800 px-3 py-1.5 bg-white/60 rounded-lg border border-emerald-200/40">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-white border-2 border-emerald-300/60 rounded-lg hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-300/60 flex items-center gap-1.5 transition-all duration-200"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAppointment}
        isLoading={deletingId !== null}
        title="Delete Appointment from Admin Dashboard"
        message="This will remove the appointment from the admin dashboard only. The user will still be able to see their appointment. This action cannot be undone."
      />

      {/* Success Notification */}
      <SuccessNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message="Appointment deleted successfully!"
        duration={3000}
      />
    </main>
  );
}
