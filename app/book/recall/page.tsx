"use client";

import React, { useEffect, useState } from "react";
import { useBookingForm } from "../context/BookingFormContext";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  UploadCloud,
  X,
  AlertCircle,
} from "lucide-react";
import { createPatient } from "@/lib/patient";
import {
  uploadFiles,
  deleteFile,
  linkFilesToPatient,
  UploadedFile,
} from "@/lib/upload";
import { createRecall } from "@/lib/recall";
import { createAppointment } from "@/lib/appointment";
import toast from "react-hot-toast";

/* -------------------------------
   Types
----------------------------------*/
type RecallEntry = {
  id: string;
  mealType: string;
  time: string;
  foodItem: string;
  quantity: string;
  notes?: string;
};

const MEAL_TYPES = [
  { value: "PRE_WAKEUP", label: "Pre-wakeup" },
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "MID_MEAL", label: "Mid-meal" },
  { value: "LUNCH", label: "Lunch" },
  { value: "MID_EVENING", label: "Mid-evening" },
  { value: "DINNER", label: "Dinner" },
  { value: "OTHER", label: "Other" },
];

export default function RecallPage() {
  const { form, setForm } = useBookingForm();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  /* -------------------------------------------------
      BLOCK DIRECT ACCESS - Ensure plan details and patient exist
  --------------------------------------------------*/
  useEffect(() => {
    // Allow a small delay for form context to load from localStorage
    const timer = setTimeout(() => {
      // Check if plan details are present (planPackageDuration is optional for general consultation)
      if (!form.planSlug || !form.planName || !form.planPriceRaw) {
        console.log(
          "[RECALL PAGE] Missing plan details, redirecting to services"
        );
        toast.error("Please select a plan first");
        router.replace("/services");
        return;
      }

      // Check if patient exists (required for recall)
      if (!form.patientId) {
        console.log(
          "[RECALL PAGE] Missing patientId, redirecting to user-details"
        );
        toast.error("Please complete the user details form first");
        router.replace("/book/user-details");
        return;
      }
    }, 200); // Small delay to allow form context to load

    return () => clearTimeout(timer);
  }, [form.planSlug, form.planName, form.planPriceRaw, form.patientId, router]);

  /* -------------------------------
     Helpers
  ----------------------------------*/
  function createEntry(): RecallEntry {
    return {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      mealType: "",
      time: "",
      foodItem: "",
      quantity: "",
      notes: "",
    };
  }

  /* -------------------------------
     Always keep at least ONE card
  ----------------------------------*/
  const recallEntries: RecallEntry[] =
    form.recallEntries && form.recallEntries.length > 0
      ? form.recallEntries
      : [createEntry()];

  /* -------------------------------
     Handlers
  ----------------------------------*/
  function addEntry() {
    setForm({
      recallEntries: [...recallEntries, createEntry()],
    });
  }

  function deleteEntry(id: string) {
    let updated = recallEntries.filter((e) => e.id !== id);

    // Always keep ONE entry minimum
    if (updated.length === 0) updated = [createEntry()];

    setForm({ recallEntries: updated });
  }

  function updateEntry(
    id: string,
    field: keyof Omit<RecallEntry, "id">,
    value: string
  ) {
    const updated = recallEntries.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry
    );

    setForm({ recallEntries: updated });
  }

  function updateUniversalNotes(value: string) {
    setForm({ recallNotes: value });
  }

  function updateAppointmentConcerns(value: string) {
    setForm({ appointmentConcerns: value });
  }

  /* -------------------------------
     FILE UPLOAD HANDLERS
  ----------------------------------*/
  async function handleFileUpload(files: FileList | File[]) {
    const fileArray = Array.from(files);

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const invalidFiles = fileArray.filter(
      (f) => !allowedTypes.includes(f.type.toLowerCase())
    );

    if (invalidFiles.length > 0) {
      toast.error("Only JPG, PNG, and JPEG images are allowed");
      return;
    }

    // Check if patient exists
    if (!form.patientId) {
      toast.error("Please complete the user details form first");
      router.push("/book/user-details");
      return;
    }

    setUploadingFiles(true);
    setError(null);

    try {
      const uploaded = await uploadFiles(fileArray);

      // Link files to patient if patient exists
      if (form.patientId && uploaded.length > 0) {
        const fileIds = uploaded.map((f) => f.id);
        try {
          await linkFilesToPatient(form.patientId, fileIds);
        } catch (err) {
          // If link fails, files are still uploaded but not linked
          // This is okay, they can be linked later
          console.warn("Failed to link files to patient:", err);
        }
      }

      setUploadedFiles((prev) => [...prev, ...uploaded]);
      toast.success(`Successfully uploaded ${uploaded.length} file(s)`);
    } catch (err: any) {
      console.error("File upload error:", err);
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload files. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploadingFiles(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFileUpload(e.target.files);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
  }

  async function handleDeleteFile(fileId: string) {
    setDeletingFileId(fileId);
    setError(null);

    try {
      await deleteFile(fileId);
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File deleted successfully");
    } catch (err: any) {
      console.error("File delete error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete file. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setDeletingFileId(null);
    }
  }

  async function submitRecall() {
    console.log("[RECALL SUBMISSION] User clicked 'Save & Continue'");
    console.log("[RECALL SUBMISSION] Current form state:", {
      patientId: form.patientId,
      planSlug: form.planSlug,
      planName: form.planName,
      uploadedFilesCount: uploadedFiles.length,
    });

    setError(null);

    // Validate recall entries
    const validEntries = recallEntries.filter(
      (e) => e.mealType && e.time && e.foodItem && e.quantity
    );

    console.log("[RECALL SUBMISSION] Recall entries validation:", {
      totalEntries: recallEntries.length,
      validEntries: validEntries.length,
      entries: validEntries.map((e) => ({
        mealType: e.mealType,
        time: e.time,
        foodItem: e.foodItem,
        quantity: e.quantity,
      })),
    });

    if (validEntries.length === 0) {
      console.log("[RECALL SUBMISSION] No valid recall entries");
      setShowValidationModal(true);
      return;
    }

    // Patient should already be created when user filled the form
    if (!form.patientId) {
      console.error("[RECALL SUBMISSION] Patient ID missing");
      setError("Patient not found. Please go back and complete the form.");
      toast.error("Patient not found. Please go back and complete the form.");
      router.push("/book/user-details");
      return;
    }

    console.log(
      "[RECALL SUBMISSION] All validations passed, starting submission"
    );

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate plan details are present (planPackageDuration is optional for general consultation)
      if (!form.planSlug || !form.planName || !form.planPriceRaw) {
        console.error("[RECALL SUBMISSION] Plan details missing");
        setError("Plan details are missing. Please go back and select a plan.");
        toast.error(
          "Plan details are missing. Please go back and select a plan."
        );
        return;
      }

      console.log(
        "[RECALL SUBMISSION] Step 1: Linking uploaded files to patient"
      );
      // Link uploaded files to patient if any
      if (uploadedFiles.length > 0) {
        try {
          console.log(
            "[RECALL SUBMISSION] Linking files:",
            uploadedFiles.map((f) => f.id)
          );
          await linkFilesToPatient(
            form.patientId,
            uploadedFiles.map((f) => f.id)
          );
          console.log("[RECALL SUBMISSION] Files linked successfully");
        } catch (fileError: any) {
          console.log(
            "[RECALL SUBMISSION] File linking error:",
            fileError.message
          );
          // Don't fail the entire submission if file linking fails
          console.warn(
            "[RECALL SUBMISSION] Continuing despite file linking error"
          );
        }
      } else {
        console.log("[RECALL SUBMISSION] No files to link");
      }

      console.log(
        "[RECALL SUBMISSION] Step 2: Creating appointment with PENDING status"
      );

      // Validate and prepare appointment data
      // planDuration is required - use "40 min" for general consultation if not provided
      const planDuration = form.planPackageDuration || "40 min";

      // appointmentMode must be IN_PERSON or ONLINE
      // Ensure we always have a valid value
      let appointmentMode: "IN_PERSON" | "ONLINE" = "IN_PERSON"; // Default
      if (
        form.appointmentMode === "IN_PERSON" ||
        form.appointmentMode === "ONLINE"
      ) {
        appointmentMode = form.appointmentMode;
      } else if (form.appointmentMode) {
        // Try to normalize the value
        const normalized = form.appointmentMode
          .toUpperCase()
          .replace(/[^A-Z]/g, "_");
        if (normalized === "IN_PERSON" || normalized === "ONLINE") {
          appointmentMode = normalized as "IN_PERSON" | "ONLINE";
        }
      }

      // Create appointment with PENDING status first (to get appointmentId)
      // Extract price from planPriceRaw if available, otherwise parse from planPrice string
      let planPrice: number;
      if (form.planPriceRaw && form.planPriceRaw > 0) {
        planPrice = form.planPriceRaw;
      } else if (form.planPrice) {
        // Parse price from string like "₹6,800 per session" or "₹3,000"
        const priceMatch = form.planPrice.match(/₹?\s*([\d,]+)/);
        planPrice = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : 0;

        if (!planPrice || planPrice === 0) {
          console.error(
            `[RECALL] Failed to parse price from: "${form.planPrice}"`
          );
          throw new Error(`Invalid plan price. Please select a plan again.`);
        }
      } else {
        throw new Error(`Plan price is missing. Please select a plan again.`);
      }

      const appointmentData = {
        patientId: form.patientId,
        planSlug: form.planSlug,
        planName: form.planName,
        planPrice: planPrice, // Correctly parsed from planPriceRaw or planPrice string
        planDuration: planDuration, // Always provide a duration (required field)
        planPackageName: form.planPackageName || undefined,
        appointmentMode: appointmentMode, // Always valid: "IN_PERSON" or "ONLINE"
      };

      console.log("[RECALL SUBMISSION] Appointment data:", {
        ...appointmentData,
        planPrice: `₹${appointmentData.planPrice}`,
      });

      const appointmentResponse = await createAppointment({
        ...appointmentData,
        bookingProgress: "RECALL", // User has completed recall, next step is slot
      });

      console.log("[RECALL SUBMISSION] Appointment created:", {
        success: appointmentResponse.success,
        appointmentId: appointmentResponse.data?.id,
        status: appointmentResponse.data?.status,
      });

      if (!appointmentResponse.success || !appointmentResponse.data?.id) {
        throw new Error("Failed to create appointment");
      }

      console.log("[RECALL SUBMISSION] Step 3: Creating recall with entries");
      // Create recall with entries and link to appointment
      const recallData = {
        patientId: form.patientId,
        notes: form.recallNotes || undefined,
        entries: validEntries.map((e) => ({
          mealType: e.mealType,
          time: e.time,
          foodItem: e.foodItem,
          quantity: e.quantity,
          notes: e.notes || undefined,
        })),
        appointmentId: appointmentResponse.data.id, // Link recall to appointment
      };

      console.log("[RECALL SUBMISSION] Recall data:", {
        patientId: recallData.patientId,
        entriesCount: recallData.entries.length,
        hasNotes: !!recallData.notes,
        appointmentId: recallData.appointmentId,
      });

      const recallResponse = await createRecall(recallData);

      console.log("[RECALL SUBMISSION] Recall created:", {
        success: recallResponse.success,
        recallId: recallResponse.data?.id,
      });

      // Store appointmentId in form context for slot selection
      console.log(
        "[RECALL SUBMISSION] Storing appointmentId in form context:",
        appointmentResponse.data.id
      );
      setForm({ appointmentId: appointmentResponse.data.id });

      console.log("[RECALL SUBMISSION] All steps completed successfully");
      toast.success("Recall and appointment saved successfully!");
      router.push("/book/slot");
    } catch (error: any) {
      console.error("[RECALL SUBMISSION] Error:", error);
      console.error("[RECALL SUBMISSION] Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
      });

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log("🏁 [RECALL SUBMISSION] Submission process completed");
    }
  }

  function goBack() {
    router.push("/book/user-details");
  }

  /* -------------------------------
     UI
  ----------------------------------*/
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f9fcfa] to-[#f1f7f3] py-10 px-4 sm:px-6 flex justify-center">
      {/* Validation Modal */}
      {showValidationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setShowValidationModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Incomplete Recall Entry
              </h3>

              {/* Message */}
              <p className="text-slate-600 mb-6">
                Please add at least one complete recall entry with all required
                fields filled (meal type, time, food item, and quantity).
              </p>

              {/* Button */}
              <button
                onClick={() => setShowValidationModal(false)}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Got it, I'll fill the form
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* PLAN BANNER */}
        {form.planName && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <p className="font-semibold text-emerald-900 text-lg">
              Booking: {form.planName}
              {form.planPackageName ? ` — ${form.planPackageName}` : ""}
            </p>
            <p className="text-emerald-700 text-sm">Price: {form.planPrice}</p>
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl font-semibold text-emerald-700 mb-2">
          Recall & Medical Information
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Complete your 24-hour diet recall, upload medical reports, and share
          any appointment concerns.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Upload Medical Reports Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Medical Reports
          </h3>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload Medical Reports (optional)
          </label>

          {/* Drag & Drop */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`
              border-2 rounded-xl p-5 text-center transition-all cursor-pointer
              ${
                dragActive
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-300 bg-white"
              }
              ${uploadingFiles ? "opacity-50 pointer-events-none" : ""}
            `}
          >
            <label
              htmlFor="report-upload"
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              {uploadingFiles ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <div className="text-sm text-slate-600">Uploading...</div>
                </>
              ) : (
                <>
                  <span className="p-3 bg-emerald-50 rounded-full text-emerald-700">
                    <UploadCloud size={22} />
                  </span>
                  <div className="text-sm text-slate-600">
                    Tap to upload or drag images here
                  </div>
                  <div className="text-xs text-slate-400">
                    JPG, PNG, JPEG only · Max 10MB per file
                  </div>
                </>
              )}

              <input
                id="report-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                className="hidden"
                onChange={onFileChange}
                disabled={uploadingFiles}
              />
            </label>
          </div>

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative group rounded-lg overflow-hidden border"
                >
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className="w-full h-24 object-cover"
                  />
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deletingFileId === file.id}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black text-white p-1 rounded-full transition disabled:opacity-50"
                  >
                    {deletingFileId === file.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <X size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment Concerns Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Appointment Concerns
          </h3>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Share Your Concerns (optional)
          </label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
            placeholder="Share any concerns or questions you have for your appointment"
            value={form.appointmentConcerns || ""}
            onChange={(e) => updateAppointmentConcerns(e.target.value)}
          />
        </div>

        {/* Diet Recall Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            24-Hour Diet Recall
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Add everything you ate and drank in the last 24 hours.
          </p>

          {/* Add Entry Button */}
          <button
            onClick={addEntry}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Add food entry
          </button>

          {/* Entry Cards */}
          <div className="space-y-6 mb-8">
            {recallEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="border border-slate-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Entry {index + 1}
                  </h3>

                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="flex items-center gap-1 text-red-500 text-xs hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Meal Type */}
                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Meal type
                    </label>
                    <select
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={entry.mealType}
                      onChange={(e) =>
                        updateEntry(entry.id, "mealType", e.target.value)
                      }
                    >
                      <option value="">Select meal type</option>
                      {MEAL_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={entry.time}
                      onChange={(e) =>
                        updateEntry(entry.id, "time", e.target.value)
                      }
                    />
                  </div>

                  {/* Food Item */}
                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Food item
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Poha"
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={entry.foodItem}
                      onChange={(e) =>
                        updateEntry(entry.id, "foodItem", e.target.value)
                      }
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Quantity / portion
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1 bowl"
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={entry.quantity}
                      onChange={(e) =>
                        updateEntry(entry.id, "quantity", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Entry Notes */}
                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-600">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Anything special about this intake?"
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    value={entry.notes ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.id, "notes", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UNIVERSAL NOTES SECTION */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-8">
          <h3 className="font-semibold text-slate-800 mb-2 text-sm">
            Additional notes (overall)
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Share anything else the dietitian should know — cravings, sleep,
            routine, stress, hydration, eating patterns, or anything personal.
          </p>
          <textarea
            rows={4}
            placeholder="Write here..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            value={form.recallNotes ?? ""}
            onChange={(e) => updateUniversalNotes(e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between">
          <button
            onClick={goBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-100"
          >
            ← Back
          </button>

          <button
            onClick={submitRecall}
            disabled={isSubmitting}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue →"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
