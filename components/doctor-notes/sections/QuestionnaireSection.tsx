"use client";

import React, { useMemo } from "react";
import type { DoctorNotesFormData } from "@/lib/doctor-notes-api";
import { FieldDisplay } from "./shared-helpers";

interface QuestionnaireSectionProps {
  formData: Pick<DoctorNotesFormData, "questionnaire">;
}

const QuestionnaireSection = ({ formData }: QuestionnaireSectionProps) => {
  // Memoize check for whether section has data
  const hasData = useMemo(() => {
    return !!(
      formData.questionnaire &&
      Object.keys(formData.questionnaire).length > 0
    );
  }, [formData.questionnaire]);

  if (!hasData) return null;

  return (
    <div className="mb-6 pb-6 border-b border-slate-200">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">
        Section 4 — Questionnaire
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldDisplay
          label="Food Allergies"
          value={formData.questionnaire?.foodAllergies}
        />
        <FieldDisplay
          label="Food Intolerance"
          value={formData.questionnaire?.foodIntolerance}
        />
        <div className="md:col-span-2">
          <FieldDisplay
            label="Intolerance Type"
            value={formData.questionnaire?.intoleranceType}
          />
        </div>
        <FieldDisplay
          label="Eating Speed"
          value={formData.questionnaire?.eatingSpeed}
        />
        <FieldDisplay
          label="Activity During Meal"
          value={formData.questionnaire?.activityDuringMeal}
        />
        <FieldDisplay
          label="Hunger Pangs"
          value={formData.questionnaire?.hungerPangs}
        />
        <FieldDisplay
          label="Hunger Pangs Time"
          value={formData.questionnaire?.hungerPangsTime}
        />
        <div className="md:col-span-2">
          <FieldDisplay
            label="Emotional Eater / Mood-based Eating"
            value={formData.questionnaire?.emotionalEater}
          />
        </div>
        <div className="md:col-span-2">
          <FieldDisplay
            label="Describe Emotional Eating"
            value={formData.questionnaire?.describeEmotionalEating}
          />
        </div>
        <FieldDisplay
          label="Main Meal"
          value={formData.questionnaire?.mainMeal}
        />
        <div className="md:col-span-2">
          <FieldDisplay
            label="Snack Foods You Prefer"
            value={formData.questionnaire?.snackFoodsPrefer}
          />
        </div>
        <FieldDisplay
          label="Crave Sweets?"
          value={formData.questionnaire?.craveSweets}
        />
        <div className="md:col-span-2">
          <FieldDisplay
            label="Sweet Types (Chocolates/Indian Sweets)"
            value={formData.questionnaire?.sweetTypes}
          />
        </div>
        <div className="md:col-span-2">
          <FieldDisplay
            label="Specific Likes"
            value={formData.questionnaire?.specificLikes}
          />
        </div>
        <div className="md:col-span-2">
          <FieldDisplay
            label="Specific Dislikes"
            value={formData.questionnaire?.specificDislikes}
          />
        </div>
        <FieldDisplay
          label="Fasting in Week?"
          value={formData.questionnaire?.fastingInWeek}
        />
        <FieldDisplay
          label="Fasting Reason"
          value={formData.questionnaire?.fastingReason}
        />
      </div>
    </div>
  );
};

export default React.memo(QuestionnaireSection);