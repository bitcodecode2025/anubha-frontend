"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import SuccessNotification from "@/components/admin/SuccessNotification";
import BabySolidPlanOptions from "@/components/appointments/BabySolidPlanOptions";

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modeFilter, setModeFilter] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAppointments();
    }
  }, [page, statusFilter, modeFilter, user]);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (modeFilter) params.mode = modeFilter;

      const response = await getAdminAppointments(params);
      setAppointments(response.appointments);
      setTotal(response.total);
    } catch (error: any) {
      console.error("Failed to fetch appointments:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleViewDetails(appointmentId: string) {
    router.push(`/admin/appointments/${appointmentId}`);
  }

  async function handleStatusChange(
    appointmentId: string,
    newStatus: "CANCELLED" | "COMPLETED"
  ) {
    setUpdatingStatus(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      toast.success(`Appointment marked as ${newStatus.toLowerCase()}`);
      fetchAppointments();
    } catch (error: any) {
      console.error("Failed to update status:", error);
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

    setDeletingId(appointmentToDelete);
    try {
      await deleteAppointment(appointmentToDelete);
      setDeleteModalOpen(false);
      setShowSuccessNotification(true);
      fetchAppointments();
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

  const totalPages = Math.ceil(total / limit);

  if (authLoading || loading) {
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

  if (user?.role !== "ADMIN") {
    return null;
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4">
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
                          {new Date(appointment.startAt).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(appointment.startAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}{" "}
                          -{" "}
                          {new Date(appointment.endAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
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
                          {new Date(appointment.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(appointment.createdAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200">
            <div className="text-sm text-slate-700">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} appointments
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="text-sm text-slate-700 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
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
