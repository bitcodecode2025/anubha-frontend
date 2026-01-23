"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { DoctorNotesFormData } from "@/lib/doctor-notes-api";
import { saveAllSections } from "@/lib/doctor-notes-sections-save";
import toast from "react-hot-toast";

interface SaveActionsProps {
  appointmentId: string;
  formData: DoctorNotesFormData;
  originalFormData: DoctorNotesFormData;
  saving: boolean;
  elapsedTime: number;
  saveStartTime: number | null;
  hasExistingNotes: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  clearFormData: () => void;
  setSaving: (saving: boolean) => void;
  setSaveStartTime: (time: number | null) => void;
  setOriginalFormData: (data: DoctorNotesFormData) => void;
  formatFileSize: (bytes: number) => string;
}

export default function SaveActions({
  appointmentId,
  formData,
  originalFormData,
  saving,
  elapsedTime,
  saveStartTime,
  hasExistingNotes,
  onSave,
  onCancel,
  clearFormData,
  setSaving,
  setSaveStartTime,
  setOriginalFormData,
  formatFileSize,
}: SaveActionsProps) {
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
            `${
              file.name
            }: File too large! Maximum allowed size is 10MB. (${formatFileSize(
              file.size
            )})`
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

      // Use saveAllSections() to save sections in parallel
      // Pass originalFormData to enable dirty-section detection (only modified sections will be saved)
      const results = await saveAllSections({
        appointmentId,
        formState: formData,
        originalFormData, // Enables dirty-section detection
        isDraft,
      });

      // Count successes and failures
      const sectionKeys = Object.keys(results) as Array<keyof typeof results>;
      const succeeded = sectionKeys.filter(
        (key) => results[key]?.status === "fulfilled"
      );
      const failed = sectionKeys.filter(
        (key) => results[key]?.status === "rejected"
      );

      // Extract error messages from failed sections
      const errorMessages: string[] = [];
      failed.forEach((key) => {
        const result = results[key];
        if (result?.status === "rejected") {
          const error = result.error as any;
          let errorMsg = `Section ${key} failed`;
          if (error?.response?.data?.message) {
            errorMsg = error.response.data.message;
          } else if (error?.response?.data?.error) {
            errorMsg = error.response.data.error;
          } else if (error?.message) {
            errorMsg = error.message;
          }
          errorMessages.push(errorMsg);
        }
      });

      // Show appropriate toast based on results
      if (failed.length === 0) {
        // All sections succeeded
        toast.success(
          isDraft
            ? "Draft saved successfully!"
            : "All sections saved successfully!",
          {
            duration: 3000,
          }
        );
      } else if (succeeded.length > 0) {
        // Partial success - some sections failed
        toast.error(
          `${succeeded.length} section(s) saved, ${failed.length} section(s) failed: ${errorMessages.join("; ")}`,
          {
            duration: 6000,
            style: {
              background: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fbbf24",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              maxWidth: "500px",
            },
          }
        );
      } else {
        // All sections failed
        toast.error(
          `All sections failed: ${errorMessages.join("; ")}`,
          {
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
          }
        );
      }

      // Update original form data only for succeeded sections
      // (Don't update if all failed, to allow retry)
      if (succeeded.length > 0) {
        // Create a partial update with only succeeded sections
        // Map each sectionKey to its corresponding formData value
        const succeededData: Partial<DoctorNotesFormData> = {};
        succeeded.forEach((sectionKey) => {
          // Special handling for composite sectionKeys that don't exist as formData properties
          if (sectionKey === "baseInfo" as any) {
            // Extract all 18 Section 1 flat fields from formData
            const baseInfoFields = [
              "personalHistory",
              "reasonForJoiningProgram",
              "ethnicity",
              "joiningDate",
              "expiryDate",
              "dietPrescriptionDate",
              "durationOfDiet",
              "previousDietTaken",
              "previousDietDetails",
              "typeOfDietTaken",
              "maritalStatus",
              "numberOfChildren",
              "dietPreference",
              "wakeupTime",
              "bedTime",
              "dayNap",
              "workoutTiming",
              "workoutType",
            ];
            baseInfoFields.forEach((field) => {
              const fieldValue = (formData as any)[field];
              if (fieldValue !== undefined && fieldValue !== null) {
                (succeededData as any)[field] = fieldValue;
              }
            });
          } else if (sectionKey === "foodRecall" as any) {
            // Extract all 7 Section 2 meal keys from formData
            const mealKeys = [
              "morningIntake",
              "breakfast",
              "midMorning",
              "lunch",
              "midDay",
              "eveningSnack",
              "dinner",
            ];
            mealKeys.forEach((mealKey) => {
              const mealValue = (formData as any)[mealKey];
              if (mealValue !== undefined && mealValue !== null) {
                (succeededData as any)[mealKey] = mealValue;
              }
            });
          } else {
            // Generic mapping for other sections: sectionKey directly corresponds to formData property name
            // Handle all section types: flat fields, nested objects, and string values
            const sectionValue = (formData as any)[sectionKey];
            if (sectionValue !== undefined && sectionValue !== null) {
              (succeededData as any)[sectionKey] = sectionValue;
            }
          }
        });
        
        // Merge succeeded data into original (preserve other unchanged sections)
        const updatedOriginal = {
          ...originalFormData,
          ...succeededData,
        };
        setOriginalFormData(updatedOriginal);
      }

      // Clear localStorage after successful submission (only if not a draft and all succeeded)
      if (!isDraft && failed.length === 0) {
        clearFormData();
      }

      // Call onSave callback if at least one section succeeded
      if (succeeded.length > 0 && onSave) {
        onSave();
      }
    } catch (error: any) {
      const duration = saveStartTime ? Date.now() - saveStartTime : 0;

      // Extract error message from various possible formats
      let errorMessage = "Failed to save doctor notes";

      // Check for validation errors (array of error messages)
      if (
        error?.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
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

  return (
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
  );
}
