"use client";

import React from "react";
import {
  Input,
  TextArea,
  Radio,
  Select,
  Checkbox,
  CheckboxWithText,
  FoodQty,
  Qty5Select,
  SubSection,
} from "./FormUIComponents";

interface WeekendDietFormSectionProps {
  formData: any;
  updateFormData: (path: string[], value: any) => void;
  getFormValue: (path: string[]) => any;
}

export default function WeekendDietFormSection({
  formData,
  updateFormData,
  getFormValue,
}: WeekendDietFormSectionProps) {
  const weekendDiet = getFormValue(["weekendDiet"]) || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TextArea
        label="Snacks"
        value={weekendDiet.snacks || ""}
        onChange={(val) => updateFormData(["weekendDiet", "snacks"], val)}
      />
      <TextArea
        label="Starters"
        value={weekendDiet.starters || ""}
        onChange={(val) => updateFormData(["weekendDiet", "starters"], val)}
      />
      <div className="md:col-span-2">
        <TextArea
          label="Main Course"
          value={weekendDiet.mainCourse || ""}
          onChange={(val) => updateFormData(["weekendDiet", "mainCourse"], val)}
        />
      </div>
      <div className="md:col-span-2">
        <Select
          label="Changes in Diet"
          options={[
            "Same",
            "Skip things in weekend",
            "Difference in timing/food pattern/schedule",
          ]}
          value={weekendDiet.changesInDiet || ""}
          onChange={(val) =>
            updateFormData(["weekendDiet", "changesInDiet"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Eating Out — Food Items"
          value={weekendDiet.eatingOutFoodItems || ""}
          onChange={(val) =>
            updateFormData(["weekendDiet", "eatingOutFoodItems"], val)
          }
        />
      </div>
      <Select
        label="Eating Out — Frequency"
        options={[
          "Daily",
          "Times in week",
          "Times in month",
          "Times in 6 months",
        ]}
        value={weekendDiet.eatingOutFrequency || ""}
        onChange={(val) =>
          updateFormData(["weekendDiet", "eatingOutFrequency"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="Ordered From Outside — Food Items"
          value={weekendDiet.orderedFromOutsideFoodItems || ""}
          onChange={(val) =>
            updateFormData(["weekendDiet", "orderedFromOutsideFoodItems"], val)
          }
        />
      </div>
      {[
        "Snacks List",
        "Starter List",
        "Main Course List",
        "Sweet Item List",
      ].map((label) => (
        <FoodQty
          key={label}
          label={label}
          checked={
            weekendDiet[label.toLowerCase().replace(/ /g, "")]?.checked || false
          }
          quantity={
            weekendDiet[label.toLowerCase().replace(/ /g, "")]?.quantity || ""
          }
          onCheckedChange={(checked) =>
            updateFormData(
              ["weekendDiet", label.toLowerCase().replace(/ /g, "")],
              { ...weekendDiet[label.toLowerCase().replace(/ /g, "")], checked }
            )
          }
          onQuantityChange={(qty) =>
            updateFormData(
              ["weekendDiet", label.toLowerCase().replace(/ /g, "")],
              {
                ...weekendDiet[label.toLowerCase().replace(/ /g, "")],
                quantity: qty,
              }
            )
          }
        />
      ))}
      <TextArea
        label="Sleeping Time (Weekend)"
        value={weekendDiet.sleepingTime || ""}
        onChange={(val) => updateFormData(["weekendDiet", "sleepingTime"], val)}
        small
      />
      <TextArea
        label="Wakeup Time (Weekend)"
        value={weekendDiet.wakeupTime || ""}
        onChange={(val) => updateFormData(["weekendDiet", "wakeupTime"], val)}
        small
      />
      <TextArea
        label="Nap Time (Weekend)"
        value={weekendDiet.napTime || ""}
        onChange={(val) => updateFormData(["weekendDiet", "napTime"], val)}
        small
      />
    </div>
  );
}
