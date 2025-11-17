"use client";

import React, { useState } from "react";
import { useBookingForm } from "../context/BookingFormContext";
import { Eye } from "lucide-react";
import Image from "next/image";

export default function StepMeasurements() {
  const { form, setForm } = useBookingForm();
  const [showGuide, setShowGuide] = useState(false);

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
        </div>

        {/* Single Eye Icon on the right */}
        <button
          onClick={() => setShowGuide(true)}
          className="p-2 rounded-full hover:bg-slate-100 transition border border-slate-300 flex flex-col items-center justify-center"
        >
          <Eye className="h-4 w-4" />
          Guide
        </button>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className={`input ${!form.weight ? "border-red-500" : ""}`}
          placeholder="Weight (kg)"
          inputMode="numeric"
          value={form.weight || ""}
          onChange={(e) => handleNumberInput("weight", e.target.value)}
        />

        <input
          className={`input ${!form.height ? "border-red-500" : ""}`}
          placeholder="Height (cm)"
          inputMode="numeric"
          value={form.height || ""}
          onChange={(e) => handleNumberInput("height", e.target.value)}
        />

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

      <p className="text-xs text-slate-500 mt-2">
        Use measuring tape — enter values in centimeters.
      </p>

      {/* Single Measurement Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-slate-600 text-lg"
              onClick={() => setShowGuide(false)}
            >
              ✕
            </button>

            <h4 className="text-lg font-semibold mb-3 text-center">
              Measurement Guide
            </h4>

            <Image
              src="/guide_un.png"
              width={300}
              height={300}
              alt="Measurement guide"
              className="rounded-lg mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
