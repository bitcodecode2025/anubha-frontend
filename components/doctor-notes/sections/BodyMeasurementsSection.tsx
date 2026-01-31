"use client";

import React, { useMemo } from "react";
import type { DoctorNotesFormData } from "@/lib/doctor-notes-api";
import { FieldDisplay } from "./shared-helpers";

interface BodyMeasurementsSectionProps {
  formData: Pick<DoctorNotesFormData, "bodyMeasurements">;
}

const BodyMeasurementsSection = ({
  formData,
}: BodyMeasurementsSectionProps) => {
  // Memoize check for whether section has data
  const hasData = useMemo(() => {
    return !!(
      formData.bodyMeasurements &&
      Object.keys(formData.bodyMeasurements).length > 0
    );
  }, [formData.bodyMeasurements]);

  if (!hasData) return null;

  return (
    <div className="mb-6 pb-6 border-b border-slate-200 last:border-b-0">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">
        Section 8 — Body Measurements
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <FieldDisplay
          label="Neck"
          value={formData.bodyMeasurements?.neck}
          unit="cm"
        />
        <FieldDisplay
          label="Chest"
          value={formData.bodyMeasurements?.chest}
          unit="cm"
        />
        <FieldDisplay
          label="Chest Female"
          value={formData.bodyMeasurements?.chestFemale}
          unit="cm"
        />
        <FieldDisplay
          label="Normal Chest Lung"
          value={formData.bodyMeasurements?.normalChestLung}
          unit="cm"
        />
        <FieldDisplay
          label="Expanded Chest Lungs"
          value={formData.bodyMeasurements?.expandedChestLungs}
          unit="cm"
        />
        <FieldDisplay
          label="Arms"
          value={formData.bodyMeasurements?.arms}
          unit="cm"
        />
        <FieldDisplay
          label="Forearms"
          value={formData.bodyMeasurements?.forearms}
          unit="cm"
        />
        <FieldDisplay
          label="Wrist"
          value={formData.bodyMeasurements?.wrist}
          unit="cm"
        />
        <FieldDisplay
          label="Abdomen Upper"
          value={formData.bodyMeasurements?.abdomenUpper}
          unit="cm"
        />
        <FieldDisplay
          label="Abdomen Lower"
          value={formData.bodyMeasurements?.abdomenLower}
          unit="cm"
        />
        <FieldDisplay
          label="Waist"
          value={formData.bodyMeasurements?.waist}
          unit="cm"
        />
        <FieldDisplay
          label="Hip"
          value={formData.bodyMeasurements?.hip}
          unit="cm"
        />
        <FieldDisplay
          label="Thigh Upper"
          value={formData.bodyMeasurements?.thighUpper}
          unit="cm"
        />
        <FieldDisplay
          label="Thigh Lower"
          value={formData.bodyMeasurements?.thighLower}
          unit="cm"
        />
        <FieldDisplay
          label="Calf"
          value={formData.bodyMeasurements?.calf}
          unit="cm"
        />
        <FieldDisplay
          label="Ankle"
          value={formData.bodyMeasurements?.ankle}
          unit="cm"
        />
        <FieldDisplay
          label="Body Weight"
          value={(formData.bodyMeasurements as any)?.bodyWeight}
          unit="kg"
        />
        <FieldDisplay
          label="BMI"
          value={(formData.bodyMeasurements as any)?.bmi}
        />
        <FieldDisplay
          label="Body Fat Ratio"
          value={(formData.bodyMeasurements as any)?.bodyFatRatio}
          unit="%"
        />
        <FieldDisplay
          label="Body Water"
          value={(formData.bodyMeasurements as any)?.bodyWater}
          unit="%"
        />
        <FieldDisplay
          label="Bone Mass"
          value={(formData.bodyMeasurements as any)?.boneMass}
          unit="kg"
        />
        <FieldDisplay
          label="BMR"
          value={(formData.bodyMeasurements as any)?.bmr}
          unit="kcal/day"
        />
        <FieldDisplay
          label="Metabolic Age"
          value={(formData.bodyMeasurements as any)?.metabolicAge}
          unit="years"
        />
        <FieldDisplay
          label="Visceral Fat"
          value={(formData.bodyMeasurements as any)?.visceralFat}
        />
        <FieldDisplay
          label="Subcutaneous Fat"
          value={(formData.bodyMeasurements as any)?.subcutaneousFat}
          unit="%"
        />
        <FieldDisplay
          label="Protein Mass"
          value={(formData.bodyMeasurements as any)?.proteinMass}
          unit="kg"
        />
        <FieldDisplay
          label="Muscle Mass"
          value={(formData.bodyMeasurements as any)?.muscleMass}
          unit="kg"
        />
        <FieldDisplay
          label="Weight Without Fat"
          value={(formData.bodyMeasurements as any)?.weightWithoutFat}
          unit="kg"
        />
        <FieldDisplay
          label="Muscle Rate"
          value={(formData.bodyMeasurements as any)?.muscleRate}
          unit="%"
        />
        <FieldDisplay
          label="Obesity Level"
          value={(formData.bodyMeasurements as any)?.obesityLevel}
        />
      </div>
    </div>
  );
};

export default React.memo(BodyMeasurementsSection);
