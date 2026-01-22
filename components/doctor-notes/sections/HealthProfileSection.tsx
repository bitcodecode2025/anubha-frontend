"use client";

import React, { useMemo } from "react";
import type { DoctorNotesFormData, DoctorNoteAttachment } from "@/lib/doctor-notes-api";
import { FieldDisplay } from "./shared-helpers";
import MedicalReportCard from "./attachment-cards/MedicalReportCard";

interface HealthProfileSectionProps {
  formData: Pick<DoctorNotesFormData, "healthProfile">;
  attachments?: DoctorNoteAttachment[];
  onAttachmentDeleted?: () => void;
}

const HealthProfileSection = ({
  formData,
  attachments = [],
  onAttachmentDeleted,
}: HealthProfileSectionProps) => {
  // Memoize check for whether section has data
  const hasData = useMemo(() => {
    return !!(
      formData.healthProfile &&
      Object.keys(formData.healthProfile).length > 0
    );
  }, [formData.healthProfile]);

  // Memoize all conditions list
  const allConditions = useMemo(
    () => [
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
    ],
    []
  );

  // Memoize medical reports filtering
  const medicalReports = useMemo(() => {
    const apiAttachments = Array.isArray(attachments) ? attachments : [];
    return apiAttachments.filter((att) => {
      const isReportPath = att.filePath?.includes("/reports/");
      const hasReportCategory =
        att.fileCategory === "LAB_REPORT" || att.fileCategory === "OTHER";
      const hasHealthProfileSection = att.section === "HealthProfile";
      return isReportPath || (hasReportCategory && hasHealthProfileSection);
    });
  }, [attachments]);

  // Memoize conditions rendering
  const conditionsJSX = useMemo(() => {
    if (!formData.healthProfile?.conditions) return null;

    if (Array.isArray(formData.healthProfile.conditions)) {
      return allConditions.map((conditionName) => {
        const condition = formData.healthProfile?.conditions?.find(
          (c: any) => c?.name === conditionName
        );
        const hasCondition = condition?.hasCondition || "No";
        return (
          <div
            key={conditionName}
            className="bg-white rounded p-3 border border-emerald-200"
          >
            <div className="font-medium text-slate-900 mb-1">
              {conditionName}
            </div>
            <div
              className={`text-sm font-semibold ${
                hasCondition === "Yes"
                  ? "text-emerald-600"
                  : "text-slate-500"
              }`}
            >
              {hasCondition}
            </div>
            {hasCondition === "Yes" && condition?.notes && (
              <div className="text-xs text-slate-600 mt-1">
                {condition.notes}
              </div>
            )}
          </div>
        );
      });
    } else {
      return allConditions.map((conditionName) => {
        const conditionData = (formData.healthProfile?.conditions as any)?.[
          conditionName
        ];
        const hasCondition = conditionData?.hasCondition || "No";
        return (
          <div
            key={conditionName}
            className="bg-white rounded p-3 border border-emerald-200"
          >
            <div className="font-medium text-slate-900 mb-1">
              {conditionName}
            </div>
            <div
              className={`text-sm font-semibold ${
                hasCondition === "Yes"
                  ? "text-emerald-600"
                  : "text-slate-500"
              }`}
            >
              {hasCondition}
            </div>
            {hasCondition === "Yes" && conditionData?.notes && (
              <div className="text-xs text-slate-600 mt-1">
                {conditionData.notes}
              </div>
            )}
          </div>
        );
      });
    }
  }, [formData.healthProfile?.conditions, allConditions]);

  if (!hasData) return null;

  const hasConditions =
    formData.healthProfile?.conditions &&
    (Array.isArray(formData.healthProfile.conditions)
      ? formData.healthProfile.conditions.length > 0
      : Object.keys(formData.healthProfile.conditions).length > 0);

  return (
    <div className="mb-6 pb-6 border-b border-slate-200">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">
        Section 6 — Health Profile
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldDisplay
          label="Physical Activity Level"
          value={formData.healthProfile?.physicalActivityLevel}
        />
        <FieldDisplay
          label="Sleep Quality"
          value={formData.healthProfile?.sleepQuality}
        />
        <div className="md:col-span-2">
          <FieldDisplay
            label="Insomnia/Pills Details"
            value={formData.healthProfile?.insomniaPillsDetails}
          />
        </div>
        <div className="md:col-span-2">
          <FieldDisplay
            label="Disturbance Due to Urine Break"
            value={formData.healthProfile?.disturbanceDueToUrineBreak}
          />
        </div>

        {/* Health Conditions */}
        {hasConditions && (
          <div className="md:col-span-2">
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-700 mb-3">
                Health Conditions
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {conditionsJSX}
              </div>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <FieldDisplay
            label="Medication Name"
            value={formData.healthProfile?.medicationName}
          />
        </div>
        <div className="md:col-span-2">
          <FieldDisplay
            label="Medication Reason"
            value={formData.healthProfile?.medicationReason}
          />
        </div>
        <div className="md:col-span-2">
          <FieldDisplay
            label="Medication Timing & Quantity"
            value={formData.healthProfile?.medicationTimingQuantity}
          />
        </div>
        <FieldDisplay
          label="Pregnancy"
          value={formData.healthProfile?.pregnancy}
        />
        <FieldDisplay
          label="Planning Pregnancy"
          value={formData.healthProfile?.planningPregnancy}
        />
        <div className="md:col-span-2">
          <FieldDisplay
            label="If Yes, Planning When?"
            value={formData.healthProfile?.planningPregnancyWhen}
          />
        </div>

        {/* Family History */}
        {formData.healthProfile?.familyHistory &&
          Object.keys(formData.healthProfile.familyHistory).length > 0 && (
            <div className="md:col-span-2">
              <div className="bg-slate-50 rounded-lg p-4">
                <h5 className="font-semibold text-slate-700 mb-3">
                  Family History
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FieldDisplay
                    label="Father"
                    value={formData.healthProfile.familyHistory.father}
                  />
                  <FieldDisplay
                    label="Mother"
                    value={formData.healthProfile.familyHistory.mother}
                  />
                  <FieldDisplay
                    label="Siblings"
                    value={formData.healthProfile.familyHistory.siblings}
                  />
                </div>
              </div>
            </div>
          )}

        {/* Medical Reports - Subsection of Section 6 */}
        {medicalReports.length > 0 && (
          <div className="md:col-span-2 mt-6 pt-6 border-t-2 border-emerald-200">
            <h5 className="text-lg font-bold text-emerald-700 mb-4">
              Medical Reports
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {medicalReports.map((report, index) => (
                <MedicalReportCard
                  key={report.id || index}
                  attachment={report}
                  onAttachmentDeleted={onAttachmentDeleted}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(HealthProfileSection);
