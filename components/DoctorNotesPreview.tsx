"use client";

import React from "react";
import { Stethoscope, Calendar, Edit2 } from "lucide-react";
import { DoctorNotesFormData } from "@/lib/doctor-notes-api";
import { motion } from "framer-motion";

interface DoctorNotesPreviewProps {
  formData: DoctorNotesFormData;
  createdAt?: string;
  updatedAt?: string;
  isDraft?: boolean;
  onEdit?: () => void;
}

// Helper function to format values
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map((v) => formatValue(v)).join(", ");
  }
  if (typeof value === "object") {
    // Don't stringify objects - handle them separately
    return "—";
  }
  return String(value);
};

// Helper to check if a value exists
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value).length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
};

// Field display component
const FieldDisplay = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: any;
  unit?: string;
}) => {
  const formatted = formatValue(value);
  if (formatted === "—") return null;
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-sm font-semibold text-slate-600 mb-1">{label}</div>
      <div className="text-slate-900">
        {formatted}
        {unit && ` ${unit}`}
      </div>
    </div>
  );
};

// Section wrapper
const SectionWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="mb-6 pb-6 border-b border-slate-200 last:border-b-0">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
};

export default function DoctorNotesPreview({
  formData,
  createdAt,
  updatedAt,
  isDraft,
  onEdit,
}: DoctorNotesPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg border-2 border-emerald-200 p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Doctor Notes</h3>
            {isDraft ? (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                Draft
              </span>
            ) : (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                Completed
              </span>
            )}
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Notes
          </button>
        )}
      </div>

      {/* Timestamps */}
      {(createdAt || updatedAt) && (
        <div className="mb-6 pb-4 border-b border-slate-200 flex flex-wrap gap-4 text-sm text-slate-600">
          {createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Created:{" "}
                {new Date(createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {updatedAt && updatedAt !== createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Updated:{" "}
                {new Date(updatedAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Form Data Preview */}
      <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
        {/* Section 1: Personal Info */}
        {(formData.personalHistory ||
          formData.reasonForJoiningProgram ||
          formData.ethnicity ||
          formData.joiningDate ||
          formData.expiryDate ||
          formData.dietPrescriptionDate ||
          formData.durationOfDiet ||
          formData.previousDietTaken ||
          formData.previousDietDetails ||
          formData.typeOfDietTaken ||
          formData.maritalStatus ||
          formData.numberOfChildren ||
          formData.dietPreference ||
          formData.wakeupTime ||
          formData.bedTime ||
          formData.dayNap ||
          formData.workoutTiming ||
          formData.workoutType) && (
          <SectionWrapper title="Section 1 — Personal Info">
            <FieldDisplay
              label="Personal History"
              value={formData.personalHistory}
            />
            <FieldDisplay
              label="Reason for Joining Program"
              value={formData.reasonForJoiningProgram}
            />
            <FieldDisplay label="Ethnicity" value={formData.ethnicity} />
            <FieldDisplay label="Joining Date" value={formData.joiningDate} />
            <FieldDisplay label="Expiry Date" value={formData.expiryDate} />
            <FieldDisplay
              label="Diet Prescription Date"
              value={formData.dietPrescriptionDate}
            />
            <FieldDisplay
              label="Duration of Diet"
              value={formData.durationOfDiet}
            />
            <FieldDisplay
              label="Previous Diet Taken"
              value={formData.previousDietTaken}
            />
            <FieldDisplay
              label="Previous Diet Details"
              value={formData.previousDietDetails}
            />
            <FieldDisplay
              label="Type of Diet Taken"
              value={formData.typeOfDietTaken}
            />
            <FieldDisplay
              label="Marital Status"
              value={formData.maritalStatus}
            />
            <FieldDisplay
              label="Number of Children"
              value={formData.numberOfChildren}
            />
            <FieldDisplay
              label="Diet Preference"
              value={formData.dietPreference}
            />
            <FieldDisplay label="Wakeup Time" value={formData.wakeupTime} />
            <FieldDisplay label="Bed Time" value={formData.bedTime} />
            <FieldDisplay label="Day Nap" value={formData.dayNap} />
            <FieldDisplay
              label="Workout Timing"
              value={formData.workoutTiming}
            />
            <FieldDisplay label="Workout Type" value={formData.workoutType} />
          </SectionWrapper>
        )}

        {/* Section 2: 24-Hour Food Recall */}
        {(formData.morningIntake ||
          formData.breakfast ||
          formData.midMorning ||
          formData.lunch ||
          formData.midDay ||
          formData.eveningSnack ||
          formData.dinner) && (
          <div className="mb-6 pb-6 border-b border-slate-200">
            <h4 className="text-lg font-semibold text-emerald-700 mb-4">
              Section 2 — 24-Hour Food Recall
            </h4>
            <div className="space-y-4">
              {/* Morning Intake */}
              {formData.morningIntake &&
                Object.keys(formData.morningIntake).length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Morning Intake
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FieldDisplay
                        label="Time"
                        value={formData.morningIntake.time}
                      />
                      <FieldDisplay
                        label="Water Intake"
                        value={formData.morningIntake.waterIntake}
                        unit="ml"
                      />
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Medicines"
                          value={formData.morningIntake.medicines}
                        />
                      </div>
                      {formData.morningIntake.tea?.checked && (
                        <FieldDisplay
                          label="Tea"
                          value={formData.morningIntake.tea.type}
                        />
                      )}
                      {formData.morningIntake.coffee?.checked && (
                        <div>☕ Coffee: Yes</div>
                      )}
                      {formData.morningIntake.lemonWater?.checked && (
                        <div>🍋 Lemon Water: Yes</div>
                      )}
                      {formData.morningIntake.garlicHerbs?.checked && (
                        <FieldDisplay
                          label="Garlic & Herbs"
                          value={formData.morningIntake.garlicHerbs.types}
                        />
                      )}
                      {formData.morningIntake.soakedDryFruits?.checked && (
                        <FieldDisplay
                          label="Soaked Dry Fruits"
                          value={
                            formData.morningIntake.soakedDryFruits.quantity
                          }
                        />
                      )}
                      {formData.morningIntake.biscuitToast?.checked && (
                        <FieldDisplay
                          label="Biscuit/Toast"
                          value={formData.morningIntake.biscuitToast.quantity}
                        />
                      )}
                      <FieldDisplay
                        label="Fruits"
                        value={formData.morningIntake.fruits}
                      />
                      <FieldDisplay
                        label="Fruit Quantity"
                        value={formData.morningIntake.fruitQuantity}
                      />
                    </div>
                  </div>
                )}

              {/* Breakfast */}
              {formData.breakfast &&
                Object.keys(formData.breakfast).length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Breakfast
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FieldDisplay
                        label="Time"
                        value={formData.breakfast.time}
                      />
                      {formData.breakfast.roti?.checked && (
                        <>
                          <div>🍞 Roti: Yes</div>
                          {formData.breakfast.roti.ghee && (
                            <FieldDisplay
                              label="Roti Ghee"
                              value={formData.breakfast.roti.ghee}
                            />
                          )}
                        </>
                      )}
                      {formData.breakfast.items &&
                        formData.breakfast.items
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx}>
                              {item.name}
                              {item.quantity && ` (${item.quantity})`}
                            </div>
                          ))}
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other"
                          value={formData.breakfast.other}
                        />
                      </div>
                    </div>
                  </div>
                )}

              {/* Mid Morning */}
              {formData.midMorning &&
                Object.keys(formData.midMorning).length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Mid Morning
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FieldDisplay
                        label="Time"
                        value={formData.midMorning.time}
                      />
                      {formData.midMorning.items &&
                        formData.midMorning.items
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx}>
                              {item.name}
                              {item.quantity && ` (${item.quantity})`}
                            </div>
                          ))}
                    </div>
                  </div>
                )}

              {/* Lunch */}
              {formData.lunch && Object.keys(formData.lunch).length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-700 mb-3">Lunch</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldDisplay label="Time" value={formData.lunch.time} />
                    {formData.lunch.rice?.bowls && (
                      <FieldDisplay
                        label="Rice"
                        value={`${formData.lunch.rice.bowls} bowls`}
                      />
                    )}
                    {formData.lunch.rice?.type && (
                      <FieldDisplay
                        label="Rice Type"
                        value={formData.lunch.rice.type}
                      />
                    )}
                    {formData.lunch.roti?.count && (
                      <FieldDisplay
                        label="Roti"
                        value={`${formData.lunch.roti.count} pieces`}
                      />
                    )}
                    {formData.lunch.dal?.bowls && (
                      <FieldDisplay
                        label="Dal"
                        value={`${formData.lunch.dal.bowls} bowls`}
                      />
                    )}
                    {formData.lunch.dal?.type && (
                      <FieldDisplay
                        label="Dal Type"
                        value={formData.lunch.dal.type}
                      />
                    )}
                    {formData.lunch.dal?.otherType && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other Dal Type"
                          value={formData.lunch.dal.otherType}
                        />
                      </div>
                    )}
                    {formData.lunch.sambhar?.bowls && (
                      <FieldDisplay
                        label="Sambhar"
                        value={`${formData.lunch.sambhar.bowls} bowls`}
                      />
                    )}
                    {formData.lunch.sambhar?.type && (
                      <FieldDisplay
                        label="Sambhar Type"
                        value={formData.lunch.sambhar.type}
                      />
                    )}
                    {formData.lunch.sambhar?.otherType && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other Sambhar Type"
                          value={formData.lunch.sambhar.otherType}
                        />
                      </div>
                    )}
                    {formData.lunch.curdKadhi?.bowls && (
                      <FieldDisplay
                        label="Curd/Kadhi"
                        value={`${formData.lunch.curdKadhi.bowls} bowls`}
                      />
                    )}
                    {formData.lunch.choleRajmaBeans?.bowls && (
                      <FieldDisplay
                        label="Chole/Rajma/Beans"
                        value={`${formData.lunch.choleRajmaBeans.bowls} bowls`}
                      />
                    )}
                    {formData.lunch.chicken?.checked && (
                      <FieldDisplay
                        label="Chicken"
                        value={formData.lunch.chicken.quantity}
                      />
                    )}
                    {formData.lunch.fish?.checked && (
                      <FieldDisplay
                        label="Fish"
                        value={formData.lunch.fish.quantity}
                      />
                    )}
                    {formData.lunch.mutton?.checked && (
                      <FieldDisplay
                        label="Mutton"
                        value={formData.lunch.mutton.quantity}
                      />
                    )}
                    {formData.lunch.seafood?.checked && (
                      <FieldDisplay
                        label="Seafood"
                        value={formData.lunch.seafood.quantity}
                      />
                    )}
                    {formData.lunch.pulao?.checked && (
                      <FieldDisplay
                        label="Pulao"
                        value={`${formData.lunch.pulao.bowls} bowls`}
                      />
                    )}
                    {formData.lunch.khichdi?.checked && (
                      <FieldDisplay
                        label="Khichdi"
                        value={`${formData.lunch.khichdi.bowls} bowls`}
                      />
                    )}
                    {formData.lunch.biryani?.checked && (
                      <FieldDisplay
                        label="Biryani"
                        value={`${formData.lunch.biryani.bowls} bowls`}
                      />
                    )}
                    {formData.lunch.salad?.checked && (
                      <>
                        <div>🥗 Salad: Yes</div>
                        {formData.lunch.salad.type && (
                          <FieldDisplay
                            label="Salad Type"
                            value={formData.lunch.salad.type}
                          />
                        )}
                        {formData.lunch.salad.quantity && (
                          <FieldDisplay
                            label="Salad Quantity"
                            value={formData.lunch.salad.quantity}
                          />
                        )}
                      </>
                    )}
                    {formData.lunch.chutney?.checked && (
                      <FieldDisplay
                        label="Chutney"
                        value={formData.lunch.chutney.type}
                      />
                    )}
                    {formData.lunch.pickle?.checked && (
                      <div>🥒 Pickle: Yes</div>
                    )}
                    <div className="md:col-span-2">
                      <FieldDisplay
                        label="Other"
                        value={formData.lunch.other}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldDisplay
                        label="Other Quantity"
                        value={formData.lunch.otherQuantity}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mid Day */}
              {formData.midDay && Object.keys(formData.midDay).length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-700 mb-3">Mid Day</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldDisplay label="Time" value={formData.midDay.time} />
                    {formData.midDay.sweets?.checked && (
                      <FieldDisplay
                        label="Sweets"
                        value={`${formData.midDay.sweets.bowls} bowls`}
                      />
                    )}
                    {formData.midDay.dessert?.checked && (
                      <FieldDisplay
                        label="Dessert"
                        value={`${formData.midDay.dessert.bowls} bowls`}
                      />
                    )}
                    {formData.midDay.laddu?.checked && (
                      <FieldDisplay
                        label="Laddu"
                        value={`${formData.midDay.laddu.bowls} bowls`}
                      />
                    )}
                    {formData.midDay.fruits?.checked && (
                      <FieldDisplay
                        label="Fruits"
                        value={`${formData.midDay.fruits.bowls} bowls`}
                      />
                    )}
                    <div className="md:col-span-2">
                      <FieldDisplay
                        label="Other"
                        value={formData.midDay.other}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldDisplay
                        label="Other Quantity"
                        value={formData.midDay.otherQuantity}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Evening Snack */}
              {formData.eveningSnack &&
                Object.keys(formData.eveningSnack).length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Evening Snack
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FieldDisplay
                        label="Time"
                        value={formData.eveningSnack.time}
                      />
                      {formData.eveningSnack.items &&
                        formData.eveningSnack.items
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx}>
                              {item.name}
                              {item.quantity && ` (${item.quantity})`}
                            </div>
                          ))}
                      {(formData.eveningSnack as any).teaCoffee?.checked && (
                        <div>☕ Tea/Coffee: Yes</div>
                      )}
                      {(formData.eveningSnack as any).milk?.checked && (
                        <div>🥛 Milk: Yes</div>
                      )}
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other"
                          value={formData.eveningSnack.other}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other Quantity"
                          value={formData.eveningSnack.otherQuantity}
                        />
                      </div>
                    </div>
                  </div>
                )}

              {/* Dinner - Same structure as Lunch + Mid-Day */}
              {formData.dinner && Object.keys(formData.dinner).length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-700 mb-3">Dinner</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldDisplay label="Time" value={formData.dinner.time} />
                    {/* Lunch fields */}
                    {formData.dinner.rice?.bowls && (
                      <FieldDisplay
                        label="Rice"
                        value={`${formData.dinner.rice.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.rice?.type && (
                      <FieldDisplay
                        label="Rice Type"
                        value={formData.dinner.rice.type}
                      />
                    )}
                    {formData.dinner.roti?.count && (
                      <FieldDisplay
                        label="Roti"
                        value={`${formData.dinner.roti.count} pieces`}
                      />
                    )}
                    {formData.dinner.dal?.bowls && (
                      <FieldDisplay
                        label="Dal"
                        value={`${formData.dinner.dal.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.dal?.type && (
                      <FieldDisplay
                        label="Dal Type"
                        value={formData.dinner.dal.type}
                      />
                    )}
                    {formData.dinner.dal?.otherType && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other Dal Type"
                          value={formData.dinner.dal.otherType}
                        />
                      </div>
                    )}
                    {formData.dinner.sambhar?.bowls && (
                      <FieldDisplay
                        label="Sambhar"
                        value={`${formData.dinner.sambhar.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.sambhar?.type && (
                      <FieldDisplay
                        label="Sambhar Type"
                        value={formData.dinner.sambhar.type}
                      />
                    )}
                    {formData.dinner.sambhar?.otherType && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other Sambhar Type"
                          value={formData.dinner.sambhar.otherType}
                        />
                      </div>
                    )}
                    {formData.dinner.curdKadhi?.bowls && (
                      <FieldDisplay
                        label="Curd/Kadhi"
                        value={`${formData.dinner.curdKadhi.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.choleRajmaBeans?.bowls && (
                      <FieldDisplay
                        label="Chole/Rajma/Beans"
                        value={`${formData.dinner.choleRajmaBeans.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.chicken?.checked && (
                      <FieldDisplay
                        label="Chicken"
                        value={formData.dinner.chicken.quantity}
                      />
                    )}
                    {formData.dinner.fish?.checked && (
                      <FieldDisplay
                        label="Fish"
                        value={formData.dinner.fish.quantity}
                      />
                    )}
                    {formData.dinner.mutton?.checked && (
                      <FieldDisplay
                        label="Mutton"
                        value={formData.dinner.mutton.quantity}
                      />
                    )}
                    {formData.dinner.seafood?.checked && (
                      <FieldDisplay
                        label="Seafood"
                        value={formData.dinner.seafood.quantity}
                      />
                    )}
                    {formData.dinner.pulao?.checked && (
                      <FieldDisplay
                        label="Pulao"
                        value={`${formData.dinner.pulao.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.khichdi?.checked && (
                      <FieldDisplay
                        label="Khichdi"
                        value={`${formData.dinner.khichdi.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.biryani?.checked && (
                      <FieldDisplay
                        label="Biryani"
                        value={`${formData.dinner.biryani.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.salad?.checked && (
                      <>
                        <div>🥗 Salad: Yes</div>
                        {formData.dinner.salad.type && (
                          <FieldDisplay
                            label="Salad Type"
                            value={formData.dinner.salad.type}
                          />
                        )}
                        {formData.dinner.salad.quantity && (
                          <FieldDisplay
                            label="Salad Quantity"
                            value={formData.dinner.salad.quantity}
                          />
                        )}
                      </>
                    )}
                    {formData.dinner.chutney?.checked && (
                      <FieldDisplay
                        label="Chutney"
                        value={formData.dinner.chutney.type}
                      />
                    )}
                    {formData.dinner.pickle?.checked && (
                      <div>🥒 Pickle: Yes</div>
                    )}
                    <div className="md:col-span-2">
                      <FieldDisplay
                        label="Other"
                        value={formData.dinner.other}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldDisplay
                        label="Other Quantity"
                        value={formData.dinner.otherQuantity}
                      />
                    </div>
                    {/* Mid-Day fields in dinner */}
                    {formData.dinner.sweets?.checked && (
                      <FieldDisplay
                        label="Sweets (Mid-Day)"
                        value={`${formData.dinner.sweets.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.dessert?.checked && (
                      <FieldDisplay
                        label="Dessert (Mid-Day)"
                        value={`${formData.dinner.dessert.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.laddu?.checked && (
                      <FieldDisplay
                        label="Laddu (Mid-Day)"
                        value={`${formData.dinner.laddu.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.fruits?.checked && (
                      <FieldDisplay
                        label="Fruits (Mid-Day)"
                        value={`${formData.dinner.fruits.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.midDayOther && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other (Mid-Day)"
                          value={formData.dinner.midDayOther}
                        />
                      </div>
                    )}
                    {formData.dinner.midDayOtherQuantity && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other Quantity (Mid-Day)"
                          value={formData.dinner.midDayOtherQuantity}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Weekend Diet */}
        {formData.weekendDiet &&
          Object.keys(formData.weekendDiet).length > 0 && (
            <SectionWrapper title="Section 3 — Weekend Diet">
              <FieldDisplay
                label="Snacks"
                value={formData.weekendDiet.snacks}
              />
              <FieldDisplay
                label="Starters"
                value={formData.weekendDiet.starters}
              />
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Main Course"
                  value={formData.weekendDiet.mainCourse}
                />
              </div>
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Changes in Diet"
                  value={formData.weekendDiet.changesInDiet}
                />
              </div>
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Eating Out — Food Items"
                  value={formData.weekendDiet.eatingOutFoodItems}
                />
              </div>
              <FieldDisplay
                label="Eating Out — Frequency"
                value={formData.weekendDiet.eatingOutFrequency}
              />
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Ordered From Outside — Food Items"
                  value={formData.weekendDiet.orderedFromOutsideFoodItems}
                />
              </div>
              {typeof formData.weekendDiet.snacksList === "object" &&
                (formData.weekendDiet.snacksList as any)?.checked && (
                  <FieldDisplay
                    label="Snacks List"
                    value={(formData.weekendDiet.snacksList as any).quantity}
                  />
                )}
              {typeof formData.weekendDiet.starterList === "object" &&
                (formData.weekendDiet.starterList as any)?.checked && (
                  <FieldDisplay
                    label="Starter List"
                    value={(formData.weekendDiet.starterList as any).quantity}
                  />
                )}
              {typeof formData.weekendDiet.mainCourseList === "object" &&
                (formData.weekendDiet.mainCourseList as any)?.checked && (
                  <FieldDisplay
                    label="Main Course List"
                    value={
                      (formData.weekendDiet.mainCourseList as any).quantity
                    }
                  />
                )}
              {typeof formData.weekendDiet.sweetItemList === "object" &&
                (formData.weekendDiet.sweetItemList as any)?.checked && (
                  <FieldDisplay
                    label="Sweet Item List"
                    value={(formData.weekendDiet.sweetItemList as any).quantity}
                  />
                )}
              <FieldDisplay
                label="Sleeping Time (Weekend)"
                value={formData.weekendDiet.sleepingTime}
              />
              <FieldDisplay
                label="Wakeup Time (Weekend)"
                value={formData.weekendDiet.wakeupTime}
              />
              <FieldDisplay
                label="Nap Time (Weekend)"
                value={formData.weekendDiet.napTime}
              />
            </SectionWrapper>
          )}

        {/* Section 4: Questionnaire */}
        {formData.questionnaire &&
          Object.keys(formData.questionnaire).length > 0 && (
            <SectionWrapper title="Section 4 — Questionnaire">
              <FieldDisplay
                label="Food Allergies"
                value={formData.questionnaire.foodAllergies}
              />
              <FieldDisplay
                label="Food Intolerance"
                value={formData.questionnaire.foodIntolerance}
              />
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Intolerance Type"
                  value={formData.questionnaire.intoleranceType}
                />
              </div>
              <FieldDisplay
                label="Eating Speed"
                value={formData.questionnaire.eatingSpeed}
              />
              <FieldDisplay
                label="Activity During Meal"
                value={formData.questionnaire.activityDuringMeal}
              />
              <FieldDisplay
                label="Hunger Pangs"
                value={formData.questionnaire.hungerPangs}
              />
              <FieldDisplay
                label="Hunger Pangs Time"
                value={formData.questionnaire.hungerPangsTime}
              />
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Emotional Eater / Mood-based Eating"
                  value={formData.questionnaire.emotionalEater}
                />
              </div>
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Describe Emotional Eating"
                  value={formData.questionnaire.describeEmotionalEating}
                />
              </div>
              <FieldDisplay
                label="Main Meal"
                value={formData.questionnaire.mainMeal}
              />
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Snack Foods You Prefer"
                  value={formData.questionnaire.snackFoodsPrefer}
                />
              </div>
              <FieldDisplay
                label="Crave Sweets?"
                value={formData.questionnaire.craveSweets}
              />
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Sweet Types (Chocolates/Indian Sweets)"
                  value={formData.questionnaire.sweetTypes}
                />
              </div>
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Specific Likes"
                  value={formData.questionnaire.specificLikes}
                />
              </div>
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Specific Dislikes"
                  value={formData.questionnaire.specificDislikes}
                />
              </div>
              <FieldDisplay
                label="Fasting in Week?"
                value={formData.questionnaire.fastingInWeek}
              />
              <FieldDisplay
                label="Fasting Reason"
                value={formData.questionnaire.fastingReason}
              />
            </SectionWrapper>
          )}

        {/* Section 5: Food Frequency - Complex nested structure */}
        {formData.foodFrequency &&
          Object.keys(formData.foodFrequency).length > 0 && (
            <div className="mb-6 pb-6 border-b border-slate-200">
              <h4 className="text-lg font-semibold text-emerald-700 mb-4">
                Section 5 — Food Frequency
              </h4>
              <div className="space-y-4">
                {/* Non-Veg */}
                {formData.foodFrequency.nonVeg &&
                  Object.keys(formData.foodFrequency.nonVeg).length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-700 mb-3">
                        Non-Veg
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(formData.foodFrequency.nonVeg).map(
                          ([key, item]: [string, any]) => {
                            if (!item?.checked) return null;
                            return (
                              <div key={key} className="bg-white rounded p-3">
                                <div className="font-medium text-slate-900 mb-1">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </div>
                                {item.qtyPieces && (
                                  <div className="text-sm text-slate-600">
                                    Qty: {item.qtyPieces} pieces
                                  </div>
                                )}
                                {item.prepType && (
                                  <div className="text-sm text-slate-600">
                                    Prep: {item.prepType}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                {/* Dairy */}
                {formData.foodFrequency.dairy &&
                  Object.keys(formData.foodFrequency.dairy).length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-700 mb-3">
                        Dairy
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.foodFrequency.dairy.milk?.checked && (
                          <FieldDisplay
                            label="Milk"
                            value={`${formData.foodFrequency.dairy.milk.glasses} glasses`}
                          />
                        )}
                        {formData.foodFrequency.dairy.curdButtermilk && (
                          <FieldDisplay
                            label="Curd / Buttermilk"
                            value={formData.foodFrequency.dairy.curdButtermilk}
                          />
                        )}
                      </div>
                    </div>
                  )}

                {/* Packaged Items */}
                {formData.foodFrequency.packaged &&
                  Array.isArray(formData.foodFrequency.packaged) &&
                  formData.foodFrequency.packaged.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-700 mb-3">
                        Packaged / Daily Items
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {formData.foodFrequency.packaged
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded p-3">
                              <div className="font-medium text-slate-900 mb-1">
                                {item.name}
                              </div>
                              {item.quantity && (
                                <div className="text-sm text-slate-600">
                                  Qty: {item.quantity}
                                </div>
                              )}
                              {item.frequency && (
                                <div className="text-sm text-slate-600">
                                  Frequency: {item.frequency}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Sweeteners */}
                {formData.foodFrequency.sweeteners &&
                  Array.isArray(formData.foodFrequency.sweeteners) &&
                  formData.foodFrequency.sweeteners.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-700 mb-3">
                        Sweeteners
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {formData.foodFrequency.sweeteners
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded p-3">
                              <div className="font-medium text-slate-900 mb-1">
                                {item.name}
                              </div>
                              {item.qty && (
                                <div className="text-sm text-slate-600">
                                  Qty: {item.qty} TSP/TBSP
                                </div>
                              )}
                              {item.frequency && (
                                <div className="text-sm text-slate-600">
                                  Frequency: {item.frequency}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Drinks */}
                {formData.foodFrequency.drinks &&
                  Array.isArray(formData.foodFrequency.drinks) &&
                  formData.foodFrequency.drinks.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-700 mb-3">
                        Drinks
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.foodFrequency.drinks
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded p-3">
                              <div className="font-medium text-slate-900 mb-1">
                                {item.name}
                              </div>
                              {item.qty && (
                                <div className="text-sm text-slate-600">
                                  Qty: {item.qty} cups/pieces
                                </div>
                              )}
                              {item.frequency && (
                                <div className="text-sm text-slate-600">
                                  Frequency: {item.frequency}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Lifestyle */}
                {formData.foodFrequency.lifestyle &&
                  typeof formData.foodFrequency.lifestyle === "object" &&
                  !Array.isArray(formData.foodFrequency.lifestyle) &&
                  Object.keys(formData.foodFrequency.lifestyle).length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-700 mb-3">
                        Lifestyle
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(formData.foodFrequency.lifestyle as any).smoking
                          ?.checked && (
                          <div className="bg-white rounded p-3">
                            <div className="font-medium text-slate-900 mb-1">
                              Smoking
                            </div>
                            {(formData.foodFrequency.lifestyle as any).smoking
                              .qty && (
                              <div className="text-sm text-slate-600">
                                Qty:{" "}
                                {
                                  (formData.foodFrequency.lifestyle as any)
                                    .smoking.qty
                                }{" "}
                                cups/pieces
                              </div>
                            )}
                            {(formData.foodFrequency.lifestyle as any).smoking
                              .frequency && (
                              <div className="text-sm text-slate-600">
                                Frequency:{" "}
                                {
                                  (formData.foodFrequency.lifestyle as any)
                                    .smoking.frequency
                                }
                              </div>
                            )}
                          </div>
                        )}
                        {(formData.foodFrequency.lifestyle as any).tobacco
                          ?.checked && (
                          <div className="bg-white rounded p-3">
                            <div className="font-medium text-slate-900 mb-1">
                              Tobacco
                            </div>
                            {(formData.foodFrequency.lifestyle as any).tobacco
                              .qty && (
                              <div className="text-sm text-slate-600">
                                Qty:{" "}
                                {
                                  (formData.foodFrequency.lifestyle as any)
                                    .tobacco.qty
                                }{" "}
                                cups/pieces
                              </div>
                            )}
                            {(formData.foodFrequency.lifestyle as any).tobacco
                              .frequency && (
                              <div className="text-sm text-slate-600">
                                Frequency:{" "}
                                {
                                  (formData.foodFrequency.lifestyle as any)
                                    .tobacco.frequency
                                }
                              </div>
                            )}
                          </div>
                        )}
                        {(formData.foodFrequency.lifestyle as any).alcohol
                          ?.checked && (
                          <div className="bg-white rounded p-3">
                            <div className="font-medium text-slate-900 mb-1">
                              Alcohol
                            </div>
                            {(formData.foodFrequency.lifestyle as any).alcohol
                              .qty && (
                              <div className="text-sm text-slate-600">
                                Qty:{" "}
                                {
                                  (formData.foodFrequency.lifestyle as any)
                                    .alcohol.qty
                                }{" "}
                                ml
                              </div>
                            )}
                            {(formData.foodFrequency.lifestyle as any).alcohol
                              .frequency && (
                              <div className="text-sm text-slate-600">
                                Frequency:{" "}
                                {
                                  (formData.foodFrequency.lifestyle as any)
                                    .alcohol.frequency
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Water */}
                {formData.foodFrequency.water?.checked && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">Water</h5>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-slate-900 mb-1">
                        Water
                      </div>
                      {formData.foodFrequency.water.qty && (
                        <div className="text-sm text-slate-600">
                          Qty: {formData.foodFrequency.water.qty} cups/pieces
                        </div>
                      )}
                      {formData.foodFrequency.water.frequency && (
                        <div className="text-sm text-slate-600">
                          Frequency: {formData.foodFrequency.water.frequency}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Healthy Foods */}
                {formData.foodFrequency.healthyFoods &&
                  Array.isArray(formData.foodFrequency.healthyFoods) &&
                  formData.foodFrequency.healthyFoods.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-700 mb-3">
                        Healthy Foods
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {formData.foodFrequency.healthyFoods
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded p-3">
                              <div className="font-medium text-slate-900 mb-1">
                                {item.name}
                              </div>
                              {item.qty && (
                                <div className="text-sm text-slate-600">
                                  Qty: {item.qty} cups/pieces
                                </div>
                              )}
                              {item.frequency && (
                                <div className="text-sm text-slate-600">
                                  Frequency: {item.frequency}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Eating Out */}
                {formData.foodFrequency.eatingOut?.checked && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Eating Out
                    </h5>
                    <div className="bg-white rounded p-3">
                      {formData.foodFrequency.eatingOut.frequency && (
                        <div className="text-sm text-slate-600 mb-2">
                          Frequency:{" "}
                          {formData.foodFrequency.eatingOut.frequency}
                        </div>
                      )}
                      {formData.foodFrequency.eatingOut.foodItems && (
                        <div className="text-sm text-slate-900">
                          {formData.foodFrequency.eatingOut.foodItems}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Coconut */}
                {formData.foodFrequency.coconut?.checked && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Coconut
                    </h5>
                    <div className="bg-white rounded p-3">
                      {formData.foodFrequency.coconut.frequency && (
                        <div className="text-sm text-slate-600">
                          Frequency: {formData.foodFrequency.coconut.frequency}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pizza/Burger */}
                {formData.foodFrequency.pizzaBurger?.checked && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Pizza/Burger
                    </h5>
                    <div className="bg-white rounded p-3">
                      {formData.foodFrequency.pizzaBurger.qty && (
                        <div className="text-sm text-slate-600 mb-2">
                          Qty: {formData.foodFrequency.pizzaBurger.qty}{" "}
                          cups/pieces
                        </div>
                      )}
                      {formData.foodFrequency.pizzaBurger.frequency && (
                        <div className="text-sm text-slate-600">
                          Frequency:{" "}
                          {formData.foodFrequency.pizzaBurger.frequency}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Oil / Fat */}
                {formData.foodFrequency.oilFat &&
                  Object.keys(formData.foodFrequency.oilFat).length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-700 mb-3">
                        Oil / Fat
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FieldDisplay
                          label="Type of Oil"
                          value={formData.foodFrequency.oilFat.typeOfOil}
                        />
                        <FieldDisplay
                          label="Oil Per Month"
                          value={formData.foodFrequency.oilFat.oilPerMonth}
                        />
                        <div className="md:col-span-2">
                          <FieldDisplay
                            label="Total Members in House"
                            value={
                              formData.foodFrequency.oilFat.totalMembersInHouse
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <FieldDisplay
                            label="Reuse Fried Oil in Cooking?"
                            value={formData.foodFrequency.oilFat.reuseFriedOil}
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

        {/* Section 6: Health Profile - Handle conditions properly */}
        {formData.healthProfile &&
          Object.keys(formData.healthProfile).length > 0 && (
            <div className="mb-6 pb-6 border-b border-slate-200">
              <h4 className="text-lg font-semibold text-emerald-700 mb-4">
                Section 6 — Health Profile
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldDisplay
                  label="Physical Activity Level"
                  value={formData.healthProfile.physicalActivityLevel}
                />
                <FieldDisplay
                  label="Sleep Quality"
                  value={formData.healthProfile.sleepQuality}
                />
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Insomnia/Pills Details"
                    value={formData.healthProfile.insomniaPillsDetails}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Disturbance Due to Urine Break"
                    value={formData.healthProfile.disturbanceDueToUrineBreak}
                  />
                </div>

                {/* Health Conditions - Format properly, not as JSON */}
                {formData.healthProfile.conditions &&
                  Object.keys(formData.healthProfile.conditions).length > 0 && (
                    <div className="md:col-span-2">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h5 className="font-semibold text-slate-700 mb-3">
                          Health Conditions
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(
                            formData.healthProfile.conditions
                          ).map(
                            ([conditionName, conditionData]: [string, any]) => {
                              if (!conditionData?.hasCondition) return null;
                              return (
                                <div
                                  key={conditionName}
                                  className="bg-white rounded p-3 border border-emerald-200"
                                >
                                  <div className="font-medium text-slate-900 mb-1">
                                    {conditionName
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) => str.toUpperCase())
                                      .trim()}
                                  </div>
                                  <div className="text-sm text-emerald-600 font-semibold">
                                    {conditionData.hasCondition}
                                  </div>
                                  {conditionData.notes && (
                                    <div className="text-xs text-slate-600 mt-1">
                                      {conditionData.notes}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Medication Name"
                    value={formData.healthProfile.medicationName}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Medication Reason"
                    value={formData.healthProfile.medicationReason}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="Medication Timing & Quantity"
                    value={formData.healthProfile.medicationTimingQuantity}
                  />
                </div>
                <FieldDisplay
                  label="Pregnancy"
                  value={formData.healthProfile.pregnancy}
                />
                <FieldDisplay
                  label="Planning Pregnancy"
                  value={formData.healthProfile.planningPregnancy}
                />
                <div className="md:col-span-2">
                  <FieldDisplay
                    label="If Yes, Planning When?"
                    value={formData.healthProfile.planningPregnancyWhen}
                  />
                </div>

                {/* Family History */}
                {formData.healthProfile.familyHistory &&
                  Object.keys(formData.healthProfile.familyHistory).length >
                    0 && (
                    <div className="md:col-span-2">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h5 className="font-semibold text-slate-700 mb-3">
                          Family History
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FieldDisplay
                            label="Father"
                            value={formData.healthProfile.familyHistory.father}
                          />
                          <FieldDisplay
                            label="Mother"
                            value={formData.healthProfile.familyHistory.mother}
                          />
                          <FieldDisplay
                            label="Siblings"
                            value={
                              formData.healthProfile.familyHistory.siblings
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

        {/* Section 7: Diet Prescribed */}
        {formData.dietPrescribed &&
          Object.keys(formData.dietPrescribed).length > 0 && (
            <SectionWrapper title="Section 7 — Diet Prescribed">
              <FieldDisplay
                label="Joining Date"
                value={formData.dietPrescribed.joiningDate}
              />
              <FieldDisplay
                label="Expiry Date"
                value={formData.dietPrescribed.expiryDate}
              />
              <FieldDisplay
                label="Diet Prescription Date"
                value={formData.dietPrescribed.dietPrescriptionDate}
              />
              <FieldDisplay label="Date" value={formData.dietPrescribed.date} />
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Duration of Diet"
                  value={formData.dietPrescribed.durationOfDiet}
                />
              </div>
              <div className="md:col-span-2">
                <FieldDisplay
                  label="Diet Chart"
                  value={formData.dietPrescribed.dietChart}
                />
              </div>
              <FieldDisplay label="Code" value={formData.dietPrescribed.code} />
            </SectionWrapper>
          )}

        {/* Section 8: Body Measurements */}
        {formData.bodyMeasurements &&
          Object.keys(formData.bodyMeasurements).length > 0 && (
            <div className="mb-6 pb-6 border-b border-slate-200 last:border-b-0">
              <h4 className="text-lg font-semibold text-emerald-700 mb-4">
                Section 8 — Body Measurements
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FieldDisplay
                  label="Neck"
                  value={formData.bodyMeasurements.neck}
                  unit="cm"
                />
                <FieldDisplay
                  label="Chest"
                  value={formData.bodyMeasurements.chest}
                  unit="cm"
                />
                <FieldDisplay
                  label="Chest Female"
                  value={formData.bodyMeasurements.chestFemale}
                  unit="cm"
                />
                <FieldDisplay
                  label="Normal Chest Lung"
                  value={formData.bodyMeasurements.normalChestLung}
                  unit="cm"
                />
                <FieldDisplay
                  label="Expanded Chest Lungs"
                  value={formData.bodyMeasurements.expandedChestLungs}
                  unit="cm"
                />
                <FieldDisplay
                  label="Arms"
                  value={formData.bodyMeasurements.arms}
                  unit="cm"
                />
                <FieldDisplay
                  label="Forearms"
                  value={formData.bodyMeasurements.forearms}
                  unit="cm"
                />
                <FieldDisplay
                  label="Wrist"
                  value={formData.bodyMeasurements.wrist}
                  unit="cm"
                />
                <FieldDisplay
                  label="Abdomen Upper"
                  value={formData.bodyMeasurements.abdomenUpper}
                  unit="cm"
                />
                <FieldDisplay
                  label="Abdomen Lower"
                  value={formData.bodyMeasurements.abdomenLower}
                  unit="cm"
                />
                <FieldDisplay
                  label="Waist"
                  value={formData.bodyMeasurements.waist}
                  unit="cm"
                />
                <FieldDisplay
                  label="Hip"
                  value={formData.bodyMeasurements.hip}
                  unit="cm"
                />
                <FieldDisplay
                  label="Thigh Upper"
                  value={formData.bodyMeasurements.thighUpper}
                  unit="cm"
                />
                <FieldDisplay
                  label="Thigh Lower"
                  value={formData.bodyMeasurements.thighLower}
                  unit="cm"
                />
                <FieldDisplay
                  label="Calf"
                  value={formData.bodyMeasurements.calf}
                  unit="cm"
                />
                <FieldDisplay
                  label="Ankle"
                  value={formData.bodyMeasurements.ankle}
                  unit="cm"
                />
              </div>
            </div>
          )}

        {/* General Notes */}
        {formData.notes && (
          <div className="mt-6 pt-6 border-t-2 border-emerald-200">
            <h4 className="text-lg font-semibold text-emerald-700 mb-4">
              Additional Notes
            </h4>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-slate-900 whitespace-pre-wrap">
                {formData.notes}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
