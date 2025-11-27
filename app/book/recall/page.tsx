"use client";

import React, { useEffect, useState } from "react";
import { useBookingForm } from "../context/BookingFormContext";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createPatient } from "@/lib/patient";
import toast from "react-hot-toast";

/* -------------------------------
   Types
----------------------------------*/
type RecallEntry = {
  id: string;
  mealType: string;
  time: string;
  foodItem: string;
  quantity: string;
  notes?: string;
};

const MEAL_TYPES = [
  { value: "PRE_WAKEUP", label: "Pre-wakeup" },
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "MID_MEAL", label: "Mid-meal" },
  { value: "LUNCH", label: "Lunch" },
  { value: "MID_EVENING", label: "Mid-evening" },
  { value: "DINNER", label: "Dinner" },
  { value: "OTHER", label: "Other" },
];

export default function RecallPage() {
  const { form, setForm } = useBookingForm();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -------------------------------
     Block access if no plan selected
  ----------------------------------*/
  useEffect(() => {
    if (!form.planSlug || !form.planName) {
      router.replace("/services");
    }
  }, [form]);

  /* -------------------------------
     Helpers
  ----------------------------------*/
  function createEntry(): RecallEntry {
    return {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      mealType: "",
      time: "",
      foodItem: "",
      quantity: "",
      notes: "",
    };
  }

  /* -------------------------------
     Always keep at least ONE card
  ----------------------------------*/
  const recallEntries: RecallEntry[] =
    form.recallEntries && form.recallEntries.length > 0
      ? form.recallEntries
      : [createEntry()];

  /* -------------------------------
     Handlers
  ----------------------------------*/
  function addEntry() {
    setForm({
      recallEntries: [...recallEntries, createEntry()],
    });
  }

  function deleteEntry(id: string) {
    let updated = recallEntries.filter((e) => e.id !== id);

    // Always keep ONE entry minimum
    if (updated.length === 0) updated = [createEntry()];

    setForm({ recallEntries: updated });
  }

  function updateEntry(
    id: string,
    field: keyof Omit<RecallEntry, "id">,
    value: string
  ) {
    const updated = recallEntries.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry
    );

    setForm({ recallEntries: updated });
  }

  function updateUniversalNotes(value: string) {
    setForm({ recallNotes: value });
  }

  async function submitRecall() {
    // If patientId already exists (user selected existing patient), skip creation
    if (form.patientId) {
      router.push("/book/slot");
      return;
    }

    // Validate required fields before creating patient
    if (
      !form.fullName ||
      !form.mobile ||
      !form.email ||
      !form.dob ||
      !form.age ||
      !form.gender ||
      !form.address ||
      !form.weight ||
      !form.height ||
      !form.neck ||
      !form.waist ||
      !form.hip ||
      !form.bowel ||
      !form.waterIntake ||
      !form.wakeUpTime ||
      !form.sleepTime ||
      !form.sleepQuality
    ) {
      toast.error("Please complete all required fields in previous steps");
      router.push("/book/user-details");
      return;
    }

    setIsSubmitting(true);

    try {
      // Map form fields to backend schema
      const patientData = {
        name: form.fullName,
        phone: form.mobile.replace(/\D/g, ""), // Remove non-digits
        gender: form.gender.toUpperCase(), // MALE, FEMALE, OTHER
        email: form.email,
        dateOfBirth: form.dob,
        age: Number(form.age),
        address: form.address,
        weight: Number(form.weight),
        height: Number(form.height),
        neck: Number(form.neck),
        waist: Number(form.waist),
        hip: Number(form.hip),
        medicalHistory: form.medicalHistory || undefined,
        appointmentConcerns: form.appointmentConcerns || undefined,
        bowelMovement: form.bowel.toUpperCase(), // NORMAL, CONSTIPATION, etc.
        dailyFoodIntake: form.dailyFood || undefined,
        dailyWaterIntake: Number(form.waterIntake),
        wakeUpTime: form.wakeUpTime,
        sleepTime: form.sleepTime,
        sleepQuality: form.sleepQuality.toUpperCase(), // NORMAL, IRREGULAR, etc.
        fileIds: [], // TODO: Handle file uploads if needed
      };

      const response = await createPatient(patientData);

      if (response.success && response.patient?.id) {
        // Update form with the created patient ID
        setForm({
          patientId: response.patient.id,
        });

        toast.success("Patient details saved successfully!");
        router.push("/book/slot");
      } else {
        throw new Error(response.message || "Failed to create patient");
      }
    } catch (error: any) {
      console.error("Failed to create patient:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save patient details. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goBack() {
    router.push("/book/user-details");
  }

  /* -------------------------------
     UI
  ----------------------------------*/
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f9fcfa] to-[#f1f7f3] py-10 px-4 sm:px-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* PLAN BANNER */}
        {form.planName && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <p className="font-semibold text-emerald-900 text-lg">
              Booking: {form.planName}
              {form.planPackageName ? ` — ${form.planPackageName}` : ""}
            </p>
            <p className="text-emerald-700 text-sm">Price: {form.planPrice}</p>
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl font-semibold text-emerald-700 mb-2">
          24-Hour Diet Recall
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Add everything you ate and drank in the last 24 hours.
        </p>

        {/* Add Entry Button */}
        <button
          onClick={addEntry}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:brightness-110"
        >
          <Plus className="w-4 h-4" /> Add food entry
        </button>

        {/* Entry Cards */}
        <div className="space-y-6 mb-8">
          {recallEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="border border-slate-200 rounded-xl p-4 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  Entry {index + 1}
                </h3>

                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="flex items-center gap-1 text-red-500 text-xs hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Meal Type */}
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Meal type
                  </label>
                  <select
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={entry.mealType}
                    onChange={(e) =>
                      updateEntry(entry.id, "mealType", e.target.value)
                    }
                  >
                    <option value="">Select meal type</option>
                    {MEAL_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={entry.time}
                    onChange={(e) =>
                      updateEntry(entry.id, "time", e.target.value)
                    }
                  />
                </div>

                {/* Food Item */}
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Food item
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Poha"
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={entry.foodItem}
                    onChange={(e) =>
                      updateEntry(entry.id, "foodItem", e.target.value)
                    }
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Quantity / portion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1 bowl"
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={entry.quantity}
                    onChange={(e) =>
                      updateEntry(entry.id, "quantity", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Entry Notes */}
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Anything special about this intake?"
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  value={entry.notes ?? ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "notes", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* UNIVERSAL NOTES SECTION */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-8">
          <h3 className="font-semibold text-slate-800 mb-2 text-sm">
            Additional notes (overall)
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Share anything else the dietitian should know — cravings, sleep,
            routine, stress, hydration, eating patterns, or anything personal.
          </p>
          <textarea
            rows={4}
            placeholder="Write here..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            value={form.recallNotes ?? ""}
            onChange={(e) => updateUniversalNotes(e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between">
          <button
            onClick={goBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-100"
          >
            ← Back
          </button>

          <button
            onClick={submitRecall}
            disabled={isSubmitting}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue →"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
