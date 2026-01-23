"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  ExternalLink,
  X as XIcon,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  DoctorNotesFormData,
  saveDoctorNotes,
  getDoctorNotes,
  updateDoctorNotes,
  getDoctorNoteAttachmentViewUrl,
  deleteDoctorNoteAttachment,
} from "@/lib/doctor-notes-api";
import { saveAllSections } from "@/lib/doctor-notes-sections-save";
import api from "@/lib/api";
// NOTE: Diet chart PDFs (Section 7) are uploaded to R2 through the main doctor notes
// multipart save endpoint (multer field: `dietCharts`). Do not auto-upload to Cloudinary.
import AppointmentPreview from "./AppointmentPreview";
import { AppointmentDetails } from "@/lib/appointments-admin";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import PrePostImagesSection from "./sections/PrePostImagesSection";
import SaveActions from "./actions/SaveActions";
import { useDoctorNotesForm } from "./hooks/useDoctorNotesForm";
import FoodRecallFormSection from "./form-sections/FoodRecallFormSection";
import WeekendDietFormSection from "./form-sections/WeekendDietFormSection";
import QuestionnaireFormSection from "./form-sections/QuestionnaireFormSection";
import FoodFrequencyFormSection from "./form-sections/FoodFrequencyFormSection";
import HealthProfileFormSection from "./form-sections/HealthProfileFormSection";
import DietPrescribedFormSection from "./form-sections/DietPrescribedFormSection";
import BodyMeasurementsFormSection from "./form-sections/BodyMeasurementsFormSection";

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
  // Use form state management hook
  const {
    originalFormData,
    setOriginalFormData,
    saving,
    setSaving,
    loading,
    hasExistingNotes,
    saveStartTime,
    setSaveStartTime,
    elapsedTime,
    attachments,
    setAttachments,
    openSections,
    toggleSection,
    formData,
    updateFormData,
    getFormValue,
    clearFormData,
    formatFileSize,
    getChangedFields,
    loadExistingNotes,
    hasUnsavedChanges,
    lastSaved,
    isAutoSaving,
  } = useDoctorNotesForm({ appointmentId });


  if (loading) {
    return (
      <ErrorBoundary context="Doctor Notes Form (Loading)">
        <FormSkeleton />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary context="Doctor Notes Form">
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
                // Handle empty string as 0, or parse the number
                if (val === "") {
                  updateFormData(["numberOfChildren"], 0);
                } else {
                  const numVal = parseInt(val, 10);
                  if (!isNaN(numVal) && numVal >= 0) {
                    updateFormData(["numberOfChildren"], numVal);
                  }
                }
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
          <FoodRecallFormSection
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
          <WeekendDietFormSection
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
          <QuestionnaireFormSection
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
          <FoodFrequencyFormSection
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
          <HealthProfileFormSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
            appointmentId={appointmentId}
            attachments={attachments}
            onAttachmentDeleted={async () => {
              // Refresh attachments after deletion
              try {
                const response = await getDoctorNotes(appointmentId);
                if (response.success && response.doctorNotes?.attachments) {
                  setAttachments(response.doctorNotes.attachments);
                }
              } catch (error) {
                // Ignore errors
              }
            }}
          />
        </Section>

        {/* Section 7: Diet Prescribed */}
        <Section
          title="SECTION 7 — Diet Prescribed"
          sectionId="section7"
          isOpen={openSections.has("section7")}
          onToggle={() => toggleSection("section7")}
        >
          <DietPrescribedFormSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
            appointmentId={appointmentId}
            attachments={attachments}
            onPDFsUploaded={async () => {
              // Refresh attachments after upload
              try {
                const response = await getDoctorNotes(appointmentId);
                if (response.success && response.doctorNotes?.attachments) {
                  setAttachments(response.doctorNotes.attachments);
                }
              } catch (error) {
                // Ignore errors
              }
            }}
          />
        </Section>

        {/* Section 8: Body Measurements */}
        <Section
          title="SECTION 8 — Body Measurements"
          sectionId="section8"
          isOpen={openSections.has("section8")}
          onToggle={() => toggleSection("section8")}
        >
          <BodyMeasurementsFormSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
          />
        </Section>

        {/* Section 9: Pre & Post Consultation Images */}
        <Section
          title="SECTION 9 — Pre & Post Consultation Images"
          sectionId="section9"
          isOpen={openSections.has("section9")}
          onToggle={() => toggleSection("section9")}
        >
          <PrePostImagesSection
            formData={formData}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
            appointmentId={appointmentId}
          />
        </Section>

        {/* Submit Buttons */}
        <SaveActions
          appointmentId={appointmentId}
          formData={formData}
          originalFormData={originalFormData}
          saving={saving}
          elapsedTime={elapsedTime}
          saveStartTime={saveStartTime}
          hasExistingNotes={hasExistingNotes}
          onSave={onSave}
          onCancel={onCancel}
          clearFormData={clearFormData}
          setSaving={setSaving}
          setSaveStartTime={setSaveStartTime}
          setOriginalFormData={setOriginalFormData}
          formatFileSize={formatFileSize}
        />
      </div>
    </div>
    </ErrorBoundary>
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
  // For number inputs, preserve 0 as a valid value (don't convert to empty string)
  const displayValue =
    type === "number"
      ? value === undefined || value === null
        ? ""
        : value
      : value || "";

  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 text-[#4A4842] text-sm sm:text-base">
        {label}
      </label>
      <motion.input
        type={type}
        value={displayValue}
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
