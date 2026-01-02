"use client";

import React, { useState } from "react";
import { useBookingForm } from "../context/BookingFormContext";
import { Eye, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
              UPPER BODY <span className="text-sm font-normal text-slate-500">(Optional)</span>
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
              LOWER BODY <span className="text-sm font-normal text-slate-500">(Optional)</span>
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

      {/* Measurement Guide Modal Overlay */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
                <h4 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Measurement Guide
                </h4>
                <button
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close guide"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Image Container - Responsive */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 min-h-0">
                <div className="relative w-full flex items-center justify-center max-h-[calc(95vh-180px)]">
                  <div className="relative w-full max-w-3xl">
                    <Image
                      src={
                        isWeightLossPlan
                          ? "/images/body-measurements-reference.webp"
                          : "/guide_un.png"
                      }
                      alt="Body measurements reference guide"
                      width={800}
                      height={1000}
                      className="w-full h-auto rounded-lg shadow-lg object-contain max-h-[calc(95vh-180px)]"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 800px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (
                          isWeightLossPlan &&
                          target.src.includes("body-measurements-reference")
                        ) {
                          target.src =
                            "/images/body-measurements-reference.webp";
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50">
                <p className="text-xs sm:text-sm text-slate-600 text-center">
                  Use this guide to accurately measure your body parts. All
                  measurements should be in centimeters (cm).
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
