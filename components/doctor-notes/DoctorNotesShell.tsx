"use client";

import React, { useState } from "react";
import { Stethoscope, Calendar, Edit2 } from "lucide-react";
import {
  DoctorNotesFormData,
  DoctorNoteAttachment,
} from "@/lib/doctor-notes-api";
import { motion } from "framer-motion";

import ConditionalMount from "./ConditionalMount";
import { SectionHeader } from "./sections/SectionHeader";

// Section components
import PersonalInfoSection from "./sections/PersonalInfoSection";
import FoodRecallSection from "./sections/FoodRecallSection";
import WeekendDietSection from "./sections/WeekendDietSection";
import QuestionnaireSection from "./sections/QuestionnaireSection";
import FoodFrequencySection from "./sections/FoodFrequencySection";
import HealthProfileSection from "./sections/HealthProfileSection";
import DietPrescribedSection from "./sections/DietPrescribedSection";
import BodyMeasurementsSection from "./sections/BodyMeasurementsSection";
import PrePostImageGrid from "./sections/PrePostImageGrid";
import NotesSection from "./sections/NotesSection";

interface DoctorNotesShellProps {
  formData: DoctorNotesFormData;
  createdAt?: string;
  updatedAt?: string;
  isDraft?: boolean;
  onEdit?: () => void;
  attachments?: DoctorNoteAttachment[];
  onAttachmentDeleted?: () => void; // Callback to refresh data after deletion
  appointmentId?: string; // Appointment ID for sending emails
  patientEmail?: string | null; // Patient email for email sending
}

export default function DoctorNotesShell({
  formData,
  createdAt,
  updatedAt,
  isDraft,
  onEdit,
  attachments = [],
  onAttachmentDeleted,
  appointmentId,
  patientEmail,
}: DoctorNotesShellProps) {
  // Section toggle state - tracks which sections are open
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["section1"]) // Default: first section open
  );

  // Toggle section open/closed
  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Ensure attachments is always an array
  const apiAttachments = Array.isArray(attachments) ? attachments : [];
  const safeAttachments = apiAttachments;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg border-2 border-emerald-200 p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Doctor Notes</h3>
            {isDraft ? (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                Draft
              </span>
            ) : (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                Completed
              </span>
            )}
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Edit2 className="w-5 h-5" />
            Edit Notes
          </button>
        )}
      </div>

      {/* Timestamps */}
      {(createdAt || updatedAt) && (
        <div className="mb-8 pb-6 border-b-2 border-slate-300 flex flex-wrap gap-6 text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
          {createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Created:{" "}
                {new Date(createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {updatedAt && updatedAt !== createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Updated:{" "}
                {new Date(updatedAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Form Data Preview */}
      <div className="space-y-8 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        {/* Section 1: Personal Info */}
        <div>
          <SectionHeader
            title="Section 1 — Personal Info"
            sectionId="section1"
            isOpen={openSections.has("section1")}
            onToggle={() => toggleSection("section1")}
          />
          <ConditionalMount isOpen={openSections.has("section1")}>
            <PersonalInfoSection formData={formData} />
          </ConditionalMount>
        </div>

        {/* Section 2: 24-Hour Food Recall (Heavy - with lazy mount) */}
        <div>
          <SectionHeader
            title="Section 2 — 24-Hour Food Recall"
            sectionId="section2"
            isOpen={openSections.has("section2")}
            onToggle={() => toggleSection("section2")}
          />
          <ConditionalMount isOpen={openSections.has("section2")}>
            <FoodRecallSection formData={formData} />
          </ConditionalMount>
        </div>

        {/* Section 3: Weekend Diet */}
        <div>
          <SectionHeader
            title="Section 3 — Weekend Diet"
            sectionId="section3"
            isOpen={openSections.has("section3")}
            onToggle={() => toggleSection("section3")}
          />
          <ConditionalMount isOpen={openSections.has("section3")}>
            <WeekendDietSection formData={formData} />
          </ConditionalMount>
        </div>

        {/* Section 4: Questionnaire */}
        <div>
          <SectionHeader
            title="Section 4 — Questionnaire"
            sectionId="section4"
            isOpen={openSections.has("section4")}
            onToggle={() => toggleSection("section4")}
          />
          <ConditionalMount isOpen={openSections.has("section4")}>
            <QuestionnaireSection formData={formData} />
          </ConditionalMount>
        </div>

        {/* Section 5: Food Frequency (Heavy - with lazy mount) */}
        <div>
          <SectionHeader
            title="Section 5 — Food Frequency"
            sectionId="section5"
            isOpen={openSections.has("section5")}
            onToggle={() => toggleSection("section5")}
          />
          <ConditionalMount isOpen={openSections.has("section5")}>
            <FoodFrequencySection foodFrequency={formData.foodFrequency} />
          </ConditionalMount>
        </div>

        {/* Section 6: Health Profile (Heavy - with lazy mount) */}
        <div>
          <SectionHeader
            title="Section 6 — Health Profile"
            sectionId="section6"
            isOpen={openSections.has("section6")}
            onToggle={() => toggleSection("section6")}
          />
          <ConditionalMount isOpen={openSections.has("section6")}>
            <HealthProfileSection
              formData={formData}
              attachments={safeAttachments}
              onAttachmentDeleted={onAttachmentDeleted}
            />
          </ConditionalMount>
        </div>

        {/* Section 7: Diet Prescribed (Heavy - with lazy mount) */}
        <div>
          <SectionHeader
            title="Section 7 — Diet Prescribed"
            sectionId="section7"
            isOpen={openSections.has("section7")}
            onToggle={() => toggleSection("section7")}
          />
          <ConditionalMount isOpen={openSections.has("section7")}>
            <DietPrescribedSection
              formData={formData}
              attachments={safeAttachments}
              appointmentId={appointmentId}
              patientEmail={patientEmail}
            />
          </ConditionalMount>
        </div>

        {/* Section 8: Body Measurements */}
        <div>
          <SectionHeader
            title="Section 8 — Body Measurements"
            sectionId="section8"
            isOpen={openSections.has("section8")}
            onToggle={() => toggleSection("section8")}
          />
          <ConditionalMount isOpen={openSections.has("section8")}>
            <BodyMeasurementsSection formData={formData} />
          </ConditionalMount>
        </div>

        {/* Section 9: Pre & Post Consultation Images (Heavy - with lazy mount) */}
        <div>
          <SectionHeader
            title="Section 9 — Pre & Post Consultation Images"
            sectionId="section9"
            isOpen={openSections.has("section9")}
            onToggle={() => toggleSection("section9")}
          />
          <ConditionalMount isOpen={openSections.has("section9")}>
            <PrePostImageGrid
              attachments={safeAttachments}
              onAttachmentDeleted={onAttachmentDeleted}
            />
          </ConditionalMount>
        </div>

        {/* Section 10: General Notes */}
        <div>
          <SectionHeader
            title="Section 10 — Additional Notes"
            sectionId="section10"
            isOpen={openSections.has("section10")}
            onToggle={() => toggleSection("section10")}
          />
          <ConditionalMount isOpen={openSections.has("section10")}>
            <NotesSection formData={formData} />
          </ConditionalMount>
        </div>
      </div>
    </motion.div>
  );
}
