"use client";

import React, { useMemo } from "react";
import type { DoctorNotesFormData } from "@/lib/doctor-notes-api";
import { FieldDisplay } from "./shared-helpers";

interface WeekendDietSectionProps {
  formData: Pick<DoctorNotesFormData, "weekendDiet">;
}

const WeekendDietSection = ({ formData }: WeekendDietSectionProps) => {
  // Memoize check for whether section has data
  const hasData = useMemo(() => {
    return !!(
      formData.weekendDiet &&
      Object.keys(formData.weekendDiet).length > 0
    );
  }, [formData.weekendDiet]);

  // Memoize list items
  const listItems = useMemo(
    () => [
      { key: "snackslist", label: "Snacks List" },
      { key: "starterlist", label: "Starter List" },
      { key: "maincourselist", label: "Main Course List" },
      { key: "sweetitemlist", label: "Sweet Item List" },
    ],
    []
  );

  if (!hasData) return null;

  return (
    <div className="mb-6 pb-6 border-b border-slate-200">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">
        Section 3 — Weekend Diet
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldDisplay
          label="Snacks"
          value={formData.weekendDiet?.snacks}
        />
        <FieldDisplay
          label="Starters"
          value={formData.weekendDiet?.starters}
        />
        <div className="md:col-span-2">
          <FieldDisplay
            label="Main Course"
            value={formData.weekendDiet?.mainCourse}
          />
        </div>
        <div className="md:col-span-2">
          <FieldDisplay
            label="Changes in Diet"
            value={formData.weekendDiet?.changesInDiet}
          />
        </div>
        <div className="md:col-span-2">
          <FieldDisplay
            label="Eating Out — Food Items"
            value={formData.weekendDiet?.eatingOutFoodItems}
          />
        </div>
        <FieldDisplay
          label="Eating Out — Frequency"
          value={formData.weekendDiet?.eatingOutFrequency}
        />
        <div className="md:col-span-2">
          <FieldDisplay
            label="Ordered From Outside — Food Items"
            value={formData.weekendDiet?.orderedFromOutsideFoodItems}
          />
        </div>
        {listItems.map(({ key, label }) => {
          const item = (formData.weekendDiet as any)?.[key];
          const isChecked = item?.checked === true;
          return (
            <div key={key} className="bg-white rounded p-2">
              <div className="font-medium text-slate-900">
                {label}: {isChecked ? "Yes" : "No"}
              </div>
              {isChecked && item.quantity && (
                <div className="text-sm text-slate-600">
                  Quantity: {item.quantity}
                </div>
              )}
            </div>
          );
        })}
        <FieldDisplay
          label="Sleeping Time (Weekend)"
          value={formData.weekendDiet?.sleepingTime}
        />
        <FieldDisplay
          label="Wakeup Time (Weekend)"
          value={formData.weekendDiet?.wakeupTime}
        />
        <FieldDisplay
          label="Nap Time (Weekend)"
          value={formData.weekendDiet?.napTime}
        />
      </div>
    </div>
  );
};

export default React.memo(WeekendDietSection);