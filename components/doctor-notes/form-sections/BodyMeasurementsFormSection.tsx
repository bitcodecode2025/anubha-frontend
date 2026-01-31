"use client";

import React from "react";
import { Input, SubSection } from "./FormUIComponents";

interface BodyMeasurementsFormSectionProps {
  formData: any;
  updateFormData: any;
  getFormValue: any;
}

export default function BodyMeasurementsFormSection({
  formData,
  updateFormData,
  getFormValue,
}: BodyMeasurementsFormSectionProps) {
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

      {/* Body Composition Subsection */}
      <SubSection title="Body Composition">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <Input
            label="Body Weight"
            type="number"
            value={bodyMeasurements.bodyWeight || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "bodyWeight"], val)
            }
            placeholder="in kg"
          />
          <Input
            label="Body Mass Index (BMI)"
            type="number"
            value={bodyMeasurements.bmi || ""}
            onChange={(val) => updateFormData(["bodyMeasurements", "bmi"], val)}
            placeholder="e.g. 22.5"
          />
          <Input
            label="Body Fat Ratio"
            type="number"
            value={bodyMeasurements.bodyFatRatio || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "bodyFatRatio"], val)
            }
            placeholder="in %"
          />
          <Input
            label="Body Water"
            type="number"
            value={bodyMeasurements.bodyWater || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "bodyWater"], val)
            }
            placeholder="in %"
          />
          <Input
            label="Bone Mass"
            type="number"
            value={bodyMeasurements.boneMass || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "boneMass"], val)
            }
            placeholder="in kg"
          />
          <Input
            label="Basal Metabolic Rate (BMR)"
            type="number"
            value={bodyMeasurements.bmr || ""}
            onChange={(val) => updateFormData(["bodyMeasurements", "bmr"], val)}
            placeholder="kcal/day"
          />
          <Input
            label="Metabolic Age"
            type="number"
            value={bodyMeasurements.metabolicAge || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "metabolicAge"], val)
            }
            placeholder="in years"
          />
          <Input
            label="Visceral Fat"
            type="number"
            value={bodyMeasurements.visceralFat || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "visceralFat"], val)
            }
            placeholder="value"
          />
          <Input
            label="Subcutaneous Fat"
            type="number"
            value={bodyMeasurements.subcutaneousFat || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "subcutaneousFat"], val)
            }
            placeholder="in %"
          />
          <Input
            label="Protein Mass"
            type="number"
            value={bodyMeasurements.proteinMass || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "proteinMass"], val)
            }
            placeholder="in kg"
          />
          <Input
            label="Muscle Mass"
            type="number"
            value={bodyMeasurements.muscleMass || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "muscleMass"], val)
            }
            placeholder="in kg"
          />
          <Input
            label="Weight Without Fat"
            type="number"
            value={bodyMeasurements.weightWithoutFat || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "weightWithoutFat"], val)
            }
            placeholder="in kg"
          />
          <Input
            label="Muscle Rate"
            type="number"
            value={bodyMeasurements.muscleRate || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "muscleRate"], val)
            }
            placeholder="in %"
          />
          <Input
            label="Obesity Level"
            type="number"
            value={bodyMeasurements.obesityLevel || ""}
            onChange={(val) =>
              updateFormData(["bodyMeasurements", "obesityLevel"], val)
            }
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
