"use client";

import React, { useMemo } from "react";
import type { DoctorNotesFormData } from "@/lib/doctor-notes-api";
import { FieldDisplay } from "./shared-helpers";

interface PersonalInfoSectionProps {
  formData: Pick<
    DoctorNotesFormData,
    | "personalHistory"
    | "reasonForJoiningProgram"
    | "ethnicity"
    | "joiningDate"
    | "expiryDate"
    | "dietPrescriptionDate"
    | "durationOfDiet"
    | "previousDietTaken"
    | "previousDietDetails"
    | "typeOfDietTaken"
    | "maritalStatus"
    | "numberOfChildren"
    | "dietPreference"
    | "wakeupTime"
    | "bedTime"
    | "dayNap"
    | "workoutTiming"
    | "workoutType"
  >;
}

const PersonalInfoSection = ({ formData }: PersonalInfoSectionProps) => {
  // Memoize check for whether section has data
  const hasData = useMemo(() => {
    return !!(
      formData.personalHistory ||
      formData.reasonForJoiningProgram ||
      formData.ethnicity ||
      formData.joiningDate ||
      formData.expiryDate ||
      formData.dietPrescriptionDate ||
      formData.durationOfDiet ||
      formData.previousDietTaken ||
      formData.previousDietDetails ||
      formData.typeOfDietTaken ||
      formData.maritalStatus ||
      (formData.numberOfChildren !== undefined &&
        formData.numberOfChildren !== null) ||
      formData.dietPreference ||
      formData.wakeupTime ||
      formData.bedTime ||
      formData.dayNap ||
      formData.workoutTiming ||
      formData.workoutType
    );
  }, [formData]);

  if (!hasData) return null;

  return (
    <div className="mb-6 pb-6 border-b border-slate-200">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">
        Section 1 — Personal Info
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldDisplay
          label="Personal History"
          value={formData.personalHistory}
        />
        <FieldDisplay
          label="Reason for Joining Program"
          value={formData.reasonForJoiningProgram}
        />
        <FieldDisplay label="Ethnicity" value={formData.ethnicity} />
        <FieldDisplay label="Joining Date" value={formData.joiningDate} />
        <FieldDisplay label="Expiry Date" value={formData.expiryDate} />
        <FieldDisplay
          label="Diet Prescription Date"
          value={formData.dietPrescriptionDate}
        />
        <FieldDisplay
          label="Duration of Diet"
          value={formData.durationOfDiet}
        />
        <FieldDisplay
          label="Previous Diet Taken"
          value={formData.previousDietTaken}
        />
        <FieldDisplay
          label="Previous Diet Details"
          value={formData.previousDietDetails}
        />
        <FieldDisplay
          label="Type of Diet Taken"
          value={formData.typeOfDietTaken}
        />
        <FieldDisplay
          label="Marital Status"
          value={formData.maritalStatus}
        />
        <FieldDisplay
          label="Number of Children"
          value={
            formData.numberOfChildren !== undefined &&
            formData.numberOfChildren !== null
              ? formData.numberOfChildren
              : "—"
          }
        />
        <FieldDisplay
          label="Diet Preference"
          value={formData.dietPreference}
        />
        <FieldDisplay label="Wakeup Time" value={formData.wakeupTime} />
        <FieldDisplay label="Bed Time" value={formData.bedTime} />
        <FieldDisplay label="Day Nap" value={formData.dayNap} />
        <FieldDisplay
          label="Workout Timing"
          value={formData.workoutTiming}
        />
        <FieldDisplay label="Workout Type" value={formData.workoutType} />
      </div>
    </div>
  );
};

export default React.memo(PersonalInfoSection);
