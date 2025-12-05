"use client";

import React, { useState } from "react";
import { useBookingForm } from "../context/BookingFormContext";
import { Eye } from "lucide-react";
import Image from "next/image";

interface StepMeasurementsProps {
  error?: string | null;
  fieldErrors?: Record<string, string>;
}

export default function StepMeasurements({
  error,
  fieldErrors,
}: StepMeasurementsProps) {
  const { form, setForm } = useBookingForm();
  const [showGuide, setShowGuide] = useState(false);

  // Check if weight loss plan is selected
  const isWeightLossPlan = form.planSlug === "weight-loss";

  // Only allow numeric values
  function handleNumberInput(key: keyof typeof form, value: string) {
    const cleaned = value.replace(/\D/g, ""); // remove non-numeric
    setForm({ [key]: cleaned });
  }

  return (
    <div>
      {/* Header + Eye Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Body Measurements cm/kg </h3>
          {isWeightLossPlan && (
            <p className="text-sm text-[#6B9B6A] mt-1">
              Detailed measurements for weight loss plan
            </p>
          )}
        </div>

        {/* Single Eye Icon on the right */}
        <button
          onClick={() => setShowGuide(true)}
          className="p-2 rounded-full hover:bg-[#E8E0D6] transition border border-[#D4C4B0] flex flex-col items-center justify-center"
        >
          <Eye className="h-4 w-4" />
          Guide
        </button>
      </div>

      {/* Mandatory Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <input
            className={`input ${fieldErrors?.weight ? "border-red-500" : ""}`}
            placeholder="Weight (kg) *"
            inputMode="numeric"
            value={form.weight || ""}
            onChange={(e) => handleNumberInput("weight", e.target.value)}
            required
          />
          {fieldErrors?.weight && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.weight}</p>
          )}
        </div>

        <div>
          <input
            className={`input ${fieldErrors?.height ? "border-red-500" : ""}`}
            placeholder="Height (cm) *"
            inputMode="numeric"
            value={form.height || ""}
            onChange={(e) => handleNumberInput("height", e.target.value)}
            required
          />
          {fieldErrors?.height && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.height}</p>
          )}
        </div>
      </div>

      {/* Basic Measurements (always shown, not in sections) */}
      {!isWeightLossPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            className="input"
            placeholder="Neck (cm)"
            inputMode="numeric"
            value={form.neck || ""}
            onChange={(e) => handleNumberInput("neck", e.target.value)}
          />

          <input
            className="input"
            placeholder="Waist (cm)"
            inputMode="numeric"
            value={form.waist || ""}
            onChange={(e) => handleNumberInput("waist", e.target.value)}
          />

          <input
            className="input"
            placeholder="Hip (cm)"
            inputMode="numeric"
            value={form.hip || ""}
            onChange={(e) => handleNumberInput("hip", e.target.value)}
          />
        </div>
      )}

      {/* Detailed Measurements (only for weight loss plan) */}
      {isWeightLossPlan && (
        <div className="space-y-6">
          {/* Upper Body Section */}
          <div className="border-2 border-[#D4C4B0] rounded-lg p-4 bg-[#F7F3ED]/50">
            <h4 className="text-base font-semibold text-[#4A7A49] mb-4">
              UPPER BODY
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="input"
                placeholder="Neck (cm)"
                inputMode="numeric"
                value={form.neck || ""}
                onChange={(e) => handleNumberInput("neck", e.target.value)}
              />

              <input
                className="input"
                placeholder="Chest (cm)"
                inputMode="numeric"
                value={form.chest || ""}
                onChange={(e) => handleNumberInput("chest", e.target.value)}
              />

              <input
                className="input"
                placeholder="Chest Female (cm)"
                inputMode="numeric"
                value={form.chestFemale || ""}
                onChange={(e) =>
                  handleNumberInput("chestFemale", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Normal Chest Lung (cm)"
                inputMode="numeric"
                value={form.normalChestLung || ""}
                onChange={(e) =>
                  handleNumberInput("normalChestLung", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Expanded Chest Lungs (cm)"
                inputMode="numeric"
                value={form.expandedChestLungs || ""}
                onChange={(e) =>
                  handleNumberInput("expandedChestLungs", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Arms (cm)"
                inputMode="numeric"
                value={form.arms || ""}
                onChange={(e) => handleNumberInput("arms", e.target.value)}
              />

              <input
                className="input"
                placeholder="Forearms (cm)"
                inputMode="numeric"
                value={form.forearms || ""}
                onChange={(e) => handleNumberInput("forearms", e.target.value)}
              />

              <input
                className="input"
                placeholder="Wrist (cm)"
                inputMode="numeric"
                value={form.wrist || ""}
                onChange={(e) => handleNumberInput("wrist", e.target.value)}
              />
            </div>
          </div>

          {/* Lower Body Section */}
          <div className="border-2 border-[#D4C4B0] rounded-lg p-4 bg-[#F7F3ED]/50">
            <h4 className="text-base font-semibold text-[#4A7A49] mb-4">
              LOWER BODY
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="input"
                placeholder="Abdomen Upper (cm)"
                inputMode="numeric"
                value={form.abdomenUpper || ""}
                onChange={(e) =>
                  handleNumberInput("abdomenUpper", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Abdomen Lower (cm)"
                inputMode="numeric"
                value={form.abdomenLower || ""}
                onChange={(e) =>
                  handleNumberInput("abdomenLower", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Waist (cm)"
                inputMode="numeric"
                value={form.waist || ""}
                onChange={(e) => handleNumberInput("waist", e.target.value)}
              />

              <input
                className="input"
                placeholder="Hip (cm)"
                inputMode="numeric"
                value={form.hip || ""}
                onChange={(e) => handleNumberInput("hip", e.target.value)}
              />

              <input
                className="input"
                placeholder="Thigh Upper (cm)"
                inputMode="numeric"
                value={form.thighUpper || ""}
                onChange={(e) =>
                  handleNumberInput("thighUpper", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Thigh Lower (cm)"
                inputMode="numeric"
                value={form.thighLower || ""}
                onChange={(e) =>
                  handleNumberInput("thighLower", e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Calf (cm)"
                inputMode="numeric"
                value={form.calf || ""}
                onChange={(e) => handleNumberInput("calf", e.target.value)}
              />

              <input
                className="input"
                placeholder="Ankle (cm)"
                inputMode="numeric"
                value={form.ankle || ""}
                onChange={(e) => handleNumberInput("ankle", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-[#6B6A5F] mt-2">
        * Required fields. Use measuring tape — enter values in centimeters.
      </p>

      {/* Measurement Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F7F3ED] p-4 rounded-lg shadow-lg w-[90%] max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-[#4A4842] text-lg hover:text-[#2D2A24] z-10"
              onClick={() => setShowGuide(false)}
            >
              ✕
            </button>

            <h4 className="text-lg font-semibold mb-3 text-center text-[#2D2A24]">
              Measurement Guide
            </h4>

            <div className="flex justify-center">
              <img
                src={
                  isWeightLossPlan
                    ? "/images/body-measurement.reference.jpg"
                    : "/guide_un.png"
                }
                alt="Measurement guide"
                className="rounded-lg mx-auto object-contain w-full max-w-sm sm:max-w-md md:max-w-lg"
                style={{ maxHeight: "70vh" }}
                onError={(e) => {
                  // Fallback to alternative filename if the requested one doesn't exist
                  const target = e.target as HTMLImageElement;
                  if (
                    isWeightLossPlan &&
                    target.src.includes("body-measurement.reference.jpg")
                  ) {
                    target.src = "/images/body-measurements-reference.jpg";
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
