"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Save, ChevronDown, ChevronUp, Upload, FileText, ExternalLink, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  DoctorNotesFormData,
  saveDoctorNotes,
  getDoctorNotes,
  updateDoctorNotes,
} from "@/lib/doctor-notes-api";
import { uploadPDFFiles, type UploadedPDF } from "@/lib/pdf-upload";
import AppointmentPreview from "./AppointmentPreview";
import { AppointmentDetails } from "@/lib/appointments-admin";
import { useDoctorNotes } from "@/app/context/DoctorNotesContext";

interface DoctorNotesFormProps {
  appointmentId: string;
  appointment?: AppointmentDetails;
  patientName?: string;
  planName?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function DoctorNotesForm({
  appointmentId,
  appointment,
  patientName,
  planName,
  onSave,
  onCancel,
}: DoctorNotesFormProps) {
  // Use context for form data management
  const {
    formData,
    updateFormData,
    getFormValue,
    clearFormData,
    hasUnsavedChanges,
    lastSaved,
    isAutoSaving,
  } = useDoctorNotes();

  const [originalFormData, setOriginalFormData] = useState<DoctorNotesFormData>(
    {}
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasExistingNotes, setHasExistingNotes] = useState(false);
  const [saveStartTime, setSaveStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["section1"])
  );

  // Update elapsed time every second when saving
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (saving && saveStartTime) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - saveStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [saving, saveStartTime]);

  // Load existing notes on mount to check if notes exist in database
  useEffect(() => {
    loadExistingNotes();
  }, [appointmentId]);

  async function loadExistingNotes() {
    setLoading(true);
    try {
      console.log(
        "[FORM] Loading existing notes for appointment:",
        appointmentId
      );
      const response = await getDoctorNotes(appointmentId);
      if (response.success && response.doctorNotes?.formData) {
        console.log("[FORM] Existing notes found in database");
        const loadedData = response.doctorNotes.formData;
        // Store original for change detection
        setOriginalFormData(JSON.parse(JSON.stringify(loadedData))); // Deep copy
        setHasExistingNotes(true);
      } else {
        console.log("[FORM] No existing notes found in database");
        setHasExistingNotes(false);
      }
    } catch (error: any) {
      console.error("[FORM] Failed to load doctor notes:", error);
      // Don't show error toast - it's okay if no notes exist yet
      setHasExistingNotes(false);
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  /**
   * Get only changed fields between original and current form data
   */
  function getChangedFields(
    original: any,
    current: any,
    path: string[] = []
  ): Partial<DoctorNotesFormData> {
    const changed: any = {};

    // Get all keys from both objects
    const allKeys = new Set([
      ...Object.keys(original || {}),
      ...Object.keys(current || {}),
    ]);

    for (const key of allKeys) {
      const currentPath = [...path, key];
      const originalValue = original?.[key];
      const currentValue = current?.[key];

      if (
        typeof originalValue === "object" &&
        typeof currentValue === "object" &&
        originalValue !== null &&
        currentValue !== null &&
        !Array.isArray(originalValue) &&
        !Array.isArray(currentValue)
      ) {
        // Recursively check nested objects
        const nestedChanges = getChangedFields(
          originalValue,
          currentValue,
          currentPath
        );
        if (Object.keys(nestedChanges).length > 0) {
          changed[key] = nestedChanges;
        }
      } else if (
        JSON.stringify(originalValue) !== JSON.stringify(currentValue)
      ) {
        // Field has changed
        changed[key] = currentValue;
      }
    }

    return changed;
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  async function handleSubmit(isDraft: boolean = false) {
    setSaving(true);
    setSaveStartTime(Date.now());

    try {
      // Validate file sizes before submission
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const filesToValidate = formData.dietPrescribed?.dietChartFiles || [];
      const oversizedFiles = filesToValidate.filter(
        (file: File) => file.size > MAX_FILE_SIZE
      );

      if (oversizedFiles.length > 0) {
        const errorMessages = oversizedFiles.map(
          (file: File) =>
            `${file.name}: File too large! Maximum allowed size is 10MB. (${formatFileSize(file.size)})`
        );
        errorMessages.forEach((msg) => {
          toast.error(msg, {
            duration: 6000,
            style: {
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              maxWidth: "500px",
            },
          });
        });
        setSaving(false);
        setSaveStartTime(null);
        return;
      }

      // Check if this is a partial update (has existing notes and only some fields changed)
      const changedFields = hasExistingNotes
        ? getChangedFields(originalFormData, formData)
        : null;

      const isPartialUpdate =
        hasExistingNotes &&
        changedFields &&
        Object.keys(changedFields).length > 0 &&
        Object.keys(changedFields).length < Object.keys(formData).length;

      console.log("[FORM] Submitting doctor notes");
      console.log("[FORM] Has existing notes:", hasExistingNotes);
      console.log("[FORM] Is partial update:", isPartialUpdate);
      if (changedFields) {
        console.log("[FORM] Changed fields:", Object.keys(changedFields));
      }

      let response;
      if (isPartialUpdate) {
        // Use PATCH for partial updates (fast)
        console.log("[FORM] Using PATCH for partial update");
        response = await updateDoctorNotes(
          appointmentId,
          changedFields,
          isDraft
        );
      } else {
        // Use POST for full submission (new notes or full update)
        console.log("[FORM] Using POST for full submission");
        response = await saveDoctorNotes({
          appointmentId,
          formData,
          isDraft,
        });
      }

      // Update original form data after successful save
      setOriginalFormData(JSON.parse(JSON.stringify(formData)));

      // Clear localStorage after successful submission (only if not a draft)
      if (!isDraft) {
        clearFormData();
        console.log("[FORM] Cleared localStorage after successful submission");
      }

      const duration = saveStartTime ? Date.now() - saveStartTime : 0;
      console.log(`[FORM] Save completed in ${duration}ms`);

      toast.success(
        isDraft
          ? "Draft saved successfully!"
          : isPartialUpdate
          ? "Changes saved successfully!"
          : "Doctor notes saved successfully!"
      );
      if (onSave) onSave();
    } catch (error: any) {
      const duration = saveStartTime ? Date.now() - saveStartTime : 0;
      
      // Log full error details for debugging
      console.error(`[FORM] Failed to save doctor notes (${duration}ms):`, {
        error,
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status,
        errorStatusText: error?.response?.statusText,
        errorStack: error?.stack,
      });
      
      // Extract error message from various possible formats
      let errorMessage = "Failed to save doctor notes";
      
      // Check for validation errors (array of error messages)
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(". ");
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.response?.statusText) {
        errorMessage = `${error.response.status} ${error.response.statusText}`;
      }
      
      // Show error toast with better formatting
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "500px",
        },
      });
    } finally {
      setSaving(false);
      setSaveStartTime(null);
    }
  }

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <div className="min-h-screen py-2 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
        {/* Appointment Preview */}
        {appointment && <AppointmentPreview appointment={appointment} />}

        {/* Header */}
        <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 bg-clip-text text-transparent mb-1 sm:mb-2 md:mb-3 px-2">
            Doctor Notes
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium px-2">
            Complete Intake Form
          </p>
          {patientName && planName && (
            <div className="mt-2 sm:mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-2 sm:p-3 md:p-4 mx-2 sm:mx-auto inline-block max-w-full">
              <p className="text-sm sm:text-base text-emerald-900 font-medium text-center sm:text-left">
                <span className="block sm:inline">
                  Patient: <span className="font-semibold">{patientName}</span>
                </span>
                <span className="hidden sm:inline"> | </span>
                <span className="block sm:inline mt-1 sm:mt-0">
                  Plan: <span className="font-semibold">{planName}</span>
                </span>
              </p>
            </div>
          )}
          {hasExistingNotes && (
            <div className="mt-2 sm:mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mx-2 sm:mx-auto inline-block">
              <p className="text-sm sm:text-base text-blue-900 font-medium">
                📝 Editing existing notes
              </p>
            </div>
          )}
          {/* Auto-save status indicator */}
          <div className="mt-2 sm:mt-3 mx-2 sm:mx-auto inline-block">
            {isAutoSaving && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <p className="text-sm sm:text-base text-amber-900 font-medium">
                  Auto-saving...
                </p>
              </div>
            )}
            {!isAutoSaving && hasUnsavedChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 flex items-center gap-2">
                <p className="text-sm sm:text-base text-yellow-900 font-medium">
                  ⚠️ Unsaved changes
                </p>
              </div>
            )}
            {!isAutoSaving && !hasUnsavedChanges && lastSaved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 flex items-center gap-2">
                <p className="text-sm sm:text-base text-green-900 font-medium">
                  ✓ Saved {new Date(lastSaved).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Personal Info */}
        <Section
          title="SECTION 1 — PERSONAL INFO"
          sectionId="section1"
          isOpen={openSections.has("section1")}
          onToggle={() => toggleSection("section1")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="sm:col-span-2">
              <TextArea
                label="Personal History"
                value={getFormValue(["personalHistory"]) || ""}
                onChange={(val) => updateFormData(["personalHistory"], val)}
              />
            </div>
            <div className="sm:col-span-2">
              <TextArea
                label="Reason for Joining Program"
                value={getFormValue(["reasonForJoiningProgram"]) || ""}
                onChange={(val) =>
                  updateFormData(["reasonForJoiningProgram"], val)
                }
              />
            </div>
            <Input
              label="Ethnicity"
              value={getFormValue(["ethnicity"]) || ""}
              onChange={(val) => updateFormData(["ethnicity"], val)}
            />
            <DateInput
              label="Joining Date"
              value={getFormValue(["joiningDate"]) || ""}
              onChange={(val) => updateFormData(["joiningDate"], val)}
            />
            <DateInput
              label="Expiry Date"
              value={getFormValue(["expiryDate"]) || ""}
              onChange={(val) => updateFormData(["expiryDate"], val)}
            />
            <DateInput
              label="Diet Prescription Date"
              value={getFormValue(["dietPrescriptionDate"]) || ""}
              onChange={(val) => updateFormData(["dietPrescriptionDate"], val)}
            />
            <div className="sm:col-span-2">
              <TextArea
                label="Duration of Diet"
                value={getFormValue(["durationOfDiet"]) || ""}
                onChange={(val) => updateFormData(["durationOfDiet"], val)}
              />
            </div>
            <div className="sm:col-span-2">
              <Radio
                label="Previous Diet Taken"
                options={["Yes", "No"]}
                value={getFormValue(["previousDietTaken"]) || ""}
                onChange={(val) => updateFormData(["previousDietTaken"], val)}
              />
            </div>
            <div className="sm:col-span-2">
              <TextArea
                label="If Yes, Mention Details"
                value={getFormValue(["previousDietDetails"]) || ""}
                onChange={(val) => updateFormData(["previousDietDetails"], val)}
              />
            </div>
            <Select
              label="Type of Diet Taken"
              options={["By Google", "By Experts"]}
              value={getFormValue(["typeOfDietTaken"]) || ""}
              onChange={(val) => updateFormData(["typeOfDietTaken"], val)}
            />
            <Select
              label="Marital Status"
              options={["Married", "Unmarried"]}
              value={getFormValue(["maritalStatus"]) || ""}
              onChange={(val) => updateFormData(["maritalStatus"], val)}
            />
            <Input
              label="Number of Children"
              type="number"
              value={
                getFormValue(["numberOfChildren"]) !== undefined &&
                getFormValue(["numberOfChildren"]) !== null
                  ? getFormValue(["numberOfChildren"])
                  : ""
              }
              onChange={(val) => {
                const numVal = val === "" ? 0 : val ? parseInt(val) : undefined;
                updateFormData(
                  ["numberOfChildren"],
                  numVal !== undefined && numVal !== null && !isNaN(numVal)
                    ? numVal
                    : 0
                );
              }}
            />
            <Select
              label="Diet Preference"
              options={["Veg", "Non-Veg", "Egg & Veg"]}
              value={getFormValue(["dietPreference"]) || ""}
              onChange={(val) => updateFormData(["dietPreference"], val)}
            />
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <TextArea
                label="Wakeup Time"
                value={getFormValue(["wakeupTime"]) || ""}
                onChange={(val) => updateFormData(["wakeupTime"], val)}
                small
              />
              <TextArea
                label="Bed Time"
                value={getFormValue(["bedTime"]) || ""}
                onChange={(val) => updateFormData(["bedTime"], val)}
                small
              />
              <TextArea
                label="Day Nap"
                value={getFormValue(["dayNap"]) || ""}
                onChange={(val) => updateFormData(["dayNap"], val)}
                small
              />
            </div>
            <Select
              label="Workout Timing"
              options={["Morning", "Afternoon", "Evening", "Night"]}
              value={getFormValue(["workoutTiming"]) || ""}
              onChange={(val) => updateFormData(["workoutTiming"], val)}
            />
            <Select
              label="Workout Type"
              options={["Sport Type", "Yoga", "Gym", "Homebase"]}
              value={getFormValue(["workoutType"]) || ""}
              onChange={(val) => updateFormData(["workoutType"], val)}
            />
          </div>
        </Section>

        {/* Section 2: 24-Hour Food Recall */}
        <Section
          title="SECTION 2 — 24-HOUR FOOD RECALL"
          sectionId="section2"
          isOpen={openSections.has("section2")}
          onToggle={() => toggleSection("section2")}
        >
          <FoodRecallSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
          />
        </Section>

        {/* Section 3: Weekend Diet */}
        <Section
          title="SECTION 3 — Weekend Diet"
          sectionId="section3"
          isOpen={openSections.has("section3")}
          onToggle={() => toggleSection("section3")}
        >
          <WeekendDietSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
          />
        </Section>

        {/* Section 4: Questionnaire */}
        <Section
          title="SECTION 4 — Questionnaire For Recall"
          sectionId="section4"
          isOpen={openSections.has("section4")}
          onToggle={() => toggleSection("section4")}
        >
          <QuestionnaireSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
          />
        </Section>

        {/* Section 5: Food Frequency */}
        <Section
          title="SECTION 5 — Food Frequency"
          sectionId="section5"
          isOpen={openSections.has("section5")}
          onToggle={() => toggleSection("section5")}
        >
          <FoodFrequencySection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
          />
        </Section>

        {/* Section 6: Health Profile */}
        <Section
          title="SECTION 6 — Health Profile"
          sectionId="section6"
          isOpen={openSections.has("section6")}
          onToggle={() => toggleSection("section6")}
        >
          <HealthProfileSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
          />
        </Section>

        {/* Section 7: Diet Prescribed */}
        <Section
          title="SECTION 7 — Diet Prescribed"
          sectionId="section7"
          isOpen={openSections.has("section7")}
          onToggle={() => toggleSection("section7")}
        >
          <DietPrescribedSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
          />
        </Section>

        {/* Section 8: Body Measurements */}
        <Section
          title="SECTION 8 — Body Measurements"
          sectionId="section8"
          isOpen={openSections.has("section8")}
          onToggle={() => toggleSection("section8")}
        >
          <BodyMeasurementsSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
          />
        </Section>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6 md:pb-8 px-2">
          <motion.button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-slate-200 text-slate-700 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 inline-block mr-2 animate-spin" />
                {elapsedTime > 0 ? `Saving... (${elapsedTime}s)` : "Saving..."}
              </>
            ) : (
              "Save Draft"
            )}
          </motion.button>
          <motion.button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-600 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 inline-block mr-2 animate-spin" />
                {elapsedTime > 0 ? `Saving... (${elapsedTime}s)` : "Saving..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" />
                {hasExistingNotes ? "Save Changes" : "Submit Form"}
              </>
            )}
          </motion.button>
          {onCancel && (
            <motion.button
              onClick={onCancel}
              disabled={saving}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-slate-300 text-slate-700 text-base sm:text-lg font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
            >
              Cancel
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Components
interface SectionProps {
  title: string;
  sectionId: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  delay?: number;
}

function Section({
  title,
  sectionId,
  isOpen,
  onToggle,
  children,
  delay = 0,
}: SectionProps) {
  return (
    <motion.div
      className="bg-white/90 backdrop-blur-sm border-2 border-emerald-200 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden mt-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full text-left p-3 sm:p-4 md:p-5 lg:p-6 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all touch-manipulation active:bg-emerald-50"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent break-words flex-1">
            {title}
          </h2>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.span
              className="text-xs sm:text-sm font-semibold text-emerald-600 hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? "Close" : "Open"}
            </motion.span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {isOpen ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
              )}
            </motion.div>
          </div>
        </div>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              className=" mt-2 px-3 sm:px-4 md:px-5 lg:px-6 pb-3 sm:pb-4 md:pb-5 lg:pb-6 space-y-3 sm:space-y-4 md:space-y-5"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface InputProps {
  label: string;
  type?: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: InputProps) {
  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 text-[#4A4842] text-sm sm:text-base">
        {label}
      </label>
      <motion.input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input w-full border-2 border-[#D4C4B0] bg-[#FAF6F0] p-3 sm:p-3.5 rounded-lg text-[#2D2A24] text-base focus:border-[#6B9B6A] focus:bg-[#F7F3ED] focus:ring-2 focus:ring-[#6B9B6A]/50 transition-all duration-300 touch-manipulation"
        whileFocus={{ scale: 1.01, borderColor: "#6B9B6A" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </div>
  );
}

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function DateInput({ label, value, onChange }: DateInputProps) {
  return <Input label={label} type="date" value={value} onChange={onChange} />;
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  small?: boolean;
  placeholder?: string;
  isTime?: boolean;
}

function TextArea({
  label,
  value,
  onChange,
  small = false,
  placeholder,
  isTime = false,
}: TextAreaProps) {
  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
        {label}
      </label>
      <motion.textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`form-input w-full border-2 border-slate-200 bg-white/90 p-3 sm:p-3.5 rounded-lg text-slate-900 text-base focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300 transition-all duration-300 resize-y touch-manipulation ${
          isTime
            ? "min-h-[40px] sm:min-h-[45px]"
            : small
            ? "min-h-[60px] sm:min-h-[70px]"
            : "min-h-[100px] sm:min-h-[120px]"
        }`}
        whileFocus={{ scale: 1.01, borderColor: "rgb(52, 211, 153)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </div>
  );
}

interface RadioProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function Radio({ label, options, value, onChange }: RadioProps) {
  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 sm:mb-3 text-slate-700 text-sm sm:text-base">
        {label}
      </label>
      <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 cursor-pointer group px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 touch-manipulation min-h-[44px] flex-1 sm:flex-initial"
          >
            <input
              type="radio"
              name={label.replace(/\s+/g, "-")}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="w-5 h-5 sm:w-5 sm:h-5 text-emerald-500 focus:ring-2 focus:ring-emerald-300 transition-all duration-200 touch-manipulation"
            />
            <span className="text-sm sm:text-base text-slate-700 group-hover:text-slate-900 font-medium transition-colors duration-200">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface SelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function Select({ label, options, value, onChange }: SelectProps) {
  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input w-full border-2 border-slate-200 bg-white/90 p-3 sm:p-3.5 rounded-lg text-slate-900 text-base focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300 transition-all duration-300 cursor-pointer touch-manipulation min-h-[44px]"
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// Additional Helper Components
interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

function Checkbox({ label, checked = false, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group px-3 py-2.5 sm:py-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 touch-manipulation min-h-[44px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-5 h-5 sm:w-5 sm:h-5 text-emerald-500 focus:ring-2 focus:ring-emerald-300 transition-all duration-200 rounded touch-manipulation flex-shrink-0"
      />
      <span className="text-sm sm:text-base text-slate-700 group-hover:text-slate-900 font-medium transition-colors duration-200">
        {label}
      </span>
    </label>
  );
}

interface CheckboxWithTextProps {
  label: string;
  subLabel: string;
  checked?: boolean;
  textValue?: string;
  onCheckedChange?: (checked: boolean) => void;
  onTextChange?: (text: string) => void;
}

function CheckboxWithText({
  label,
  subLabel,
  checked = false,
  textValue = "",
  onCheckedChange,
  onTextChange,
}: CheckboxWithTextProps) {
  return (
    <div className="space-y-3">
      <Checkbox label={label} checked={checked} onChange={onCheckedChange} />
      {checked && (
        <TextArea
          label={subLabel}
          value={textValue}
          onChange={(val) => onTextChange?.(val)}
          small
        />
      )}
    </div>
  );
}

interface FoodQtyProps {
  label: string;
  checked?: boolean;
  quantity?: string;
  onCheckedChange?: (checked: boolean) => void;
  onQuantityChange?: (quantity: string) => void;
}

function FoodQty({
  label,
  checked = false,
  quantity = "",
  onCheckedChange,
  onQuantityChange,
}: FoodQtyProps) {
  return (
    <div className="space-y-3">
      <Checkbox label={label} checked={checked} onChange={onCheckedChange} />
      {checked && (
        <TextArea
          label={`${label} Quantity`}
          value={quantity}
          onChange={(val) => onQuantityChange?.(val)}
          small
        />
      )}
    </div>
  );
}

interface Qty5SelectProps {
  label: string;
  checkbox?: boolean;
  checked?: boolean;
  value?: string;
  onCheckedChange?: (checked: boolean) => void;
  onValueChange?: (value: string) => void;
}

function Qty5Select({
  label,
  checkbox = false,
  checked = false,
  value = "",
  onCheckedChange,
  onValueChange,
}: Qty5SelectProps) {
  return (
    <div className="space-y-3">
      {checkbox && (
        <Checkbox label={label} checked={checked} onChange={onCheckedChange} />
      )}
      {(!checkbox || checked) && (
        <Select
          label={checkbox ? label : label}
          options={["1", "2", "3", "4", "5"]}
          value={value}
          onChange={(val) => onValueChange?.(val)}
        />
      )}
    </div>
  );
}

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

function SubSection({ title, children }: SubSectionProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 shadow-md hover:shadow-lg"
      whileHover={{ y: -1, scale: 1.005 }}
    >
      <h3 className="text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
        <motion.span
          className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex-shrink-0"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        ></motion.span>
        <span className="break-words">{title}</span>
      </h3>
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </motion.div>
  );
}

// Complex Section Implementations
function FoodRecallSection({ formData, updateFormData, getFormValue }: any) {
  const morningIntake = getFormValue(["morningIntake"]) || {};
  const breakfast = getFormValue(["breakfast"]) || {};
  const midMorning = getFormValue(["midMorning"]) || {};
  const lunch = getFormValue(["lunch"]) || {};
  const midDay = getFormValue(["midDay"]) || {};
  const eveningSnack = getFormValue(["eveningSnack"]) || {};
  const dinner = getFormValue(["dinner"]) || {};

  return (
    <div className="space-y-6">
      {/* Morning Intake */}
      <SubSection title="Morning Intake">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={morningIntake.time || ""}
            onChange={(val) => updateFormData(["morningIntake", "time"], val)}
            isTime
          />
          <Input
            label="Water Intake (Number)"
            type="number"
            value={morningIntake.waterIntake || ""}
            onChange={(val) =>
              updateFormData(
                ["morningIntake", "waterIntake"],
                val ? parseInt(val) : undefined
              )
            }
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Any Medicines"
              value={morningIntake.medicines || ""}
              onChange={(val) =>
                updateFormData(["morningIntake", "medicines"], val)
              }
            />
          </div>
          <CheckboxWithText
            label="Tea"
            subLabel="Tea Type"
            checked={morningIntake.tea?.checked || false}
            textValue={morningIntake.tea?.type || ""}
            onCheckedChange={(checked) =>
              updateFormData(["morningIntake", "tea"], {
                ...morningIntake.tea,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["morningIntake", "tea"], {
                ...morningIntake.tea,
                type: text,
              })
            }
          />
          <Checkbox
            label="Coffee"
            checked={morningIntake.coffee?.checked || false}
            onChange={(checked) =>
              updateFormData(["morningIntake", "coffee"], { checked })
            }
          />
          <Checkbox
            label="Lemon Water"
            checked={morningIntake.lemonWater?.checked || false}
            onChange={(checked) =>
              updateFormData(["morningIntake", "lemonWater"], { checked })
            }
          />
          <CheckboxWithText
            label="Garlic & Other Herbs"
            subLabel="Types"
            checked={morningIntake.garlicHerbs?.checked || false}
            textValue={morningIntake.garlicHerbs?.types || ""}
            onCheckedChange={(checked) =>
              updateFormData(["morningIntake", "garlicHerbs"], {
                ...morningIntake.garlicHerbs,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["morningIntake", "garlicHerbs"], {
                ...morningIntake.garlicHerbs,
                types: text,
              })
            }
          />
          <CheckboxWithText
            label="Soaked Dry Fruits"
            subLabel="Quantity"
            checked={morningIntake.soakedDryFruits?.checked || false}
            textValue={morningIntake.soakedDryFruits?.quantity || ""}
            onCheckedChange={(checked) =>
              updateFormData(["morningIntake", "soakedDryFruits"], {
                ...morningIntake.soakedDryFruits,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["morningIntake", "soakedDryFruits"], {
                ...morningIntake.soakedDryFruits,
                quantity: text,
              })
            }
          />
          <CheckboxWithText
            label="Biscuit / Toast"
            subLabel="Quantity"
            checked={morningIntake.biscuitToast?.checked || false}
            textValue={morningIntake.biscuitToast?.quantity || ""}
            onCheckedChange={(checked) =>
              updateFormData(["morningIntake", "biscuitToast"], {
                ...morningIntake.biscuitToast,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["morningIntake", "biscuitToast"], {
                ...morningIntake.biscuitToast,
                quantity: text,
              })
            }
          />
          <TextArea
            label="Fruits"
            value={morningIntake.fruits || ""}
            onChange={(val) => updateFormData(["morningIntake", "fruits"], val)}
            small
          />
          <TextArea
            label="Fruit Quantity"
            value={morningIntake.fruitQuantity || ""}
            onChange={(val) =>
              updateFormData(["morningIntake", "fruitQuantity"], val)
            }
            small
          />
        </div>
      </SubSection>

      {/* Breakfast */}
      <SubSection title="Breakfast">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={breakfast.time || ""}
            onChange={(val) => updateFormData(["breakfast", "time"], val)}
            isTime
          />
          {[
            "Poha",
            "Upma",
            "Paratha",
            "Stuffed Paratha",
            "Puri",
            "Idly/Dosa",
            "Bread Butter",
            "Sandwich",
            "Egg",
            "Juice",
            "Fruits",
            "Milk",
          ].map((item) => (
            <FoodQty
              key={item}
              label={item}
              checked={
                breakfast[item.toLowerCase().replace(/[ /]/g, "")]?.checked ||
                false
              }
              quantity={
                breakfast[item.toLowerCase().replace(/[ /]/g, "")]?.quantity ||
                ""
              }
              onCheckedChange={(checked) =>
                updateFormData(
                  ["breakfast", item.toLowerCase().replace(/[ /]/g, "")],
                  {
                    ...breakfast[item.toLowerCase().replace(/[ /]/g, "")],
                    checked,
                  }
                )
              }
              onQuantityChange={(qty) =>
                updateFormData(
                  ["breakfast", item.toLowerCase().replace(/[ /]/g, "")],
                  {
                    ...breakfast[item.toLowerCase().replace(/[ /]/g, "")],
                    quantity: qty,
                  }
                )
              }
            />
          ))}
          <div className="sm:col-span-2 lg:col-span-1">
            <Checkbox
              label="Roti"
              checked={breakfast.roti?.checked || false}
              onChange={(checked) =>
                updateFormData(["breakfast", "roti"], {
                  ...breakfast.roti,
                  checked,
                })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Radio
              label="Roti Ghee"
              options={["With Ghee", "Without Ghee"]}
              value={breakfast.roti?.ghee || ""}
              onChange={(val) =>
                updateFormData(["breakfast", "roti"], {
                  ...breakfast.roti,
                  ghee: val,
                })
              }
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <TextArea
              label="Other"
              value={breakfast.other || ""}
              onChange={(val) => updateFormData(["breakfast", "other"], val)}
            />
          </div>
        </div>
      </SubSection>

      {/* Mid Morning */}
      <SubSection title="Mid Morning">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={midMorning.time || ""}
            onChange={(val) => updateFormData(["midMorning", "time"], val)}
            isTime
          />
          {["Buttermilk", "Curd", "Fruit", "Tea / Coffee", "Other"].map(
            (item) => (
              <FoodQty
                key={item}
                label={item}
                checked={
                  midMorning[item.toLowerCase().replace(/[ /]/g, "")]
                    ?.checked || false
                }
                quantity={
                  midMorning[item.toLowerCase().replace(/[ /]/g, "")]
                    ?.quantity || ""
                }
                onCheckedChange={(checked) =>
                  updateFormData(
                    ["midMorning", item.toLowerCase().replace(/[ /]/g, "")],
                    {
                      ...midMorning[item.toLowerCase().replace(/[ /]/g, "")],
                      checked,
                    }
                  )
                }
                onQuantityChange={(qty) =>
                  updateFormData(
                    ["midMorning", item.toLowerCase().replace(/[ /]/g, "")],
                    {
                      ...midMorning[item.toLowerCase().replace(/[ /]/g, "")],
                      quantity: qty,
                    }
                  )
                }
              />
            )
          )}
        </div>
      </SubSection>

      {/* Lunch - Simplified for space, full implementation would follow same pattern */}
      <SubSection title="Lunch">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={lunch.time || ""}
            onChange={(val) => updateFormData(["lunch", "time"], val)}
            isTime
          />
          <Qty5Select
            label="Rice (Bowls)"
            value={lunch.rice?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "rice"], { ...lunch.rice, bowls: val })
            }
          />
          <Select
            label="Rice Type"
            options={["White", "Brown", "Usna/Steam", "Starch Free"]}
            value={lunch.rice?.type || ""}
            onChange={(val) =>
              updateFormData(["lunch", "rice"], { ...lunch.rice, type: val })
            }
          />
          <Qty5Select
            label="Roti (Count)"
            value={lunch.roti?.count || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "roti"], { ...lunch.roti, count: val })
            }
          />
          <Qty5Select
            label="Dal (Bowls)"
            value={lunch.dal?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "dal"], { ...lunch.dal, bowls: val })
            }
          />
          <Select
            label="Dal Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
            value={lunch.dal?.type || ""}
            onChange={(val) =>
              updateFormData(["lunch", "dal"], { ...lunch.dal, type: val })
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Other Dal Type"
              value={lunch.dal?.otherType || ""}
              onChange={(val) =>
                updateFormData(["lunch", "dal"], {
                  ...lunch.dal,
                  otherType: val,
                })
              }
              small
            />
          </div>
          <Qty5Select
            label="Sambhar (Bowls)"
            value={lunch.sambhar?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "sambhar"], {
                ...lunch.sambhar,
                bowls: val,
              })
            }
          />
          <Select
            label="Sambhar Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
            value={lunch.sambhar?.type || ""}
            onChange={(val) =>
              updateFormData(["lunch", "sambhar"], {
                ...lunch.sambhar,
                type: val,
              })
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Other Sambhar Type"
              value={lunch.sambhar?.otherType || ""}
              onChange={(val) =>
                updateFormData(["lunch", "sambhar"], {
                  ...lunch.sambhar,
                  otherType: val,
                })
              }
              small
            />
          </div>
          <Qty5Select
            label="Curd/Kadhi (Bowls)"
            value={lunch.curdKadhi?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "curdKadhi"], {
                ...lunch.curdKadhi,
                bowls: val,
              })
            }
          />
          <Qty5Select
            label="Chole/Rajma/Beans (Bowls)"
            value={lunch.choleRajmaBeans?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["lunch", "choleRajmaBeans"], {
                ...lunch.choleRajmaBeans,
                bowls: val,
              })
            }
          />
          {["Chicken", "Fish", "Mutton", "Seafood"].map((item) => (
            <FoodQty
              key={item}
              label={item}
              checked={lunch[item.toLowerCase()]?.checked || false}
              quantity={lunch[item.toLowerCase()]?.quantity || ""}
              onCheckedChange={(checked) =>
                updateFormData(["lunch", item.toLowerCase()], {
                  ...lunch[item.toLowerCase()],
                  checked,
                })
              }
              onQuantityChange={(qty) =>
                updateFormData(["lunch", item.toLowerCase()], {
                  ...lunch[item.toLowerCase()],
                  quantity: qty,
                })
              }
            />
          ))}
          {["Pulao", "Khichdi", "Biryani"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={lunch[item.toLowerCase()]?.checked || false}
              value={lunch[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["lunch", item.toLowerCase()], {
                  ...lunch[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["lunch", item.toLowerCase()], {
                  ...lunch[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}
          <div className="md:col-span-2">
            <Checkbox
              label="Salad"
              checked={lunch.salad?.checked || false}
              onChange={(checked) =>
                updateFormData(["lunch", "salad"], { ...lunch.salad, checked })
              }
            />
          </div>
          <TextArea
            label="Salad Type"
            value={lunch.salad?.type || ""}
            onChange={(val) =>
              updateFormData(["lunch", "salad"], { ...lunch.salad, type: val })
            }
            small
          />
          <TextArea
            label="Salad Quantity"
            value={lunch.salad?.quantity || ""}
            onChange={(val) =>
              updateFormData(["lunch", "salad"], {
                ...lunch.salad,
                quantity: val,
              })
            }
            small
          />
          <CheckboxWithText
            label="Chutney"
            subLabel="Type"
            checked={lunch.chutney?.checked || false}
            textValue={lunch.chutney?.type || ""}
            onCheckedChange={(checked) =>
              updateFormData(["lunch", "chutney"], {
                ...lunch.chutney,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["lunch", "chutney"], {
                ...lunch.chutney,
                type: text,
              })
            }
          />
          <Checkbox
            label="Pickle"
            checked={lunch.pickle?.checked || false}
            onChange={(checked) =>
              updateFormData(["lunch", "pickle"], { checked })
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Other"
              value={lunch.other || ""}
              onChange={(val) => updateFormData(["lunch", "other"], val)}
            />
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Other Quantity"
              value={lunch.otherQuantity || ""}
              onChange={(val) =>
                updateFormData(["lunch", "otherQuantity"], val)
              }
              small
            />
          </div>
        </div>
      </SubSection>

      {/* Mid Day */}
      <SubSection title="Mid Day">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={midDay.time || ""}
            onChange={(val) => updateFormData(["midDay", "time"], val)}
            isTime
          />
          {["Sweets", "Dessert", "Laddu", "Fruits"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={midDay[item.toLowerCase()]?.checked || false}
              value={midDay[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["midDay", item.toLowerCase()], {
                  ...midDay[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["midDay", item.toLowerCase()], {
                  ...midDay[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}
          <div className="md:col-span-2">
            <TextArea
              label="Other"
              value={midDay.other || ""}
              onChange={(val) => updateFormData(["midDay", "other"], val)}
              small
            />
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Other Quantity"
              value={midDay.otherQuantity || ""}
              onChange={(val) =>
                updateFormData(["midDay", "otherQuantity"], val)
              }
              small
            />
          </div>
        </div>
      </SubSection>

      {/* Evening Snack */}
      <SubSection title="Evening Snack">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={eveningSnack.time || ""}
            onChange={(val) => updateFormData(["eveningSnack", "time"], val)}
            isTime
          />
          {["Biscuit / Toast", "Namkeen", "Chana", "Makhana", "Groundnuts"].map(
            (item) => (
              <FoodQty
                key={item}
                label={item}
                checked={
                  eveningSnack[item.toLowerCase().replace(/[ /]/g, "")]
                    ?.checked || false
                }
                quantity={
                  eveningSnack[item.toLowerCase().replace(/[ /]/g, "")]
                    ?.quantity || ""
                }
                onCheckedChange={(checked) =>
                  updateFormData(
                    ["eveningSnack", item.toLowerCase().replace(/[ /]/g, "")],
                    {
                      ...eveningSnack[item.toLowerCase().replace(/[ /]/g, "")],
                      checked,
                    }
                  )
                }
                onQuantityChange={(qty) =>
                  updateFormData(
                    ["eveningSnack", item.toLowerCase().replace(/[ /]/g, "")],
                    {
                      ...eveningSnack[item.toLowerCase().replace(/[ /]/g, "")],
                      quantity: qty,
                    }
                  )
                }
              />
            )
          )}
          {["Poha", "Upma", "Sandwich", "Dosa"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={eveningSnack[item.toLowerCase()]?.checked || false}
              value={eveningSnack[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["eveningSnack", item.toLowerCase()], {
                  ...eveningSnack[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["eveningSnack", item.toLowerCase()], {
                  ...eveningSnack[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}
          <div className="sm:col-span-2 lg:col-span-1">
            <Checkbox
              label="Tea / Coffee"
              checked={eveningSnack.teaCoffee?.checked || false}
              onChange={(checked) =>
                updateFormData(["eveningSnack", "teaCoffee"], { checked })
              }
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <Checkbox
              label="Milk"
              checked={eveningSnack.milk?.checked || false}
              onChange={(checked) =>
                updateFormData(["eveningSnack", "milk"], { checked })
              }
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <TextArea
              label="Other"
              value={eveningSnack.other || ""}
              onChange={(val) => updateFormData(["eveningSnack", "other"], val)}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <TextArea
              label="Other Quantity"
              value={eveningSnack.otherQuantity || ""}
              onChange={(val) =>
                updateFormData(["eveningSnack", "otherQuantity"], val)
              }
              small
            />
          </div>
        </div>
      </SubSection>

      {/* Dinner - Full Lunch + Mid-Day Fields */}
      <SubSection title="Dinner">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Time"
            value={dinner.time || ""}
            onChange={(val) => updateFormData(["dinner", "time"], val)}
            isTime
          />
          <div className="sm:col-span-1"></div>

          {/* Lunch Fields */}
          <Qty5Select
            label="Rice (Bowls)"
            value={dinner.rice?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "rice"], { ...dinner.rice, bowls: val })
            }
          />
          <Select
            label="Rice Type"
            options={["White", "Brown", "Usna/Steam", "Starch Free"]}
            value={dinner.rice?.type || ""}
            onChange={(val) =>
              updateFormData(["dinner", "rice"], { ...dinner.rice, type: val })
            }
          />
          <Qty5Select
            label="Roti (Count)"
            value={dinner.roti?.count || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "roti"], { ...dinner.roti, count: val })
            }
          />
          <div className="sm:col-span-2"></div>

          <Qty5Select
            label="Dal (Bowls)"
            value={dinner.dal?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "dal"], { ...dinner.dal, bowls: val })
            }
          />
          <Select
            label="Dal Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
            value={dinner.dal?.type || ""}
            onChange={(val) =>
              updateFormData(["dinner", "dal"], { ...dinner.dal, type: val })
            }
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Other Dal Type"
              value={dinner.dal?.otherType || ""}
              onChange={(val) =>
                updateFormData(["dinner", "dal"], {
                  ...dinner.dal,
                  otherType: val,
                })
              }
              small
            />
          </div>

          <Qty5Select
            label="Sambhar (Bowls)"
            value={dinner.sambhar?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "sambhar"], {
                ...dinner.sambhar,
                bowls: val,
              })
            }
          />
          <Select
            label="Sambhar Type"
            options={["Yellow", "Black", "Moong", "Masoor", "Moth", "Mix"]}
            value={dinner.sambhar?.type || ""}
            onChange={(val) =>
              updateFormData(["dinner", "sambhar"], {
                ...dinner.sambhar,
                type: val,
              })
            }
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Other Sambhar Type"
              value={dinner.sambhar?.otherType || ""}
              onChange={(val) =>
                updateFormData(["dinner", "sambhar"], {
                  ...dinner.sambhar,
                  otherType: val,
                })
              }
              small
            />
          </div>

          <Qty5Select
            label="Curd/Kadhi (Bowls)"
            value={dinner.curdKadhi?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "curdKadhi"], {
                ...dinner.curdKadhi,
                bowls: val,
              })
            }
          />
          <Qty5Select
            label="Chole/Rajma/Beans (Bowls)"
            value={dinner.choleRajmaBeans?.bowls || ""}
            onValueChange={(val) =>
              updateFormData(["dinner", "choleRajmaBeans"], {
                ...dinner.choleRajmaBeans,
                bowls: val,
              })
            }
          />

          {["Chicken", "Fish", "Mutton", "Seafood"].map((item) => (
            <FoodQty
              key={item}
              label={item}
              checked={dinner[item.toLowerCase()]?.checked || false}
              quantity={dinner[item.toLowerCase()]?.quantity || ""}
              onCheckedChange={(checked) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  checked,
                })
              }
              onQuantityChange={(qty) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  quantity: qty,
                })
              }
            />
          ))}

          {["Pulao", "Khichdi", "Biryani"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={dinner[item.toLowerCase()]?.checked || false}
              value={dinner[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}

          <div className="sm:col-span-2">
            <Checkbox
              label="Salad"
              checked={dinner.salad?.checked || false}
              onChange={(checked) =>
                updateFormData(["dinner", "salad"], {
                  ...dinner.salad,
                  checked,
                })
              }
            />
          </div>
          <TextArea
            label="Salad Type"
            value={dinner.salad?.type || ""}
            onChange={(val) =>
              updateFormData(["dinner", "salad"], {
                ...dinner.salad,
                type: val,
              })
            }
            small
          />
          <TextArea
            label="Salad Quantity"
            value={dinner.salad?.quantity || ""}
            onChange={(val) =>
              updateFormData(["dinner", "salad"], {
                ...dinner.salad,
                quantity: val,
              })
            }
            small
          />

          <CheckboxWithText
            label="Chutney"
            subLabel="Type"
            checked={dinner.chutney?.checked || false}
            textValue={dinner.chutney?.type || ""}
            onCheckedChange={(checked) =>
              updateFormData(["dinner", "chutney"], {
                ...dinner.chutney,
                checked,
              })
            }
            onTextChange={(text) =>
              updateFormData(["dinner", "chutney"], {
                ...dinner.chutney,
                type: text,
              })
            }
          />
          <Checkbox
            label="Pickle"
            checked={dinner.pickle?.checked || false}
            onChange={(checked) =>
              updateFormData(["dinner", "pickle"], { checked })
            }
          />

          <div className="sm:col-span-2">
            <TextArea
              label="Other"
              value={dinner.other || ""}
              onChange={(val) => updateFormData(["dinner", "other"], val)}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Other Quantity"
              value={dinner.otherQuantity || ""}
              onChange={(val) =>
                updateFormData(["dinner", "otherQuantity"], val)
              }
              small
            />
          </div>

          {/* Mid-Day Fields */}
          <div className="sm:col-span-2 border-t-2 border-emerald-200 pt-4 mt-2">
            <h4 className="text-base sm:text-lg font-semibold text-emerald-700 mb-4">
              Additional Items
            </h4>
          </div>

          {["Sweets", "Dessert", "Laddu", "Fruits"].map((item) => (
            <Qty5Select
              key={item}
              label={item}
              checkbox
              checked={dinner[item.toLowerCase()]?.checked || false}
              value={dinner[item.toLowerCase()]?.bowls || ""}
              onCheckedChange={(checked) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["dinner", item.toLowerCase()], {
                  ...dinner[item.toLowerCase()],
                  bowls: val,
                })
              }
            />
          ))}

          <div className="sm:col-span-2">
            <TextArea
              label="Other"
              value={dinner.midDayOther || ""}
              onChange={(val) => updateFormData(["dinner", "midDayOther"], val)}
              small
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Other Quantity"
              value={dinner.midDayOtherQuantity || ""}
              onChange={(val) =>
                updateFormData(["dinner", "midDayOtherQuantity"], val)
              }
              small
            />
          </div>
        </div>
      </SubSection>
    </div>
  );
}

function WeekendDietSection({ formData, updateFormData, getFormValue }: any) {
  const weekendDiet = getFormValue(["weekendDiet"]) || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TextArea
        label="Snacks"
        value={weekendDiet.snacks || ""}
        onChange={(val) => updateFormData(["weekendDiet", "snacks"], val)}
      />
      <TextArea
        label="Starters"
        value={weekendDiet.starters || ""}
        onChange={(val) => updateFormData(["weekendDiet", "starters"], val)}
      />
      <div className="md:col-span-2">
        <TextArea
          label="Main Course"
          value={weekendDiet.mainCourse || ""}
          onChange={(val) => updateFormData(["weekendDiet", "mainCourse"], val)}
        />
      </div>
      <div className="md:col-span-2">
        <Select
          label="Changes in Diet"
          options={[
            "Same",
            "Skip things in weekend",
            "Difference in timing/food pattern/schedule",
          ]}
          value={weekendDiet.changesInDiet || ""}
          onChange={(val) =>
            updateFormData(["weekendDiet", "changesInDiet"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Eating Out — Food Items"
          value={weekendDiet.eatingOutFoodItems || ""}
          onChange={(val) =>
            updateFormData(["weekendDiet", "eatingOutFoodItems"], val)
          }
        />
      </div>
      <Select
        label="Eating Out — Frequency"
        options={[
          "Daily",
          "Times in week",
          "Times in month",
          "Times in 6 months",
        ]}
        value={weekendDiet.eatingOutFrequency || ""}
        onChange={(val) =>
          updateFormData(["weekendDiet", "eatingOutFrequency"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="Ordered From Outside — Food Items"
          value={weekendDiet.orderedFromOutsideFoodItems || ""}
          onChange={(val) =>
            updateFormData(["weekendDiet", "orderedFromOutsideFoodItems"], val)
          }
        />
      </div>
      {[
        "Snacks List",
        "Starter List",
        "Main Course List",
        "Sweet Item List",
      ].map((label) => (
        <FoodQty
          key={label}
          label={label}
          checked={
            weekendDiet[label.toLowerCase().replace(/ /g, "")]?.checked || false
          }
          quantity={
            weekendDiet[label.toLowerCase().replace(/ /g, "")]?.quantity || ""
          }
          onCheckedChange={(checked) =>
            updateFormData(
              ["weekendDiet", label.toLowerCase().replace(/ /g, "")],
              { ...weekendDiet[label.toLowerCase().replace(/ /g, "")], checked }
            )
          }
          onQuantityChange={(qty) =>
            updateFormData(
              ["weekendDiet", label.toLowerCase().replace(/ /g, "")],
              {
                ...weekendDiet[label.toLowerCase().replace(/ /g, "")],
                quantity: qty,
              }
            )
          }
        />
      ))}
      <TextArea
        label="Sleeping Time (Weekend)"
        value={weekendDiet.sleepingTime || ""}
        onChange={(val) => updateFormData(["weekendDiet", "sleepingTime"], val)}
        small
      />
      <TextArea
        label="Wakeup Time (Weekend)"
        value={weekendDiet.wakeupTime || ""}
        onChange={(val) => updateFormData(["weekendDiet", "wakeupTime"], val)}
        small
      />
      <TextArea
        label="Nap Time (Weekend)"
        value={weekendDiet.napTime || ""}
        onChange={(val) => updateFormData(["weekendDiet", "napTime"], val)}
        small
      />
    </div>
  );
}

function QuestionnaireSection({ formData, updateFormData, getFormValue }: any) {
  const questionnaire = getFormValue(["questionnaire"]) || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Radio
        label="Food Allergies"
        options={["Yes", "No"]}
        value={questionnaire.foodAllergies || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "foodAllergies"], val)
        }
      />
      <Radio
        label="Food Intolerance"
        options={["Yes", "No"]}
        value={questionnaire.foodIntolerance || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "foodIntolerance"], val)
        }
      />
      <div className="md:col-span-2">
        <Select
          label="Intolerance Type"
          options={[
            "Soya",
            "Gluten",
            "Lactose",
            "Citrus Fruits",
            "Egg",
            "Milk",
            "Curd",
            "Other",
          ]}
          value={questionnaire.intoleranceType || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "intoleranceType"], val)
          }
        />
      </div>
      <Select
        label="Eating Speed"
        options={["Quick", "Slow", "Moderate"]}
        value={questionnaire.eatingSpeed || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "eatingSpeed"], val)
        }
      />
      <Select
        label="Activity During Meal"
        options={["Work on PC", "Phone", "TV", "Discussions", "N/A", "Other"]}
        value={questionnaire.activityDuringMeal || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "activityDuringMeal"], val)
        }
      />
      <Radio
        label="Hunger Pangs"
        options={["Yes", "No"]}
        value={questionnaire.hungerPangs || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "hungerPangs"], val)
        }
      />
      <Select
        label="Hunger Pangs Time"
        options={["Morning", "Afternoon", "Evening", "Night"]}
        value={questionnaire.hungerPangsTime || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "hungerPangsTime"], val)
        }
      />
      <div className="md:col-span-2">
        <Radio
          label="Emotional Eater / Mood-based Eating"
          options={["Yes", "No"]}
          value={questionnaire.emotionalEater || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "emotionalEater"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Describe Emotional Eating"
          value={questionnaire.describeEmotionalEating || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "describeEmotionalEating"], val)
          }
        />
      </div>
      <Select
        label="Main Meal"
        options={["Breakfast", "Lunch", "Dinner"]}
        value={questionnaire.mainMeal || ""}
        onChange={(val) => updateFormData(["questionnaire", "mainMeal"], val)}
      />
      <div className="md:col-span-2">
        <TextArea
          label="Snack Foods You Prefer"
          value={questionnaire.snackFoodsPrefer || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "snackFoodsPrefer"], val)
          }
        />
      </div>
      <Radio
        label="Crave Sweets?"
        options={["Yes", "No"]}
        value={questionnaire.craveSweets || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "craveSweets"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="Sweet Types (Chocolates/Indian Sweets)"
          value={questionnaire.sweetTypes || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "sweetTypes"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Specific Likes"
          value={questionnaire.specificLikes || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "specificLikes"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Specific Dislikes"
          value={questionnaire.specificDislikes || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "specificDislikes"], val)
          }
        />
      </div>
      <Radio
        label="Fasting in Week?"
        options={["Yes", "No"]}
        value={questionnaire.fastingInWeek || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "fastingInWeek"], val)
        }
      />
      <Select
        label="Fasting Reason"
        options={["Religious Based", "Personal Based"]}
        value={questionnaire.fastingReason || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "fastingReason"], val)
        }
      />
    </div>
  );
}

function FoodFrequencySection({ formData, updateFormData, getFormValue }: any) {
  const foodFrequency = getFormValue(["foodFrequency"]) || {};
  return (
    <div className="space-y-6">
      <SubSection title="Non-Veg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {["Fish", "White Meat", "Mutton", "Sea Fish"].map((item) => (
            <div
              key={item}
              className="space-y-4 p-4 bg-white/50 rounded-lg border border-emerald-200"
            >
              <Checkbox
                label={item}
                checked={
                  foodFrequency.nonVeg?.[item.toLowerCase().replace(/ /g, "")]
                    ?.checked || false
                }
                onChange={(checked) => {
                  const nonVeg = foodFrequency.nonVeg || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "nonVeg",
                      item.toLowerCase().replace(/ /g, ""),
                    ],
                    { ...nonVeg[item.toLowerCase().replace(/ /g, "")], checked }
                  );
                }}
              />
              <Qty5Select
                label={`${item} Qty (Pieces)`}
                value={
                  foodFrequency.nonVeg?.[item.toLowerCase().replace(/ /g, "")]
                    ?.qtyPieces || ""
                }
                onValueChange={(val) => {
                  const nonVeg = foodFrequency.nonVeg || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "nonVeg",
                      item.toLowerCase().replace(/ /g, ""),
                    ],
                    {
                      ...nonVeg[item.toLowerCase().replace(/ /g, "")],
                      qtyPieces: val,
                    }
                  );
                }}
              />
              <Select
                label="Type of Preparation"
                options={["Dry Form", "Curry Form"]}
                value={
                  foodFrequency.nonVeg?.[item.toLowerCase().replace(/ /g, "")]
                    ?.prepType || ""
                }
                onChange={(val) => {
                  const nonVeg = foodFrequency.nonVeg || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "nonVeg",
                      item.toLowerCase().replace(/ /g, ""),
                    ],
                    {
                      ...nonVeg[item.toLowerCase().replace(/ /g, "")],
                      prepType: val,
                    }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.nonVeg?.[item.toLowerCase().replace(/ /g, "")]
                    ?.frequency || ""
                }
                onChange={(val) => {
                  const nonVeg = foodFrequency.nonVeg || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "nonVeg",
                      item.toLowerCase().replace(/ /g, ""),
                    ],
                    {
                      ...nonVeg[item.toLowerCase().replace(/ /g, "")],
                      frequency: val,
                    }
                  );
                }}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <div className="space-y-4 p-4 bg-white/50 rounded-lg border border-emerald-200">
              <Checkbox
                label="Egg"
                checked={foodFrequency.nonVeg?.egg?.checked || false}
                onChange={(checked) =>
                  updateFormData(["foodFrequency", "nonVeg", "egg"], {
                    ...foodFrequency.nonVeg?.egg,
                    checked,
                  })
                }
              />
              <Select
                label="Type of Preparation"
                options={["Boiled", "Burnt", "Omelette", "Poach"]}
                value={foodFrequency.nonVeg?.egg?.prepType || ""}
                onChange={(val) =>
                  updateFormData(["foodFrequency", "nonVeg", "egg"], {
                    ...foodFrequency.nonVeg?.egg,
                    prepType: val,
                  })
                }
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={foodFrequency.nonVeg?.egg?.frequency || ""}
                onChange={(val) =>
                  updateFormData(["foodFrequency", "nonVeg", "egg"], {
                    ...foodFrequency.nonVeg?.egg,
                    frequency: val,
                  })
                }
              />
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Dairy">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="space-y-4 p-4 bg-white/50 rounded-lg border border-emerald-200">
            <Qty5Select
              label="Milk (Glass)"
              checkbox
              checked={foodFrequency.dairy?.milk?.checked || false}
              value={foodFrequency.dairy?.milk?.glasses || ""}
              onCheckedChange={(checked) =>
                updateFormData(["foodFrequency", "dairy", "milk"], {
                  ...foodFrequency.dairy?.milk,
                  checked,
                })
              }
              onValueChange={(val) =>
                updateFormData(["foodFrequency", "dairy", "milk"], {
                  ...foodFrequency.dairy?.milk,
                  glasses: val,
                })
              }
            />
            <Select
              label="Frequency"
              options={["Daily", "Weekly", "Monthly"]}
              value={foodFrequency.dairy?.milk?.frequency || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "dairy", "milk"], {
                  ...foodFrequency.dairy?.milk,
                  frequency: val,
                })
              }
            />
          </div>
          <Radio
            label="Curd / Buttermilk"
            options={["Daily", "Weekly", "Monthly"]}
            value={foodFrequency.dairy?.curdButtermilk || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "dairy", "curdButtermilk"], val)
            }
          />
        </div>
      </SubSection>

      <SubSection title="Packaged / Daily Items">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {[
            "Noodles",
            "Butter/Cream/Ghee",
            "Ghee Chapati",
            "Cheese",
            "Ice Cream",
            "Milkshake",
            "Chocolate",
            "Fried Foods",
            "Pickle/Papad",
            "Lemon Sweets",
            "Biscuits",
            "Sweets/Desserts",
            "Jam/Sauces",
            "Instant Foods",
            "Soft Drinks",
          ].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.packaged?.[
                    item.toLowerCase().replace(/[\/ ]/g, "")
                  ]?.checked || false
                }
                onChange={(checked) => {
                  const packaged = foodFrequency.packaged || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "packaged",
                      item.toLowerCase().replace(/[\/ ]/g, ""),
                    ],
                    {
                      ...packaged[item.toLowerCase().replace(/[\/ ]/g, "")],
                      checked,
                    }
                  );
                }}
              />
              <TextArea
                label="Quantity"
                value={
                  foodFrequency.packaged?.[
                    item.toLowerCase().replace(/[\/ ]/g, "")
                  ]?.quantity || ""
                }
                onChange={(val) => {
                  const packaged = foodFrequency.packaged || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "packaged",
                      item.toLowerCase().replace(/[\/ ]/g, ""),
                    ],
                    {
                      ...packaged[item.toLowerCase().replace(/[\/ ]/g, "")],
                      quantity: val,
                    }
                  );
                }}
                small
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.packaged?.[
                    item.toLowerCase().replace(/[\/ ]/g, "")
                  ]?.frequency || ""
                }
                onChange={(val) => {
                  const packaged = foodFrequency.packaged || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "packaged",
                      item.toLowerCase().replace(/[\/ ]/g, ""),
                    ],
                    {
                      ...packaged[item.toLowerCase().replace(/[\/ ]/g, "")],
                      frequency: val,
                    }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </SubSection>

      {/* Additional subsections would follow similar patterns */}
      <SubSection title="Sweeteners">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {["Sugar", "Honey", "Jaggery"].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.sweeteners?.[item.toLowerCase()]?.checked ||
                  false
                }
                onChange={(checked) => {
                  const sweeteners = foodFrequency.sweeteners || {};
                  updateFormData(
                    ["foodFrequency", "sweeteners", item.toLowerCase()],
                    { ...sweeteners[item.toLowerCase()], checked }
                  );
                }}
              />
              <Select
                label="Qty (TSP/TBSP)"
                options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
                value={
                  foodFrequency.sweeteners?.[item.toLowerCase()]?.qty || ""
                }
                onChange={(val) => {
                  const sweeteners = foodFrequency.sweeteners || {};
                  updateFormData(
                    ["foodFrequency", "sweeteners", item.toLowerCase()],
                    { ...sweeteners[item.toLowerCase()], qty: val }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.sweeteners?.[item.toLowerCase()]?.frequency ||
                  ""
                }
                onChange={(val) => {
                  const sweeteners = foodFrequency.sweeteners || {};
                  updateFormData(
                    ["foodFrequency", "sweeteners", item.toLowerCase()],
                    { ...sweeteners[item.toLowerCase()], frequency: val }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Drinks">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {["Tea", "Coffee"].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.drinks?.[item.toLowerCase()]?.checked || false
                }
                onChange={(checked) => {
                  const drinks = foodFrequency.drinks || {};
                  updateFormData(
                    ["foodFrequency", "drinks", item.toLowerCase()],
                    { ...drinks[item.toLowerCase()], checked }
                  );
                }}
              />
              <Select
                label="Qty (cups/pieces)"
                options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
                value={foodFrequency.drinks?.[item.toLowerCase()]?.qty || ""}
                onChange={(val) => {
                  const drinks = foodFrequency.drinks || {};
                  updateFormData(
                    ["foodFrequency", "drinks", item.toLowerCase()],
                    { ...drinks[item.toLowerCase()], qty: val }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.drinks?.[item.toLowerCase()]?.frequency || ""
                }
                onChange={(val) => {
                  const drinks = foodFrequency.drinks || {};
                  updateFormData(
                    ["foodFrequency", "drinks", item.toLowerCase()],
                    { ...drinks[item.toLowerCase()], frequency: val }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Lifestyle">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {["Smoking", "Tobacco"].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.lifestyle?.[item.toLowerCase()]?.checked ||
                  false
                }
                onChange={(checked) => {
                  const lifestyle = foodFrequency.lifestyle || {};
                  updateFormData(
                    ["foodFrequency", "lifestyle", item.toLowerCase()],
                    { ...lifestyle[item.toLowerCase()], checked }
                  );
                }}
              />
              <Select
                label="Qty (cups/pieces)"
                options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
                value={foodFrequency.lifestyle?.[item.toLowerCase()]?.qty || ""}
                onChange={(val) => {
                  const lifestyle = foodFrequency.lifestyle || {};
                  updateFormData(
                    ["foodFrequency", "lifestyle", item.toLowerCase()],
                    { ...lifestyle[item.toLowerCase()], qty: val }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.lifestyle?.[item.toLowerCase()]?.frequency || ""
                }
                onChange={(val) => {
                  const lifestyle = foodFrequency.lifestyle || {};
                  updateFormData(
                    ["foodFrequency", "lifestyle", item.toLowerCase()],
                    { ...lifestyle[item.toLowerCase()], frequency: val }
                  );
                }}
              />
            </div>
          ))}
          <div className="space-y-3">
            <Checkbox
              label="Alcohol"
              checked={foodFrequency.lifestyle?.alcohol?.checked || false}
              onChange={(checked) =>
                updateFormData(["foodFrequency", "lifestyle", "alcohol"], {
                  ...foodFrequency.lifestyle?.alcohol,
                  checked,
                })
              }
            />
            <TextArea
              label="Quantity (ml)"
              value={foodFrequency.lifestyle?.alcohol?.qty || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "lifestyle", "alcohol"], {
                  ...foodFrequency.lifestyle?.alcohol,
                  qty: val,
                })
              }
              small
            />
            <Select
              label="Frequency"
              options={["Daily", "Weekly", "Monthly"]}
              value={foodFrequency.lifestyle?.alcohol?.frequency || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "lifestyle", "alcohol"], {
                  ...foodFrequency.lifestyle?.alcohol,
                  frequency: val,
                })
              }
            />
          </div>
        </div>
      </SubSection>

      <SubSection title="Water">
        <div className="space-y-3">
          <Checkbox
            label="Water"
            checked={foodFrequency.water?.checked || false}
            onChange={(checked) =>
              updateFormData(["foodFrequency", "water"], {
                ...foodFrequency.water,
                checked,
              })
            }
          />
          <Select
            label="Qty (cups/pieces)"
            options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
            value={foodFrequency.water?.qty || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "water"], {
                ...foodFrequency.water,
                qty: val,
              })
            }
          />
          <Select
            label="Frequency"
            options={["Daily", "Weekly", "Monthly"]}
            value={foodFrequency.water?.frequency || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "water"], {
                ...foodFrequency.water,
                frequency: val,
              })
            }
          />
        </div>
      </SubSection>

      <SubSection title="Healthy Foods">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {[
            "Leafy Veg (Bowls)",
            "Fresh Fruits",
            "Dry Fruits & Nuts",
            "Veg Salad",
          ].map((item) => (
            <div key={item} className="space-y-3">
              <Checkbox
                label={item}
                checked={
                  foodFrequency.healthyFoods?.[
                    item.toLowerCase().replace(/[ &]/g, "")
                  ]?.checked || false
                }
                onChange={(checked) => {
                  const healthyFoods = foodFrequency.healthyFoods || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "healthyFoods",
                      item.toLowerCase().replace(/[ &]/g, ""),
                    ],
                    {
                      ...healthyFoods[item.toLowerCase().replace(/[ &]/g, "")],
                      checked,
                    }
                  );
                }}
              />
              <Select
                label="Qty (cups/pieces)"
                options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
                value={
                  foodFrequency.healthyFoods?.[
                    item.toLowerCase().replace(/[ &]/g, "")
                  ]?.qty || ""
                }
                onChange={(val) => {
                  const healthyFoods = foodFrequency.healthyFoods || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "healthyFoods",
                      item.toLowerCase().replace(/[ &]/g, ""),
                    ],
                    {
                      ...healthyFoods[item.toLowerCase().replace(/[ &]/g, "")],
                      qty: val,
                    }
                  );
                }}
              />
              <Select
                label="Frequency"
                options={["Daily", "Weekly", "Monthly"]}
                value={
                  foodFrequency.healthyFoods?.[
                    item.toLowerCase().replace(/[ &]/g, "")
                  ]?.frequency || ""
                }
                onChange={(val) => {
                  const healthyFoods = foodFrequency.healthyFoods || {};
                  updateFormData(
                    [
                      "foodFrequency",
                      "healthyFoods",
                      item.toLowerCase().replace(/[ &]/g, ""),
                    ],
                    {
                      ...healthyFoods[item.toLowerCase().replace(/[ &]/g, "")],
                      frequency: val,
                    }
                  );
                }}
              />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Eating Out">
        <div className="space-y-4">
          <div className="space-y-3">
            <Checkbox
              label="Eating Out"
              checked={foodFrequency.eatingOut?.checked || false}
              onChange={(checked) =>
                updateFormData(["foodFrequency", "eatingOut"], {
                  ...foodFrequency.eatingOut,
                  checked,
                })
              }
            />
            <Select
              label="Frequency"
              options={["Daily", "Weekly", "Monthly"]}
              value={foodFrequency.eatingOut?.frequency || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "eatingOut"], {
                  ...foodFrequency.eatingOut,
                  frequency: val,
                })
              }
            />
          </div>
          <TextArea
            label="Food Items Eaten Outside"
            value={foodFrequency.eatingOut?.foodItems || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "eatingOut"], {
                ...foodFrequency.eatingOut,
                foodItems: val,
              })
            }
          />
        </div>
      </SubSection>

      <SubSection title="Coconut">
        <div className="space-y-3">
          <Checkbox
            label="Coconut (Dry / Fresh)"
            checked={foodFrequency.coconut?.checked || false}
            onChange={(checked) =>
              updateFormData(["foodFrequency", "coconut"], {
                ...foodFrequency.coconut,
                checked,
              })
            }
          />
          <Select
            label="Frequency"
            options={["Daily", "Weekly", "Monthly"]}
            value={foodFrequency.coconut?.frequency || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "coconut"], {
                ...foodFrequency.coconut,
                frequency: val,
              })
            }
          />
        </div>
      </SubSection>

      <SubSection title="Pizza/Burger">
        <div className="space-y-3">
          <Checkbox
            label="Pizza/Burger"
            checked={foodFrequency.pizzaBurger?.checked || false}
            onChange={(checked) =>
              updateFormData(["foodFrequency", "pizzaBurger"], {
                ...foodFrequency.pizzaBurger,
                checked,
              })
            }
          />
          <Select
            label="Qty (cups/pieces)"
            options={["1", "2", "3", "4", "5", "6", "8", "9", "10"]}
            value={foodFrequency.pizzaBurger?.qty || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "pizzaBurger"], {
                ...foodFrequency.pizzaBurger,
                qty: val,
              })
            }
          />
          <Select
            label="Frequency"
            options={["Daily", "Weekly", "Monthly"]}
            value={foodFrequency.pizzaBurger?.frequency || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "pizzaBurger"], {
                ...foodFrequency.pizzaBurger,
                frequency: val,
              })
            }
          />
        </div>
      </SubSection>

      <SubSection title="Oil / Fat">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <Select
            label="Type of Oil"
            options={["Sunflower", "Soyabean", "Vegetable Oil", "Rice Bran"]}
            value={foodFrequency.oilFat?.typeOfOil || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "oilFat"], {
                ...foodFrequency.oilFat,
                typeOfOil: val,
              })
            }
          />
          <Select
            label="Oil Per Month"
            options={["1L", "2L", "3L", "4L", "5L"]}
            value={foodFrequency.oilFat?.oilPerMonth || ""}
            onChange={(val) =>
              updateFormData(["foodFrequency", "oilFat"], {
                ...foodFrequency.oilFat,
                oilPerMonth: val,
              })
            }
          />
          <div className="md:col-span-2">
            <TextArea
              label="Total Members in House"
              value={foodFrequency.oilFat?.totalMembersInHouse || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "oilFat"], {
                  ...foodFrequency.oilFat,
                  totalMembersInHouse: val,
                })
              }
              small
            />
          </div>
          <div className="md:col-span-2">
            <Radio
              label="Reuse Fried Oil in Cooking?"
              options={["Yes", "No"]}
              value={foodFrequency.oilFat?.reuseFriedOil || ""}
              onChange={(val) =>
                updateFormData(["foodFrequency", "oilFat"], {
                  ...foodFrequency.oilFat,
                  reuseFriedOil: val,
                })
              }
            />
          </div>
        </div>
      </SubSection>
    </div>
  );
}

function HealthProfileSection({ formData, updateFormData, getFormValue }: any) {
  const healthProfile = getFormValue(["healthProfile"]) || {};
  const conditions = [
    "High B.P",
    "Diabetes",
    "High Cholesterol",
    "Obesity",
    "Cardiac Risk",
    "Heart Problem",
    "Back Pain",
    "Neck Pain",
    "Knee Pain",
    "Shoulder Pain",
    "Respiratory Problem (Asthma/Breathlessness)",
    "Post-Operative",
    "Hormonal Problem",
    "Thyroid",
    "PCOD",
    "PCOS",
    "Gynec Problem",
    "Gastric Problem",
    "Acidity",
    "Constipation",
    "Allergy",
    "Water Retention",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Select
        label="Physical Activity Level"
        options={["Sedentary", "Moderate", "Heavy"]}
        value={healthProfile.physicalActivityLevel || ""}
        onChange={(val) =>
          updateFormData(["healthProfile", "physicalActivityLevel"], val)
        }
      />
      <Select
        label="Sleep Quality"
        options={["Normal", "Inadequate", "Disturbed", "Insomnia"]}
        value={healthProfile.sleepQuality || ""}
        onChange={(val) =>
          updateFormData(["healthProfile", "sleepQuality"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="Insomnia/Pills Details"
          value={healthProfile.insomniaPillsDetails || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "insomniaPillsDetails"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Disturbance Due to Urine Break"
          value={healthProfile.disturbanceDueToUrineBreak || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "disturbanceDueToUrineBreak"], val)
          }
        />
      </div>
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conditions.map((condition) => (
          <Radio
            key={condition}
            label={condition}
            options={["Yes", "No"]}
            value={healthProfile.conditions?.[condition]?.hasCondition || ""}
            onChange={(val) => {
              const conditions = healthProfile.conditions || {};
              updateFormData(["healthProfile", "conditions", condition], {
                ...conditions[condition],
                name: condition,
                hasCondition: val,
              });
            }}
          />
        ))}
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Medication Name"
          value={healthProfile.medicationName || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "medicationName"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Medication Reason"
          value={healthProfile.medicationReason || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "medicationReason"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Medication Timing & Quantity"
          value={healthProfile.medicationTimingQuantity || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "medicationTimingQuantity"], val)
          }
        />
      </div>
      <Radio
        label="Pregnancy"
        options={["Yes", "No"]}
        value={healthProfile.pregnancy || ""}
        onChange={(val) => updateFormData(["healthProfile", "pregnancy"], val)}
      />
      <Radio
        label="Planning Pregnancy"
        options={["Yes", "No"]}
        value={healthProfile.planningPregnancy || ""}
        onChange={(val) =>
          updateFormData(["healthProfile", "planningPregnancy"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="If Yes, Planning When?"
          value={healthProfile.planningPregnancyWhen || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "planningPregnancyWhen"], val)
          }
        />
      </div>
      <SubSection title="Family History">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Father"
            value={healthProfile.familyHistory?.father || ""}
            onChange={(val) =>
              updateFormData(["healthProfile", "familyHistory"], {
                ...healthProfile.familyHistory,
                father: val,
              })
            }
          />
          <TextArea
            label="Mother"
            value={healthProfile.familyHistory?.mother || ""}
            onChange={(val) =>
              updateFormData(["healthProfile", "familyHistory"], {
                ...healthProfile.familyHistory,
                mother: val,
              })
            }
          />
          <TextArea
            label="Sibling(s)"
            value={healthProfile.familyHistory?.siblings || ""}
            onChange={(val) =>
              updateFormData(["healthProfile", "familyHistory"], {
                ...healthProfile.familyHistory,
                siblings: val,
              })
            }
          />
        </div>
      </SubSection>
    </div>
  );
}

function DietPrescribedSection({
  formData,
  updateFormData,
  getFormValue,
}: any) {
  const dietPrescribed = getFormValue(["dietPrescribed"]) || {};
  const [dietChartFiles, setDietChartFiles] = React.useState<File[]>([]);
  const [uploadedPDFs, setUploadedPDFs] = React.useState<any[]>(
    dietPrescribed.uploadedPDFs || []
  );
  const [fileErrors, setFileErrors] = React.useState<{
    [fileName: string]: string;
  }>({});
  const [dragActive, setDragActive] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const validateAndAddFiles = async (files: File[]) => {
    const errors: { [fileName: string]: string } = {};
    const validFiles: File[] = [];

    // Check total files limit (local + uploaded)
    const totalFiles = dietChartFiles.length + uploadedPDFs.length + files.length;
    if (totalFiles > 15) {
      toast.error(`Cannot add ${files.length} file(s). Maximum 15 files allowed in total.`, {
        duration: 5000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "500px",
        },
      });
      return;
    }

    files.forEach((file) => {
      // Check if PDF
      if (file.type !== "application/pdf") {
        errors[file.name] = "Only PDF files are allowed";
        return;
      }

      // Check file size (10MB limit)
      if (file.size > MAX_FILE_SIZE) {
        errors[file.name] = `File too large! Maximum allowed size is 10MB. (${formatFileSize(file.size)})`;
        return;
      }

      // Check if file already exists in local files
      if (dietChartFiles.some((f) => f.name === file.name && f.size === file.size)) {
        errors[file.name] = "This file is already added";
        return;
      }

      // Check if file already exists in uploaded files
      if (uploadedPDFs.some((pdf) => pdf.fileName === file.name && pdf.sizeInBytes === file.size)) {
        errors[file.name] = "This file is already uploaded";
        return;
      }

      validFiles.push(file);
    });

    // Show errors for invalid files
    if (Object.keys(errors).length > 0) {
      setFileErrors((prev) => ({ ...prev, ...errors }));
      // Show toast for errors
      Object.entries(errors).forEach(([fileName, error]) => {
        toast.error(`${fileName}: ${error}`, {
          duration: 5000,
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            maxWidth: "500px",
          },
        });
      });
    }

    // Add valid files and upload them
    if (validFiles.length > 0) {
      const updatedFiles = [...dietChartFiles, ...validFiles].slice(0, 15);
      setDietChartFiles(updatedFiles);
      updateFormData(["dietPrescribed", "dietChartFiles"], updatedFiles);
      
      // Auto-upload files to Cloudinary
      await uploadFilesToCloudinary(validFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      toast.error("No files selected. Please select at least one PDF file.", {
        duration: 3000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "500px",
        },
      });
      return;
    }
    validateAndAddFiles(files);
    e.target.value = ""; // Clear input after processing
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = dietChartFiles[index];
    const updatedFiles = dietChartFiles.filter((_, i) => i !== index);
    setDietChartFiles(updatedFiles);
    updateFormData(["dietPrescribed", "dietChartFiles"], updatedFiles);
    
    // Clear error for removed file
    if (fileToRemove && fileErrors[fileToRemove.name]) {
      const newErrors = { ...fileErrors };
      delete newErrors[fileToRemove.name];
      setFileErrors(newErrors);
    }
    
    toast.success("File removed", { duration: 2000 });
  };

  const uploadFilesToCloudinary = async (files: File[]) => {
    if (files.length === 0) {
      toast.error("No files to upload.", {
        duration: 3000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "500px",
        },
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const response = await uploadPDFFiles(files);
      
      if (response.success && response.files) {
        // Add uploaded files to uploadedPDFs state
        const newUploadedPDFs = [...uploadedPDFs, ...response.files];
        setUploadedPDFs(newUploadedPDFs);
        updateFormData(["dietPrescribed", "uploadedPDFs"], newUploadedPDFs);
        
        // Remove uploaded files from local dietChartFiles
        const uploadedFileNames = files.map(f => f.name);
        const remainingFiles = dietChartFiles.filter(
          f => !uploadedFileNames.includes(f.name)
        );
        setDietChartFiles(remainingFiles);
        updateFormData(["dietPrescribed", "dietChartFiles"], remainingFiles);
        
        toast.success(`Successfully uploaded ${files.length} PDF file(s)`, {
          duration: 3000,
        });
      } else {
        // Handle unexpected response structure
        toast.error("Upload failed. Server returned an unexpected response.", {
          duration: 5000,
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            maxWidth: "500px",
          },
        });
      }
    } catch (error: any) {
      console.error("PDF upload error:", error);
      
      // Handle different types of errors
      let errorMessage = "Failed to upload PDF files. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Upload timeout. Please try again with smaller files.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "500px",
        },
      });
      
      // Remove failed files from local state
      const failedFileNames = files.map(f => f.name);
      const remainingFiles = dietChartFiles.filter(
        f => !failedFileNames.includes(f.name)
      );
      setDietChartFiles(remainingFiles);
      updateFormData(["dietPrescribed", "dietChartFiles"], remainingFiles);
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedPDF = (index: number) => {
    const updatedPDFs = uploadedPDFs.filter((_, i) => i !== index);
    setUploadedPDFs(updatedPDFs);
    updateFormData(["dietPrescribed", "uploadedPDFs"], updatedPDFs);
    toast.success("Uploaded PDF removed", { duration: 2000 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DateInput
        label="Joining Date"
        value={dietPrescribed.joiningDate || ""}
        onChange={(val) =>
          updateFormData(["dietPrescribed", "joiningDate"], val)
        }
      />
      <DateInput
        label="Expiry Date"
        value={dietPrescribed.expiryDate || ""}
        onChange={(val) =>
          updateFormData(["dietPrescribed", "expiryDate"], val)
        }
      />
      <DateInput
        label="Diet Prescription Date"
        value={dietPrescribed.dietPrescriptionDate || ""}
        onChange={(val) =>
          updateFormData(["dietPrescribed", "dietPrescriptionDate"], val)
        }
      />
      <DateInput
        label="Date"
        value={dietPrescribed.date || ""}
        onChange={(val) => updateFormData(["dietPrescribed", "date"], val)}
      />
      <div className="md:col-span-2">
        <TextArea
          label="Duration of Diet"
          value={dietPrescribed.durationOfDiet || ""}
          onChange={(val) =>
            updateFormData(["dietPrescribed", "durationOfDiet"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Diet Chart"
          value={dietPrescribed.dietChart || ""}
          onChange={(val) =>
            updateFormData(["dietPrescribed", "dietChart"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <div className="input-group">
          <label className="block font-semibold mb-3 text-slate-700 text-sm sm:text-base">
            Upload Diet Charts (PDF)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Max 15 files · 10MB per file
          </p>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              const totalFiles = dietChartFiles.length + uploadedPDFs.length;
              if (totalFiles < 15 && !isUploading) {
                setDragActive(true);
              }
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`
              border-2 rounded-xl p-5 text-center transition-all cursor-pointer
              ${
                dragActive
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-300 bg-white hover:border-emerald-400"
              }
              ${(dietChartFiles.length + uploadedPDFs.length) >= 15 || isUploading ? "opacity-50 pointer-events-none" : ""}
            `}
          >
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <span className="p-3 bg-emerald-50 rounded-full text-emerald-700">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </span>
              <div className="text-sm text-slate-600 font-medium">
                {isUploading
                  ? "Uploading..."
                  : (dietChartFiles.length + uploadedPDFs.length) >= 15
                  ? "Maximum 15 files reached"
                  : "Tap to upload or drag PDF files here"}
              </div>
              <div className="text-xs text-slate-400">
                PDF only · Max 10MB per file · Uploads to Cloudinary
              </div>
              {(dietChartFiles.length + uploadedPDFs.length > 0) && (
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {dietChartFiles.length + uploadedPDFs.length} / 15 files
                </div>
              )}

              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={(dietChartFiles.length + uploadedPDFs.length) >= 15 || isUploading}
              />
            </label>
          </div>

          {/* Local Files Preview (Being Uploaded) */}
          {dietChartFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">
                {isUploading ? "Uploading Files..." : `Selected Files (${dietChartFiles.length})`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dietChartFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-blue-200 bg-blue-50 p-4 transition-all"
                  >
                    {/* PDF Icon */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-600" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-slate-800 truncate mb-1"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          {isUploading ? "Uploading..." : "Ready to upload"}
                        </p>
                      </div>

                      {/* Delete Button */}
                      {!isUploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition"
                          title="Remove file"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Files Preview Grid */}
          {uploadedPDFs.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">
                Uploaded PDFs ({uploadedPDFs.length}/15)
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Click on any PDF to open it in a new tab
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedPDFs.map((pdf, index) => (
                  <a
                    key={index}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group rounded-xl border-2 border-emerald-200 bg-white hover:bg-emerald-50 p-5 transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1"
                  >
                    {/* Delete Button - Top Right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeUploadedPDF(index);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
                      title="Remove PDF"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                      {/* PDF Icon - Large */}
                      <div className="mb-4">
                        <svg
                          width="64"
                          height="64"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                            fill="#10b981"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 2V8H20"
                            fill="#fff"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <text
                            x="12"
                            y="16"
                            fontSize="5"
                            fontWeight="bold"
                            fill="#fff"
                            textAnchor="middle"
                          >
                            PDF
                          </text>
                        </svg>
                      </div>

                      {/* File Info */}
                      <h3 className="text-base font-semibold text-emerald-700 group-hover:text-emerald-800 mb-1">
                        PDF #{index + 1}
                      </h3>
                      <p
                        className="text-sm text-slate-700 truncate w-full mb-1"
                        title={pdf.fileName}
                      >
                        {pdf.fileName}
                      </p>
                      <p className="text-xs text-slate-500 mb-2">
                        {formatFileSize(pdf.sizeInBytes)}
                      </p>
                      <p className="text-xs text-emerald-600 font-medium">
                        Click to open
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Input
        label="Code"
        value={dietPrescribed.code || ""}
        onChange={(val) => updateFormData(["dietPrescribed", "code"], val)}
      />
    </div>
  );
}

function BodyMeasurementsSection({
  formData,
  updateFormData,
  getFormValue,
}: any) {
  const bodyMeasurements = getFormValue(["bodyMeasurements"]) || {};

  return (
    <div className="space-y-6">
      {/* Upper Body Subsection */}
      <SubSection title="Upper Body">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <Input
            label="Neck"
            type="number"
            value={bodyMeasurements.neck || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "neck"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Chest"
            type="number"
            value={bodyMeasurements.chest || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "chest"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Chest (Female)"
            type="number"
            value={bodyMeasurements.chestFemale || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "chestFemale"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Normal Chest (Lung)"
            type="number"
            value={bodyMeasurements.normalChestLung || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "normalChestLung"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Expanded Chest (Lungs)"
            type="number"
            value={bodyMeasurements.expandedChestLungs || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "expandedChestLungs"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Arms"
            type="number"
            value={bodyMeasurements.arms || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "arms"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Forearms"
            type="number"
            value={bodyMeasurements.forearms || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "forearms"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Wrist"
            type="number"
            value={bodyMeasurements.wrist || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "wrist"], val)
            }
            placeholder="in cm"
          />
        </div>
      </SubSection>

      {/* Lower Body Subsection */}
      <SubSection title="Lower Body">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <Input
            label="Abdomen Upper"
            type="number"
            value={bodyMeasurements.abdomenUpper || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "abdomenUpper"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Abdomen Lower"
            type="number"
            value={bodyMeasurements.abdomenLower || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "abdomenLower"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Waist"
            type="number"
            value={bodyMeasurements.waist || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "waist"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Hip"
            type="number"
            value={bodyMeasurements.hip || ""}
            onChange={(val) => updateFormData(["bodyMeasurements", "hip"], val)}
            placeholder="in cm"
          />
          <Input
            label="Thigh Upper"
            type="number"
            value={bodyMeasurements.thighUpper || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "thighUpper"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Thigh Lower"
            type="number"
            value={bodyMeasurements.thighLower || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "thighLower"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Calf"
            type="number"
            value={bodyMeasurements.calf || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "calf"], val)
            }
            placeholder="in cm"
          />
          <Input
            label="Ankle"
            type="number"
            value={bodyMeasurements.ankle || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "ankle"], val)
            }
            placeholder="in cm"
          />
        </div>
      </SubSection>

      {/* Reference Image */}
      <div className="mt-8 pt-6 border-t-2 border-[#D4C4B0]">
        <h4 className="text-lg sm:text-xl font-semibold text-[#4A7A49] mb-4 text-center">
          Body Measurements Reference Guide
        </h4>
        <div className="flex justify-center">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
            <img
              src="/images/body-measurements-reference.webp"
              alt="Body Measurements Reference Guide"
              className="w-full h-auto rounded-lg shadow-lg object-contain mx-auto"
              style={{ maxHeight: "800px" }}
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="bg-[#E8E0D6] border-2 border-[#D4C4B0] rounded-lg p-6 sm:p-8 text-center">
                      <p class="text-[#4A4842] text-sm sm:text-base">
                        Reference image will be displayed here.<br/>
                        Please add the image at: <code class="text-[#6B9B6A] bg-[#F7F3ED] px-2 py-1 rounded">/public/images/body-measurements-reference.webp</code>
                      </p>
                    </div>
                  `;
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader Component
export function FormSkeleton() {
  return (
    <div className="min-h-screen py-2 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
        {/* Header Skeleton */}
        <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg w-3/4 mx-auto mb-2 animate-pulse"></div>
          <div className="h-5 sm:h-6 bg-slate-200 rounded-lg w-1/2 mx-auto animate-pulse"></div>
        </div>

        {/* Section Skeletons */}
        {[1, 2, 3, 4, 5, 6, 7].map((section) => (
          <div
            key={section}
            className="bg-white/90 backdrop-blur-sm border-2 border-emerald-200 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg overflow-hidden mt-1"
          >
            {/* Section Header Skeleton */}
            <div className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="h-6 sm:h-7 md:h-8 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg w-2/3 animate-pulse"></div>
            </div>

            {/* Section Content Skeleton */}
            <div className="px-3 sm:px-4 md:px-5 lg:px-6 pb-3 sm:pb-4 md:pb-5 lg:pb-6 space-y-3 sm:space-y-4 md:space-y-5">
              {/* Subsection Skeleton */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                <div className="h-5 sm:h-6 bg-emerald-200 rounded-lg w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-10 sm:h-12 bg-slate-100 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Fields Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-10 sm:h-12 bg-slate-100 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Submit Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6 md:pb-8 px-2">
          <div className="h-12 sm:h-14 bg-slate-200 rounded-xl w-full sm:w-32 animate-pulse"></div>
          <div className="h-12 sm:h-14 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-xl w-full sm:w-40 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
