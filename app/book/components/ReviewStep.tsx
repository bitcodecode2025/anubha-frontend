"use client";

import React from "react";
import { useBookingForm } from "../context/BookingFormContext";

import { User, Ruler, HeartPulse, Activity, ClipboardList } from "lucide-react";

export default function ReviewStep() {
  const { form } = useBookingForm();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800">
        Review Your Details
      </h3>

      {/* PERSONAL DETAILS */}
      <ReviewCard
        title="Personal Details"
        icon={<User className="text-emerald-600" size={18} />}
        items={[
          { label: "Full Name", value: form.fullName },
          { label: "Mobile", value: form.mobile },
          { label: "Email", value: form.email },
          { label: "Date of Birth", value: form.dob },
          { label: "Age", value: form.age?.toString() },
          { label: "Gender", value: form.gender },
          { label: "Address", value: form.address },
        ]}
      />

      {/* MEASUREMENTS */}
      <ReviewCard
        title="Measurements"
        icon={<Ruler className="text-emerald-600" size={18} />}
        items={[
          { label: "Weight", value: form.weight ? `${form.weight} kg` : "" },
          { label: "Height", value: form.height ? `${form.height} cm` : "" },
          { label: "Neck", value: form.neck ? `${form.neck} cm` : "" },
          { label: "Waist", value: form.waist ? `${form.waist} cm` : "" },
          { label: "Hip", value: form.hip ? `${form.hip} cm` : "" },
        ]}
      />

      {/* MEDICAL DETAILS */}
      <ReviewCard
        title="Medical Details"
        icon={<HeartPulse className="text-emerald-600" size={18} />}
        items={[
          { label: "Medical History", value: form.medicalHistory },
          {
            label: "Appointment Concerns",
            value: form.appointmentConcerns,
          },
        ]}
      />

      {/* LIFESTYLE */}
      <ReviewCard
        title="Lifestyle & Habits"
        icon={<Activity className="text-emerald-600" size={18} />}
        items={[
          { label: "Bowel Movement", value: form.bowel },
          { label: "Daily Food Intake", value: form.dailyFood },
          { label: "Water Intake", value: form.waterIntake },
          { label: "Wake Up Time", value: form.wakeUpTime },
          { label: "Sleep Time", value: form.sleepTime },
          { label: "Sleep Quality", value: form.sleepQuality },
          { label: "Food Preference", value: form.foodPreference },
          {
            label: "Allergies / Intolerances",
            value: form.allergiesIntolerance,
          },
        ]}
      />

      {/* PLAN (Optional – if user selected plan earlier) */}
      {form.planName && (
        <ReviewCard
          title="Selected Plan"
          icon={<ClipboardList className="text-emerald-600" size={18} />}
          items={[
            { label: "Plan Name", value: form.planName },
            {
              label: "Price",
              value: form.planPrice ? `${form.planPrice}` : null,
            },
          ]}
        />
      )}

      <p className="text-xs text-slate-500">
        Please verify all information before slot selection.
      </p>
    </div>
  );
}

/* ------------------------------
  REUSABLE REVIEW CARD COMPONENT
------------------------------ */
function ReviewCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { label: string; value: string | null | undefined }[];
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ecf7ed]">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-semibold text-slate-800">{title}</h4>
      </div>

      <div className="space-y-2 text-sm">
        {items.map(
          (item, idx) =>
            item.value && (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2"
              >
                <span className="text-slate-500 sm:min-w-[140px] sm:shrink-0">
                  {item.label}
                </span>
                <span className="font-medium text-slate-800 break-words">
                  {item.value}
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
}
