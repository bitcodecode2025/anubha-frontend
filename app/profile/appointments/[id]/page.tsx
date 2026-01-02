"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getUserAppointmentDetails,
  type UserAppointmentDetails,
} from "@/lib/appointments-user";
import {
  Loader2,
  User,
  FileText,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronLeft,
  X,
  ZoomIn,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Receipt,
  FilePlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import BabySolidPlanOptions from "@/components/appointments/BabySolidPlanOptions";
import {
  getInvoiceByAppointmentId,
  downloadInvoice,
  generateInvoice,
  type Invoice,
} from "@/lib/invoice";

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-slate-200 rounded w-1/3"></div>

      {/* Appointment Info Skeleton */}
      <div className="bg-emerald-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Patient Details Skeleton */}
      <div>
        <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Recall History Skeleton */}
      <div>
        <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-4">
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Files Skeleton */}
      <div>
        <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserAppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [appointment, setAppointment] = useState<UserAppointmentDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState(false);

  const appointmentId = params.id as string;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // CRITICAL: Do NOT call APIs while auth is loading or user is null
    if (authLoading) return; // Wait for auth to resolve
    if (!user) return; // Do not call APIs if user is null
    if (!appointmentId) return; // Need appointment ID

    fetchAppointmentDetails();
  }, [appointmentId, user, authLoading]);

  async function fetchAppointmentDetails() {
    setLoading(true);
    try {
      const response = await getUserAppointmentDetails(appointmentId);
      setAppointment(response.appointment);

      // Fetch invoice if appointment is confirmed
      if (response.appointment.status === "CONFIRMED") {
        fetchInvoice();
      }
    } catch (error: any) {
      console.error("Failed to fetch appointment details:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load appointment details"
      );
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvoice() {
    setLoadingInvoice(true);
    setInvoiceError(false);
    try {
      const response = await getInvoiceByAppointmentId(appointmentId);
      if (response.success && response.invoice) {
        setInvoice(response.invoice);
        setInvoiceError(false);
      } else {
        // Invoice not found - this is expected, user can generate it
        setInvoice(null);
        setInvoiceError(false); // Not an error - invoice just doesn't exist yet
      }
    } catch (error: any) {
      console.error("Failed to fetch invoice:", error);
      setInvoice(null);
      // Only set error for non-404 errors
      if (error?.response?.status !== 404) {
        setInvoiceError(true);
      } else {
        setInvoiceError(false); // 404 means invoice doesn't exist yet
      }
    } finally {
      setLoadingInvoice(false);
    }
  }

  async function handleGenerateInvoice() {
    if (!appointmentId) return;

    setGeneratingInvoice(true);
    setInvoiceError(false);
    try {
      const response = await generateInvoice(appointmentId);
      if (response.success && response.invoice) {
        setInvoice(response.invoice);
        toast.success("Invoice generated successfully");
        // Refresh invoice to get full details
        await fetchInvoice();
      } else {
        toast.error(response.error || "Failed to generate invoice");
        setInvoiceError(true);
      }
    } catch (error: any) {
      console.error("Failed to generate invoice:", error);
      toast.error(error.message || "Failed to generate invoice");
      setInvoiceError(true);
    } finally {
      setGeneratingInvoice(false);
    }
  }

  async function handleDownloadInvoice() {
    if (!invoice) return;

    setDownloadingInvoice(true);
    try {
      await downloadInvoice(invoice.invoiceNumber);
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      console.error("Failed to download invoice:", error);
      toast.error(error.message || "Failed to download invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  }

  async function handleDownloadImage(imageUrl: string, fileName: string) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully");
    } catch (error: any) {
      console.error("Failed to download image:", error);
      toast.error("Failed to download image");
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="h-6 bg-slate-200 rounded w-24 animate-pulse"></div>
          </div>
          <SkeletonLoader />
        </div>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-slate-500">Appointment not found</p>
            <button
              onClick={() => router.push("/profile")}
              className="mt-4 text-emerald-600 hover:text-emerald-700"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/profile")}
            className="text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Appointment Details
          </h1>
          <p className="text-slate-600">
            View complete appointment and patient information
          </p>
        </div>

        {/* Appointment Info */}
        <div className="bg-emerald-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Date & Time</div>
              <div className="font-medium text-slate-900">
                {new Date(appointment.startAt).toLocaleString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-slate-600 mb-1">Plan</div>
              <div className="font-medium text-slate-900">
                {appointment.planName}
              </div>
              {appointment.planSlug === "baby-solid-food" && (
                <BabySolidPlanOptions
                  selectedPackageName={appointment.planPackageName}
                  variant="detailed"
                />
              )}
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Mode</div>
              <div className="font-medium text-slate-900">
                {appointment.mode === "IN_PERSON" ? "In-Person" : "Online"}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Status</div>
              <div className="font-medium text-slate-900">
                {appointment.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Payment Status</div>
              <div className="font-medium text-slate-900">
                {appointment.paymentStatus}
              </div>
            </div>
            {appointment.amount && (
              <div>
                <div className="text-sm text-slate-600 mb-1">Amount</div>
                <div className="font-medium text-slate-900">
                  ₹{appointment.amount}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Details */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Details
          </h3>
          <div className="bg-slate-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Name</div>
                <div className="font-medium text-slate-900 break-words">
                  {appointment.patient.name}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Phone</div>
                <div className="font-medium text-slate-900 break-words">
                  {appointment.patient.phone}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Email</div>
                <div className="font-medium text-slate-900 break-words break-all">
                  {appointment.patient.email}
                </div>
              </div>
              <div className="min-w-0 flex-shrink-0">
                <div className="text-sm text-slate-600 mb-1">Age</div>
                <div className="font-medium text-slate-900">
                  {appointment.patient.age} years
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Gender</div>
                <div className="font-medium text-slate-900 break-words">
                  {appointment.patient.gender}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Weight</div>
                <div className="font-medium text-slate-900 break-words">
                  {appointment.patient.weight} kg
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Height</div>
                <div className="font-medium text-slate-900 break-words">
                  {appointment.patient.height} cm
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Date of Birth</div>
                <div className="font-medium text-slate-900 break-words">
                  {new Date(appointment.patient.dateOfBirth).toLocaleDateString(
                    "en-IN"
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Address</div>
              <div className="font-medium text-slate-900">
                {appointment.patient.address}
              </div>
            </div>
            {appointment.patient.medicalHistory && (
              <div>
                <div className="text-sm text-slate-600 mb-1">
                  Medical History
                </div>
                <div className="font-medium text-slate-900">
                  {appointment.patient.medicalHistory}
                </div>
              </div>
            )}
            {appointment.patient.appointmentConcerns && (
              <div>
                <div className="text-sm text-slate-600 mb-1">
                  Appointment Concerns
                </div>
                <div className="font-medium text-slate-900">
                  {appointment.patient.appointmentConcerns}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Recall History */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recall History
          </h3>
          {appointment.patient.recalls.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-500">
              No recall entries found
            </div>
          ) : (
            <div className="space-y-4">
              {appointment.patient.recalls.map((recall) => (
                <div
                  key={recall.id}
                  className="bg-slate-50 rounded-lg p-6 border border-slate-200"
                >
                  <div className="text-sm text-slate-600 mb-3">
                    {new Date(recall.createdAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  {recall.notes && (
                    <div className="text-sm text-slate-700 mb-4 p-3 bg-white rounded border border-slate-200">
                      <strong>Notes:</strong> {recall.notes}
                    </div>
                  )}
                  <div className="space-y-2">
                    {recall.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-white rounded p-3 border border-slate-200"
                      >
                        <div className="font-medium text-slate-900 mb-1">
                          {entry.mealType} - {entry.time}
                        </div>
                        <div className="text-slate-600">
                          {entry.foodItem} ({entry.quantity})
                        </div>
                        {entry.notes && (
                          <div className="text-slate-500 text-sm mt-1">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invoice Section - Only show if appointment is confirmed */}
        {appointment.status === "CONFIRMED" && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Invoice
            </h3>
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              {loadingInvoice ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="ml-2 text-slate-600">
                    Loading invoice...
                  </span>
                </div>
              ) : invoice ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">
                      Invoice Number
                    </div>
                    <div className="font-medium text-slate-900">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Generated on{" "}
                      {new Date(invoice.invoiceDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingInvoice ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Get Invoice
                      </>
                    )}
                  </button>
                </div>
              ) : invoiceError ? (
                <div className="text-center py-8">
                  <div className="text-slate-600 mb-4">
                    Invoice generation failed. Please try again or contact
                    support.
                  </div>
                  <button
                    onClick={handleGenerateInvoice}
                    disabled={generatingInvoice}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingInvoice ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FilePlus className="w-4 h-4" />
                        Try Again
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-600 mb-4">
                    Invoice not generated yet. Click the button below to
                    generate your invoice.
                  </div>
                  <button
                    onClick={handleGenerateInvoice}
                    disabled={generatingInvoice}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingInvoice ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Invoice...
                      </>
                    ) : (
                      <>
                        <FilePlus className="w-4 h-4" />
                        Generate Invoice
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Uploaded Reports */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Uploaded Reports
          </h3>
          {appointment.patient.files.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-500">
              No reports uploaded
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {appointment.patient.files.map((file) => (
                <div
                  key={file.id}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (file.mimeType && file.mimeType.startsWith("image/")) {
                      setSelectedImage(file.url);
                    }
                  }}
                >
                  {file.mimeType && file.mimeType.startsWith("image/") ? (
                    <div className="relative">
                      <img
                        src={file.url}
                        alt={file.fileName}
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded mb-2 flex items-center justify-center transition-colors">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(file.url, file.fileName);
                        }}
                        className="absolute bottom-2 right-2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-slate-200 rounded mb-2 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium block truncate"
                  >
                    {file.fileName}
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
