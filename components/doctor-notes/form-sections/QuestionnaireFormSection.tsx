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

interface QuestionnaireFormSectionProps {
  formData: any;
  updateFormData: (path: string[], value: any) => void;
  getFormValue: (path: string[]) => any;
}

export default function QuestionnaireFormSection({
  formData,
  updateFormData,
  getFormValue,
}: QuestionnaireFormSectionProps) {
  const questionnaire = getFormValue(["questionnaire"]) || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Radio
        label="Food Allergies"
        options={["Yes", "No"]}
        value={questionnaire.foodAllergies || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "foodAllergies"], val)
        }
      />
      <Radio
        label="Food Intolerance"
        options={["Yes", "No"]}
        value={questionnaire.foodIntolerance || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "foodIntolerance"], val)
        }
      />
      <div className="md:col-span-2">
        <Select
          label="Intolerance Type"
          options={[
            "Soya",
            "Gluten",
            "Lactose",
            "Citrus Fruits",
            "Egg",
            "Milk",
            "Curd",
            "Other",
          ]}
          value={questionnaire.intoleranceType || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "intoleranceType"], val)
          }
        />
      </div>
      <Select
        label="Eating Speed"
        options={["Quick", "Slow", "Moderate"]}
        value={questionnaire.eatingSpeed || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "eatingSpeed"], val)
        }
      />
      <Select
        label="Activity During Meal"
        options={["Work on PC", "Phone", "TV", "Discussions", "N/A", "Other"]}
        value={questionnaire.activityDuringMeal || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "activityDuringMeal"], val)
        }
      />
      <Radio
        label="Hunger Pangs"
        options={["Yes", "No"]}
        value={questionnaire.hungerPangs || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "hungerPangs"], val)
        }
      />
      <Select
        label="Hunger Pangs Time"
        options={["Morning", "Afternoon", "Evening", "Night"]}
        value={questionnaire.hungerPangsTime || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "hungerPangsTime"], val)
        }
      />
      <div className="md:col-span-2">
        <Radio
          label="Emotional Eater / Mood-based Eating"
          options={["Yes", "No"]}
          value={questionnaire.emotionalEater || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "emotionalEater"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Describe Emotional Eating"
          value={questionnaire.describeEmotionalEating || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "describeEmotionalEating"], val)
          }
        />
      </div>
      <Select
        label="Main Meal"
        options={["Breakfast", "Lunch", "Dinner"]}
        value={questionnaire.mainMeal || ""}
        onChange={(val) => updateFormData(["questionnaire", "mainMeal"], val)}
      />
      <div className="md:col-span-2">
        <TextArea
          label="Snack Foods You Prefer"
          value={questionnaire.snackFoodsPrefer || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "snackFoodsPrefer"], val)
          }
        />
      </div>
      <Radio
        label="Crave Sweets?"
        options={["Yes", "No"]}
        value={questionnaire.craveSweets || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "craveSweets"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="Sweet Types (Chocolates/Indian Sweets)"
          value={questionnaire.sweetTypes || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "sweetTypes"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Specific Likes"
          value={questionnaire.specificLikes || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "specificLikes"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Specific Dislikes"
          value={questionnaire.specificDislikes || ""}
          onChange={(val) =>
            updateFormData(["questionnaire", "specificDislikes"], val)
          }
        />
      </div>
      <Radio
        label="Fasting in Week?"
        options={["Yes", "No"]}
        value={questionnaire.fastingInWeek || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "fastingInWeek"], val)
        }
      />
      <Select
        label="Fasting Reason"
        options={["Religious Based", "Personal Based"]}
        value={questionnaire.fastingReason || ""}
        onChange={(val) =>
          updateFormData(["questionnaire", "fastingReason"], val)
        }
      />
    </div>
  );
}
