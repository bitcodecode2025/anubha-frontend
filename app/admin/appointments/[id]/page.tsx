"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getAppointmentDetails,
  type AppointmentDetails,
} from "@/lib/appointments-admin";
import {
  Loader2,
  User,
  FileText,
  Image as ImageIcon,
  Stethoscope,
  ChevronLeft,
  X,
  ZoomIn,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getDoctorNotes } from "@/lib/doctor-notes-api";
import DoctorNotesPreview from "@/components/doctor-notes/DoctorNotesPreview";
import BabySolidPlanOptions from "@/components/appointments/BabySolidPlanOptions";

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

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null
  );
  const [loadingData, setLoadingData] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState<any>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const appointmentId = params.id as string;

  // 🔒 ROUTE PROTECTION: Wait for backend auth, then check permissions
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

  useEffect(() => {
    // CRITICAL: Do NOT call APIs until backend auth_token cookie is ready
    if (!user || user.role !== "ADMIN") return;
    if (!appointmentId) return;

    fetchAppointmentDetails();
    fetchDoctorNotes();
  }, [appointmentId, user]);

  async function fetchAppointmentDetails() {
    setLoadingData(true);
    try {
      const response = await getAppointmentDetails(appointmentId);
      setAppointment(response.appointment);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load appointment details"
      );
      router.push("/admin/appointments");
    } finally {
      setLoadingData(false);
    }
  }

  async function fetchDoctorNotes() {
    setLoadingNotes(true);
    try {
      const response = await getDoctorNotes(appointmentId);
      if (response.success && response.doctorNotes) {
        setDoctorNotes(response.doctorNotes);
      } else {
        setDoctorNotes(null);
      }
    } catch (error: any) {
      setDoctorNotes(null);
    } finally {
      setLoadingNotes(false);
    }
  }

  function handleNotesSaved() {
    // Guard: Do not proceed if backend token is not ready
    if (!user || user.role !== "ADMIN") {
      return;
    }
    // Refresh doctor notes after save
    fetchDoctorNotes();
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
      toast.error("Failed to download image");
    }
  }

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
              onClick={() => router.push("/admin/appointments")}
              className="mt-4 text-emerald-600 hover:text-emerald-700"
            >
              Back to Appointments
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
            onClick={() => router.push("/admin/appointments")}
            className="text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Appointments
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
              <div className="text-sm text-slate-600 mb-1">Slot Time</div>
              <div className="font-medium text-slate-900">
                {new Date(
                  appointment.slot?.startAt || appointment.startAt
                ).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {new Date(
                  appointment.slot?.startAt || appointment.startAt
                ).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                -{" "}
                {new Date(
                  appointment.slot?.endAt || appointment.endAt
                ).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Booking Time</div>
              <div className="font-medium text-slate-900">
                {new Date(appointment.createdAt).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {new Date(appointment.createdAt).toLocaleTimeString("en-IN", {
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
                <div className="font-medium text-slate-900">
                  {appointment.patient.gender}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Weight</div>
                <div className="font-medium text-slate-900">
                  {appointment.patient.weight} kg
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Height</div>
                <div className="font-medium text-slate-900">
                  {appointment.patient.height} cm
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-600 mb-1">Date of Birth</div>
                <div className="font-medium text-slate-900">
                  {new Date(appointment.patient.dateOfBirth).toLocaleDateString(
                    "en-IN"
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Address</div>
              <div className="font-medium text-slate-900 break-words">
                {appointment.patient.address}
              </div>
            </div>
            {appointment.patient.medicalHistory && (
              <div>
                <div className="text-sm text-slate-600 mb-1">
                  Medical History
                </div>
                <div className="font-medium text-slate-900 break-words">
                  {appointment.patient.medicalHistory}
                </div>
              </div>
            )}
            {appointment.patient.appointmentConcerns && (
              <div>
                <div className="text-sm text-slate-600 mb-1">
                  Appointment Concerns
                </div>
                <div className="font-medium text-slate-900 break-words">
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

        {/* Doctor Notes */}
        {appointment.DoctorFormSession &&
          appointment.DoctorFormSession.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Doctor Notes
              </h3>
              <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                {appointment.DoctorFormSession.map((session) => (
                  <div key={session.id} className="space-y-4">
                    {/* Session Notes */}
                    {session.notes && (
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-sm font-semibold text-slate-700 mb-2">
                          Additional Notes:
                        </div>
                        <div className="text-slate-900 whitespace-pre-wrap">
                          {session.notes}
                        </div>
                      </div>
                    )}

                    {/* Field Values */}
                    {session.values && session.values.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-slate-700 mb-2">
                          Form Fields:
                        </div>
                        {session.values.map((value) => {
                          let displayValue: string | null = null;

                          // Determine display value based on field type
                          if (value.stringValue !== null) {
                            displayValue = value.stringValue;
                          } else if (value.numberValue !== null) {
                            displayValue = String(value.numberValue);
                          } else if (value.booleanValue !== null) {
                            displayValue = value.booleanValue ? "Yes" : "No";
                          } else if (value.dateValue !== null) {
                            displayValue = new Date(
                              value.dateValue
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            });
                          } else if (value.timeValue !== null) {
                            displayValue = value.timeValue;
                          } else if (value.jsonValue !== null) {
                            if (Array.isArray(value.jsonValue)) {
                              displayValue = value.jsonValue.join(", ");
                            } else {
                              displayValue = JSON.stringify(value.jsonValue);
                            }
                          }

                          if (displayValue === null) return null;

                          return (
                            <div
                              key={value.id}
                              className="bg-white rounded-lg p-4 border border-slate-200"
                            >
                              <div className="text-sm font-semibold text-slate-700 mb-1">
                                {value.field.label}
                              </div>
                              <div className="text-slate-900">
                                {displayValue}
                              </div>
                              {value.notes && (
                                <div className="text-sm text-slate-600 mt-2 pt-2 border-t border-slate-200">
                                  <strong>Note:</strong> {value.notes}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Last Updated */}
                    {(session.updatedAt || session.createdAt) && (
                      <div className="text-xs text-slate-500 pt-2 border-t border-emerald-200">
                        Last updated:{" "}
                        {new Date(
                          session.updatedAt || session.createdAt || new Date()
                        ).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Doctor Notes Preview */}
        {loadingNotes ? (
          <div className="border-t border-slate-200 pt-6 mb-6">
            <div className="bg-slate-50 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ) : doctorNotes ? (
          <div className="border-t border-slate-200 pt-6 mb-6">
            <DoctorNotesPreview
              formData={doctorNotes.formData}
              createdAt={doctorNotes.createdAt}
              updatedAt={doctorNotes.updatedAt}
              isDraft={doctorNotes.isDraft}
              attachments={doctorNotes.attachments}
              onAttachmentDeleted={async () => {
                // Refresh doctor notes after deletion
                try {
                  const response = await getDoctorNotes(appointmentId);
                  if (response.success && response.doctorNotes) {
                    setDoctorNotes(response.doctorNotes);
                  }
                } catch (error) {
                }
              }}
              onEdit={() =>
                router.push(`/admin/appointments/${appointmentId}/notes`)
              }
            />
          </div>
        ) : null}

        {/* Add Doctor Notes Button */}
        <div className="border-t border-slate-200 pt-6">
          <button
            onClick={() =>
              router.push(`/admin/appointments/${appointmentId}/notes`)
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Stethoscope className="w-5 h-5" />
            {doctorNotes ? "Edit Doctor Notes" : "+ Add Doctor Notes"}
          </button>
        </div>
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
