"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Calendar,
  Edit2,
  Trash2,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  DoctorNotesFormData,
  deleteDoctorNoteAttachment,
} from "@/lib/doctor-notes-api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { DoctorNoteAttachment } from "@/lib/doctor-notes-api";

interface DoctorNotesPreviewProps {
  formData: DoctorNotesFormData;
  createdAt?: string;
  updatedAt?: string;
  isDraft?: boolean;
  onEdit?: () => void;
  attachments?: DoctorNoteAttachment[];
  onAttachmentDeleted?: () => void; // Callback to refresh data after deletion
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

// PDF Attachment List Component with Delete Functionality
function PDFAttachmentList({
  attachments,
  formatFileSize,
  onAttachmentDeleted,
}: {
  attachments: DoctorNoteAttachment[];
  formatFileSize: (bytes?: number) => string;
  onAttachmentDeleted?: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (attachmentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    setDeletingId(attachmentId);
    try {
      const result = await deleteDoctorNoteAttachment(attachmentId);
      if (result.success) {
        toast.success("PDF deleted successfully", {
          duration: 3000,
        });
        // Call refresh callback if provided
        if (onAttachmentDeleted) {
          onAttachmentDeleted();
        }
      } else {
        throw new Error(result.error || "Failed to delete PDF");
      }
    } catch (error: any) {
      console.error("Delete PDF error:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to delete PDF",
        {
          duration: 5000,
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            maxWidth: "500px",
          },
        }
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => (
        <div
          key={attachment.id || index}
          className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors group"
        >
          <a
            href={attachment.fileUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <svg
              className="w-5 h-5 text-emerald-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-700 group-hover:text-emerald-800 truncate">
                {attachment.fileName || "Diet Chart PDF"}
              </p>
              {attachment.sizeInBytes && (
                <p className="text-xs text-slate-500">
                  {formatFileSize(attachment.sizeInBytes)}
                </p>
              )}
            </div>
          </a>
          <div className="flex items-center gap-2">
            {/* External Link Icon */}
            <svg
              className="w-4 h-4 text-emerald-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            {/* Delete Button */}
            <button
              onClick={() =>
                handleDelete(attachment.id, attachment.fileName || "PDF")
              }
              disabled={deletingId === attachment.id}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete PDF"
            >
              {deletingId === attachment.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to check if a value exists
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined || value === "") return false;
  if (typeof value === "object" && !Array.isArray(value)) {
    // Check if object has any meaningful values (excluding metadata)
    const keys = Object.keys(value).filter((k) => !k.startsWith("_"));
    if (keys.length === 0) return false;
    // Check if any value in the object has a value
    return keys.some((k) => hasValue(value[k]));
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
};

// Helper to recursively find all fields with values
const findAllFieldsWithValues = (
  obj: any,
  path: string[] = []
): Array<{ path: string[]; value: any }> => {
  const fields: Array<{ path: string[]; value: any }> = [];

  if (!obj || typeof obj !== "object") return fields;

  for (const [key, value] of Object.entries(obj)) {
    // Skip metadata fields
    if (key.startsWith("_")) continue;

    const currentPath = [...path, key];

    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        fields.push({ path: currentPath, value });
      }
    } else if (typeof value === "object") {
      // Recursively check nested objects
      const nestedFields = findAllFieldsWithValues(value, currentPath);
      fields.push(...nestedFields);

      // Also add the object itself if it has meaningful content
      if (Object.keys(value).length > 0 && !Array.isArray(value)) {
        // Check if it's a simple object with a single value (like {checked: true})
        const keys = Object.keys(value);
        const valueObj = value as any;
        if (keys.length === 1 && keys[0] === "checked" && valueObj.checked) {
          fields.push({ path: currentPath, value: "Yes" });
        } else if (
          keys.length > 1 ||
          (keys.length === 1 && keys[0] !== "checked")
        ) {
          // Object with multiple properties or non-checked single property
          fields.push({ path: currentPath, value });
        }
      }
    } else {
      // Primitive value
      fields.push({ path: currentPath, value });
    }
  }

  return fields;
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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className="text-base font-medium text-slate-900">
        {formatted}
        {unit && <span className="text-slate-600 ml-1">{unit}</span>}
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
    <div className="mb-8 pb-8 border-b-2 border-slate-300 last:border-b-0 bg-white rounded-xl p-6 shadow-sm">
      <h4 className="text-xl font-bold text-emerald-700 mb-6 pb-3 border-b-2 border-emerald-100">
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
};

export default function DoctorNotesPreview({
  formData,
  createdAt,
  updatedAt,
  isDraft,
  onEdit,
  attachments = [],
  onAttachmentDeleted,
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
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Edit2 className="w-5 h-5" />
            Edit Notes
          </button>
        )}
      </div>

      {/* Timestamps */}
      {(createdAt || updatedAt) && (
        <div className="mb-8 pb-6 border-b-2 border-slate-300 flex flex-wrap gap-6 text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
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
      <div className="space-y-8 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
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
          (formData.numberOfChildren !== undefined &&
            formData.numberOfChildren !== null) ||
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
              value={
                formData.numberOfChildren !== undefined &&
                formData.numberOfChildren !== null
                  ? formData.numberOfChildren
                  : "—"
              }
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
                      {formData.morningIntake.tea !== undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            Tea:{" "}
                            {formData.morningIntake.tea?.checked ? "Yes" : "No"}
                          </div>
                          {formData.morningIntake.tea?.checked &&
                            formData.morningIntake.tea.type && (
                              <div className="text-sm text-slate-600">
                                Type: {formData.morningIntake.tea.type}
                              </div>
                            )}
                        </div>
                      )}
                      {formData.morningIntake.coffee !== undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            ☕ Coffee:{" "}
                            {formData.morningIntake.coffee?.checked
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>
                      )}
                      {formData.morningIntake.lemonWater !== undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            🍋 Lemon Water:{" "}
                            {formData.morningIntake.lemonWater?.checked
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>
                      )}
                      {formData.morningIntake.garlicHerbs !== undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            Garlic & Herbs:{" "}
                            {formData.morningIntake.garlicHerbs?.checked
                              ? "Yes"
                              : "No"}
                          </div>
                          {formData.morningIntake.garlicHerbs?.checked &&
                            formData.morningIntake.garlicHerbs.types && (
                              <div className="text-sm text-slate-600">
                                Types:{" "}
                                {formData.morningIntake.garlicHerbs.types}
                              </div>
                            )}
                        </div>
                      )}
                      {formData.morningIntake.soakedDryFruits !== undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            Soaked Dry Fruits:{" "}
                            {formData.morningIntake.soakedDryFruits?.checked
                              ? "Yes"
                              : "No"}
                          </div>
                          {formData.morningIntake.soakedDryFruits?.checked &&
                            formData.morningIntake.soakedDryFruits.quantity && (
                              <div className="text-sm text-slate-600">
                                Quantity:{" "}
                                {
                                  formData.morningIntake.soakedDryFruits
                                    .quantity
                                }
                              </div>
                            )}
                        </div>
                      )}
                      {formData.morningIntake.biscuitToast !== undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            Biscuit/Toast:{" "}
                            {formData.morningIntake.biscuitToast?.checked
                              ? "Yes"
                              : "No"}
                          </div>
                          {formData.morningIntake.biscuitToast?.checked &&
                            formData.morningIntake.biscuitToast.quantity && (
                              <div className="text-sm text-slate-600">
                                Quantity:{" "}
                                {formData.morningIntake.biscuitToast.quantity}
                              </div>
                            )}
                        </div>
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
                      {formData.breakfast.time && (
                        <FieldDisplay
                          label="Time"
                          value={formData.breakfast.time}
                        />
                      )}

                      {/* Individual breakfast items with quantity */}
                      {[
                        { key: "poha", label: "Poha" },
                        { key: "upma", label: "Upma" },
                        { key: "paratha", label: "Paratha" },
                        { key: "stuffedparatha", label: "Stuffed Paratha" },
                        { key: "puri", label: "Puri" },
                        { key: "idlydosa", label: "Idly/Dosa" },
                        { key: "breadbutter", label: "Bread Butter" },
                        { key: "sandwich", label: "Sandwich" },
                        { key: "egg", label: "Egg" },
                        { key: "juice", label: "Juice" },
                        { key: "fruits", label: "Fruits" },
                        { key: "milk", label: "Milk" },
                      ].map(({ key, label }) => {
                        const item = (formData.breakfast as any)[key];
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

                      {/* Roti with Ghee */}
                      {formData.breakfast.roti !== undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            🍞 Roti:{" "}
                            {formData.breakfast.roti?.checked ? "Yes" : "No"}
                          </div>
                          {formData.breakfast.roti?.checked &&
                            formData.breakfast.roti.ghee && (
                              <div className="text-sm text-slate-600">
                                Ghee: {formData.breakfast.roti.ghee}
                              </div>
                            )}
                        </div>
                      )}

                      {/* Items array (if exists - legacy format) */}
                      {formData.breakfast.items &&
                        Array.isArray(formData.breakfast.items) &&
                        formData.breakfast.items
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded p-2">
                              <div className="font-medium text-slate-900">
                                {item.name}
                              </div>
                              {item.quantity && (
                                <div className="text-sm text-slate-600">
                                  Quantity: {item.quantity}
                                </div>
                              )}
                            </div>
                          ))}

                      {formData.breakfast.other && (
                        <div className="md:col-span-2">
                          <FieldDisplay
                            label="Other"
                            value={formData.breakfast.other}
                          />
                        </div>
                      )}
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
                      {formData.midMorning.time && (
                        <FieldDisplay
                          label="Time"
                          value={formData.midMorning.time}
                        />
                      )}

                      {/* Individual mid morning items with quantity */}
                      {[
                        { key: "buttermilk", label: "Buttermilk" },
                        { key: "curd", label: "Curd" },
                        { key: "fruit", label: "Fruit" },
                        { key: "teacoffee", label: "Tea/Coffee" },
                        { key: "other", label: "Other" },
                      ].map(({ key, label }) => {
                        const item = (formData.midMorning as any)[key];
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

                      {/* Items array (if exists - legacy format) */}
                      {formData.midMorning.items &&
                        Array.isArray(formData.midMorning.items) &&
                        formData.midMorning.items
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded p-2">
                              <div className="font-medium text-slate-900">
                                {item.name}
                              </div>
                              {item.quantity && (
                                <div className="text-sm text-slate-600">
                                  Quantity: {item.quantity}
                                </div>
                              )}
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
                    {formData.lunch.salad !== undefined && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          🥗 Salad:{" "}
                          {formData.lunch.salad?.checked ? "Yes" : "No"}
                        </div>
                        {formData.lunch.salad?.checked &&
                          formData.lunch.salad.type && (
                            <div className="text-sm text-slate-600">
                              Type: {formData.lunch.salad.type}
                            </div>
                          )}
                        {formData.lunch.salad?.checked &&
                          formData.lunch.salad.quantity && (
                            <div className="text-sm text-slate-600">
                              Quantity: {formData.lunch.salad.quantity}
                            </div>
                          )}
                      </div>
                    )}
                    {formData.lunch.chutney !== undefined && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          Chutney:{" "}
                          {formData.lunch.chutney?.checked ? "Yes" : "No"}
                        </div>
                        {formData.lunch.chutney?.checked &&
                          formData.lunch.chutney.type && (
                            <div className="text-sm text-slate-600">
                              Type: {formData.lunch.chutney.type}
                            </div>
                          )}
                      </div>
                    )}
                    {formData.lunch.pickle !== undefined && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          🥒 Pickle:{" "}
                          {formData.lunch.pickle?.checked ? "Yes" : "No"}
                        </div>
                      </div>
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
                    {formData.midDay.time && (
                      <FieldDisplay label="Time" value={formData.midDay.time} />
                    )}
                    {formData.midDay.sweets?.checked && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">Sweets</div>
                        {formData.midDay.sweets.bowls ? (
                          <div className="text-sm text-slate-600">
                            {formData.midDay.sweets.bowls} pieces
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-600">Yes</div>
                        )}
                      </div>
                    )}
                    {formData.midDay.dessert?.checked && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          Dessert
                        </div>
                        {formData.midDay.dessert.bowls ? (
                          <div className="text-sm text-slate-600">
                            {formData.midDay.dessert.bowls} pieces
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-600">Yes</div>
                        )}
                      </div>
                    )}
                    {formData.midDay.laddu?.checked && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">Laddu</div>
                        {formData.midDay.laddu.bowls ? (
                          <div className="text-sm text-slate-600">
                            {formData.midDay.laddu.bowls} pieces
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-600">Yes</div>
                        )}
                      </div>
                    )}
                    {formData.midDay.fruits?.checked && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">Fruits</div>
                        {formData.midDay.fruits.bowls ? (
                          <div className="text-sm text-slate-600">
                            {formData.midDay.fruits.bowls} pieces
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-600">Yes</div>
                        )}
                      </div>
                    )}
                    {formData.midDay.other && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other"
                          value={formData.midDay.other}
                        />
                      </div>
                    )}
                    {formData.midDay.otherQuantity && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other Quantity"
                          value={formData.midDay.otherQuantity}
                        />
                      </div>
                    )}
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

                      {/* Items array (if exists) */}
                      {formData.eveningSnack.items &&
                        Array.isArray(formData.eveningSnack.items) &&
                        formData.eveningSnack.items
                          .filter((item: any) => item.checked)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded p-2">
                              <div className="font-medium text-slate-900">
                                {item.name}
                              </div>
                              {item.quantity && (
                                <div className="text-sm text-slate-600">
                                  Quantity: {item.quantity}
                                </div>
                              )}
                            </div>
                          ))}

                      {/* Individual food items stored as separate fields */}
                      {[
                        "biscuittoast",
                        "namkeen",
                        "chana",
                        "makhana",
                        "groundnuts",
                      ].map((itemKey) => {
                        const item = (formData.eveningSnack as any)[itemKey];
                        const isChecked = item?.checked === true;
                        const label =
                          itemKey.charAt(0).toUpperCase() +
                          itemKey.slice(1).replace(/([A-Z])/g, " $1");
                        return (
                          <div key={itemKey} className="bg-white rounded p-2">
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

                      {/* Items with bowls (Poha, Upma) and pieces (Sandwich, Dosa) */}
                      {["poha", "upma", "sandwich", "dosa"].map((itemKey) => {
                        const item = (formData.eveningSnack as any)[itemKey];
                        const isChecked = item?.checked === true;
                        const label =
                          itemKey.charAt(0).toUpperCase() + itemKey.slice(1);
                        // Sandwich and Dosa show pieces, others show bowls
                        const unit =
                          itemKey === "sandwich" || itemKey === "dosa"
                            ? "pieces"
                            : "bowls";
                        return (
                          <div key={itemKey} className="bg-white rounded p-2">
                            <div className="font-medium text-slate-900">
                              {label}: {isChecked ? "Yes" : "No"}
                            </div>
                            {isChecked && item.bowls && (
                              <div className="text-sm text-slate-600">
                                {item.bowls} {unit}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {(formData.eveningSnack as any).teaCoffee !==
                        undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            ☕ Tea/Coffee:{" "}
                            {(formData.eveningSnack as any).teaCoffee?.checked
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>
                      )}
                      {(formData.eveningSnack as any).milk !== undefined && (
                        <div className="bg-white rounded p-2">
                          <div className="font-medium text-slate-900">
                            🥛 Milk:{" "}
                            {(formData.eveningSnack as any).milk?.checked
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>
                      )}
                      {formData.eveningSnack.other && (
                        <div className="md:col-span-2">
                          <FieldDisplay
                            label="Other"
                            value={formData.eveningSnack.other}
                          />
                        </div>
                      )}
                      {formData.eveningSnack.otherQuantity && (
                        <div className="md:col-span-2">
                          <FieldDisplay
                            label="Other Quantity"
                            value={formData.eveningSnack.otherQuantity}
                          />
                        </div>
                      )}
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
                    {formData.dinner.salad !== undefined && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          🥗 Salad:{" "}
                          {formData.dinner.salad?.checked ? "Yes" : "No"}
                        </div>
                        {formData.dinner.salad?.checked &&
                          formData.dinner.salad.type && (
                            <div className="text-sm text-slate-600">
                              Type: {formData.dinner.salad.type}
                            </div>
                          )}
                        {formData.dinner.salad?.checked &&
                          formData.dinner.salad.quantity && (
                            <div className="text-sm text-slate-600">
                              Quantity: {formData.dinner.salad.quantity}
                            </div>
                          )}
                      </div>
                    )}
                    {formData.dinner.chutney !== undefined && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          Chutney:{" "}
                          {formData.dinner.chutney?.checked ? "Yes" : "No"}
                        </div>
                        {formData.dinner.chutney?.checked &&
                          formData.dinner.chutney.type && (
                            <div className="text-sm text-slate-600">
                              Type: {formData.dinner.chutney.type}
                            </div>
                          )}
                      </div>
                    )}
                    {formData.dinner.pickle !== undefined && (
                      <div className="bg-white rounded p-2">
                        <div className="font-medium text-slate-900">
                          🥒 Pickle:{" "}
                          {formData.dinner.pickle?.checked ? "Yes" : "No"}
                        </div>
                      </div>
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
                        label="Sweets"
                        value={`${formData.dinner.sweets.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.dessert?.checked && (
                      <FieldDisplay
                        label="Dessert"
                        value={`${formData.dinner.dessert.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.laddu?.checked && (
                      <FieldDisplay
                        label="Laddu"
                        value={`${formData.dinner.laddu.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.fruits?.checked && (
                      <FieldDisplay
                        label="Fruits"
                        value={`${formData.dinner.fruits.bowls} bowls`}
                      />
                    )}
                    {formData.dinner.midDayOther && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other"
                          value={formData.dinner.midDayOther}
                        />
                      </div>
                    )}
                    {formData.dinner.midDayOtherQuantity && (
                      <div className="md:col-span-2">
                        <FieldDisplay
                          label="Other Quantity"
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
              {/* Snacks List, Starter List, Main Course List, Sweet Item List */}
              {[
                { key: "snackslist", label: "Snacks List" },
                { key: "starterlist", label: "Starter List" },
                { key: "maincourselist", label: "Main Course List" },
                { key: "sweetitemlist", label: "Sweet Item List" },
              ].map(({ key, label }) => {
                const item = (formData.weekendDiet as any)[key];
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
                  (Array.isArray(formData.foodFrequency.nonVeg)
                    ? formData.foodFrequency.nonVeg.length > 0
                    : Object.keys(formData.foodFrequency.nonVeg).length >
                      0) && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
                      <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                        Non-Veg
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.isArray(formData.foodFrequency.nonVeg)
                          ? // Handle as array
                            formData.foodFrequency.nonVeg
                              .filter((item: any) => item?.checked)
                              .map((item: any, idx: number) => (
                                <div key={idx} className="bg-white rounded p-3">
                                  <div className="font-medium text-slate-900 mb-1">
                                    {item.name}
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
                                  {item.frequency && (
                                    <div className="text-sm text-slate-600">
                                      Frequency: {item.frequency}
                                    </div>
                                  )}
                                </div>
                              ))
                          : // Handle as object (legacy format)
                            Object.entries(formData.foodFrequency.nonVeg).map(
                              ([key, item]: [string, any]) => {
                                if (!item?.checked) return null;
                                return (
                                  <div
                                    key={key}
                                    className="bg-white rounded p-3"
                                  >
                                    <div className="font-medium text-slate-900 mb-1">
                                      {key.charAt(0).toUpperCase() +
                                        key.slice(1)}
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
                                    {item.frequency && (
                                      <div className="text-sm text-slate-600">
                                        Frequency: {item.frequency}
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
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
                      <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                        Dairy
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(() => {
                          const milk = formData.foodFrequency.dairy.milk as any;
                          if (milk === undefined) return null;
                          return (
                            <div className="bg-white rounded p-2">
                              <div className="font-medium text-slate-900">
                                Milk: {milk?.checked ? "Yes" : "No"}
                              </div>
                              {milk?.checked && milk.glasses && (
                                <div className="text-sm text-slate-600">
                                  Quantity: {milk.glasses} glasses
                                </div>
                              )}
                              {milk?.checked && milk.frequency && (
                                <div className="text-sm text-slate-600">
                                  Frequency: {milk.frequency}
                                </div>
                              )}
                            </div>
                          );
                        })()}
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
                  (Array.isArray(formData.foodFrequency.packaged)
                    ? formData.foodFrequency.packaged.length > 0
                    : Object.keys(formData.foodFrequency.packaged).length >
                      0) && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
                      <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                        Packaged / Daily Items
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.isArray(formData.foodFrequency.packaged)
                          ? // Handle as array (legacy format)
                            formData.foodFrequency.packaged
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
                              ))
                          : // Handle as object (current format)
                            [
                              "Noodles",
                              "Butter/Cream/Ghee",
                              "Ghee Chapati",
                              "Cheese",
                              "Ice Cream",
                              "Milkshake",
                              "Chocolate",
                              "Fried Foods",
                              "Pickle/Papad",
                              "Lemon Sweets",
                              "Biscuits",
                              "Sweets/Desserts",
                              "Jam/Sauces",
                              "Instant Foods",
                              "Soft Drinks",
                            ].map((itemName) => {
                              const key = itemName
                                .toLowerCase()
                                .replace(/[\/ ]/g, "");
                              const item = (
                                formData.foodFrequency?.packaged as any
                              )?.[key];
                              const isChecked = item?.checked === true;
                              return (
                                <div key={key} className="bg-white rounded p-3">
                                  <div className="font-medium text-slate-900 mb-1">
                                    {itemName}: {isChecked ? "Yes" : "No"}
                                  </div>
                                  {isChecked && item.quantity && (
                                    <div className="text-sm text-slate-600">
                                      Qty: {item.quantity}
                                    </div>
                                  )}
                                  {isChecked && item.frequency && (
                                    <div className="text-sm text-slate-600">
                                      Frequency: {item.frequency}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  )}

                {/* Sweeteners */}
                {formData.foodFrequency.sweeteners &&
                  (Array.isArray(formData.foodFrequency.sweeteners)
                    ? formData.foodFrequency.sweeteners.length > 0
                    : Object.keys(formData.foodFrequency.sweeteners).length >
                      0) && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
                      <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                        Sweeteners
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Array.isArray(formData.foodFrequency.sweeteners)
                          ? // Handle as array (legacy format)
                            formData.foodFrequency.sweeteners
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
                              ))
                          : // Handle as object (current format)
                            ["Sugar", "Honey", "Jaggery"].map((itemName) => {
                              const key = itemName.toLowerCase();
                              const item = (
                                formData.foodFrequency?.sweeteners as any
                              )?.[key];
                              const isChecked = item?.checked === true;
                              return (
                                <div key={key} className="bg-white rounded p-3">
                                  <div className="font-medium text-slate-900 mb-1">
                                    {itemName}: {isChecked ? "Yes" : "No"}
                                  </div>
                                  {isChecked && item.qty && (
                                    <div className="text-sm text-slate-600">
                                      Qty: {item.qty} TSP/TBSP
                                    </div>
                                  )}
                                  {isChecked && item.frequency && (
                                    <div className="text-sm text-slate-600">
                                      Frequency: {item.frequency}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  )}

                {/* Drinks */}
                {formData.foodFrequency.drinks &&
                  (Array.isArray(formData.foodFrequency.drinks)
                    ? formData.foodFrequency.drinks.length > 0
                    : Object.keys(formData.foodFrequency.drinks).length >
                      0) && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
                      <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                        Drinks
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.isArray(formData.foodFrequency.drinks)
                          ? // Handle as array (legacy format)
                            formData.foodFrequency.drinks
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
                              ))
                          : // Handle as object (current format)
                            ["Tea", "Coffee"].map((itemName) => {
                              const key = itemName.toLowerCase();
                              const item = (
                                formData.foodFrequency?.drinks as any
                              )?.[key];
                              const isChecked = item?.checked === true;
                              return (
                                <div key={key} className="bg-white rounded p-3">
                                  <div className="font-medium text-slate-900 mb-1">
                                    {itemName}: {isChecked ? "Yes" : "No"}
                                  </div>
                                  {isChecked && item.qty && (
                                    <div className="text-sm text-slate-600">
                                      Qty: {item.qty} cups/pieces
                                    </div>
                                  )}
                                  {isChecked && item.frequency && (
                                    <div className="text-sm text-slate-600">
                                      Frequency: {item.frequency}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  )}

                {/* Lifestyle */}
                {formData.foodFrequency.lifestyle &&
                  (Array.isArray(formData.foodFrequency.lifestyle)
                    ? formData.foodFrequency.lifestyle.length > 0
                    : Object.keys(formData.foodFrequency.lifestyle).length >
                      0) && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
                      <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                        Lifestyle
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Array.isArray(formData.foodFrequency.lifestyle) ? (
                          // Handle as array
                          formData.foodFrequency.lifestyle
                            .filter((item: any) => item?.checked)
                            .map((item: any, idx: number) => (
                              <div key={idx} className="bg-white rounded p-3">
                                <div className="font-medium text-slate-900 mb-1">
                                  {item.name}: Yes
                                </div>
                                {item.qty && (
                                  <div className="text-sm text-slate-600">
                                    Qty: {item.qty}
                                  </div>
                                )}
                                {item.frequency && (
                                  <div className="text-sm text-slate-600">
                                    Frequency: {item.frequency}
                                  </div>
                                )}
                              </div>
                            ))
                        ) : (
                          // Handle as object (current format)
                          <>
                            {["Smoking", "Tobacco"].map((itemName) => {
                              const key = itemName.toLowerCase();
                              const item = (
                                formData.foodFrequency?.lifestyle as any
                              )?.[key];
                              const isChecked = item?.checked === true;
                              return (
                                <div key={key} className="bg-white rounded p-3">
                                  <div className="font-medium text-slate-900 mb-1">
                                    {itemName}: {isChecked ? "Yes" : "No"}
                                  </div>
                                  {isChecked && item.qty && (
                                    <div className="text-sm text-slate-600">
                                      Qty: {item.qty} cups/pieces
                                    </div>
                                  )}
                                  {isChecked && item.frequency && (
                                    <div className="text-sm text-slate-600">
                                      Frequency: {item.frequency}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {(() => {
                              const alcohol = (
                                formData.foodFrequency.lifestyle as any
                              ).alcohol;
                              const isChecked = alcohol?.checked === true;
                              return (
                                <div className="bg-white rounded p-3">
                                  <div className="font-medium text-slate-900 mb-1">
                                    Alcohol: {isChecked ? "Yes" : "No"}
                                  </div>
                                  {isChecked && alcohol.qty && (
                                    <div className="text-sm text-slate-600">
                                      Qty: {alcohol.qty} ml
                                    </div>
                                  )}
                                  {isChecked && alcohol.frequency && (
                                    <div className="text-sm text-slate-600">
                                      Frequency: {alcohol.frequency}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                {/* Water */}
                {formData.foodFrequency.water !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">Water</h5>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-slate-900 mb-1">
                        Water:{" "}
                        {formData.foodFrequency.water?.checked ? "Yes" : "No"}
                      </div>
                      {formData.foodFrequency.water?.checked &&
                        formData.foodFrequency.water.qty && (
                          <div className="text-sm text-slate-600">
                            Qty: {formData.foodFrequency.water.qty} cups/pieces
                          </div>
                        )}
                      {formData.foodFrequency.water?.checked &&
                        formData.foodFrequency.water.frequency && (
                          <div className="text-sm text-slate-600">
                            Frequency: {formData.foodFrequency.water.frequency}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Healthy Foods */}
                {formData.foodFrequency.healthyFoods &&
                  (Array.isArray(formData.foodFrequency.healthyFoods)
                    ? formData.foodFrequency.healthyFoods.length > 0
                    : Object.keys(formData.foodFrequency.healthyFoods).length >
                      0) && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
                      <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
                        Healthy Foods
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {Array.isArray(formData.foodFrequency.healthyFoods)
                          ? // Handle as array (legacy format)
                            formData.foodFrequency.healthyFoods
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
                              ))
                          : // Handle as object (current format)
                            [
                              "Leafy Veg (Bowls)",
                              "Fresh Fruits",
                              "Dry Fruits & Nuts",
                              "Veg Salad",
                            ].map((itemName) => {
                              const key = itemName
                                .toLowerCase()
                                .replace(/[ &]/g, "");
                              const item = (
                                formData.foodFrequency?.healthyFoods as any
                              )?.[key];
                              const isChecked = item?.checked === true;
                              return (
                                <div key={key} className="bg-white rounded p-3">
                                  <div className="font-medium text-slate-900 mb-1">
                                    {itemName}: {isChecked ? "Yes" : "No"}
                                  </div>
                                  {isChecked && item.qty && (
                                    <div className="text-sm text-slate-600">
                                      Qty: {item.qty} cups/pieces
                                    </div>
                                  )}
                                  {isChecked && item.frequency && (
                                    <div className="text-sm text-slate-600">
                                      Frequency: {item.frequency}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  )}

                {/* Eating Out */}
                {formData.foodFrequency.eatingOut !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Eating Out
                    </h5>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-slate-900 mb-1">
                        Eating Out:{" "}
                        {formData.foodFrequency.eatingOut?.checked
                          ? "Yes"
                          : "No"}
                      </div>
                      {formData.foodFrequency.eatingOut?.checked &&
                        formData.foodFrequency.eatingOut.frequency && (
                          <div className="text-sm text-slate-600 mb-2">
                            Frequency:{" "}
                            {formData.foodFrequency.eatingOut.frequency}
                          </div>
                        )}
                      {formData.foodFrequency.eatingOut?.checked &&
                        formData.foodFrequency.eatingOut.foodItems && (
                          <div className="text-sm text-slate-600">
                            Food Items:{" "}
                            {formData.foodFrequency.eatingOut.foodItems}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Coconut */}
                {formData.foodFrequency.coconut !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Coconut
                    </h5>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-slate-900 mb-1">
                        Coconut:{" "}
                        {formData.foodFrequency.coconut?.checked ? "Yes" : "No"}
                      </div>
                      {formData.foodFrequency.coconut?.checked &&
                        formData.foodFrequency.coconut.frequency && (
                          <div className="text-sm text-slate-600">
                            Frequency:{" "}
                            {formData.foodFrequency.coconut.frequency}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Pizza/Burger */}
                {formData.foodFrequency.pizzaBurger !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-700 mb-3">
                      Pizza/Burger
                    </h5>
                    <div className="bg-white rounded p-3">
                      <div className="font-medium text-slate-900 mb-1">
                        Pizza/Burger:{" "}
                        {formData.foodFrequency.pizzaBurger?.checked
                          ? "Yes"
                          : "No"}
                      </div>
                      {formData.foodFrequency.pizzaBurger?.checked &&
                        formData.foodFrequency.pizzaBurger.qty && (
                          <div className="text-sm text-slate-600 mb-2">
                            Qty: {formData.foodFrequency.pizzaBurger.qty}{" "}
                            cups/pieces
                          </div>
                        )}
                      {formData.foodFrequency.pizzaBurger?.checked &&
                        formData.foodFrequency.pizzaBurger.frequency && (
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
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 shadow-sm mb-4">
                      <h5 className="font-bold text-slate-800 mb-4 text-lg border-b-2 border-slate-300 pb-2">
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

                {/* Health Conditions - Show all conditions with Yes/No */}
                {formData.healthProfile.conditions &&
                  (Array.isArray(formData.healthProfile.conditions)
                    ? formData.healthProfile.conditions.length > 0
                    : Object.keys(formData.healthProfile.conditions).length >
                      0) && (
                    <div className="md:col-span-2">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h5 className="font-semibold text-slate-700 mb-3">
                          Health Conditions
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(() => {
                            // List of all conditions from the form
                            const allConditions = [
                              "High B.P",
                              "Diabetes",
                              "High Cholesterol",
                              "Obesity",
                              "Cardiac Risk",
                              "Heart Problem",
                              "Back Pain",
                              "Neck Pain",
                              "Knee Pain",
                              "Shoulder Pain",
                              "Respiratory Problem (Asthma/Breathlessness)",
                              "Post-Operative",
                              "Hormonal Problem",
                              "Thyroid",
                              "PCOD",
                              "PCOS",
                              "Gynec Problem",
                              "Gastric Problem",
                              "Acidity",
                              "Constipation",
                              "Allergy",
                              "Water Retention",
                            ];

                            if (
                              Array.isArray(formData.healthProfile?.conditions)
                            ) {
                              // Handle as array - show all conditions
                              return allConditions.map((conditionName) => {
                                const condition =
                                  formData.healthProfile?.conditions?.find(
                                    (c: any) => c?.name === conditionName
                                  );
                                const hasCondition =
                                  condition?.hasCondition || "No";
                                return (
                                  <div
                                    key={conditionName}
                                    className="bg-white rounded p-3 border border-emerald-200"
                                  >
                                    <div className="font-medium text-slate-900 mb-1">
                                      {conditionName}
                                    </div>
                                    <div
                                      className={`text-sm font-semibold ${
                                        hasCondition === "Yes"
                                          ? "text-emerald-600"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      {hasCondition}
                                    </div>
                                    {hasCondition === "Yes" &&
                                      condition?.notes && (
                                        <div className="text-xs text-slate-600 mt-1">
                                          {condition.notes}
                                        </div>
                                      )}
                                  </div>
                                );
                              });
                            } else {
                              // Handle as object - show all conditions
                              return allConditions.map((conditionName) => {
                                const conditionData = (
                                  formData.healthProfile?.conditions as any
                                )?.[conditionName];
                                const hasCondition =
                                  conditionData?.hasCondition || "No";
                                return (
                                  <div
                                    key={conditionName}
                                    className="bg-white rounded p-3 border border-emerald-200"
                                  >
                                    <div className="font-medium text-slate-900 mb-1">
                                      {conditionName}
                                    </div>
                                    <div
                                      className={`text-sm font-semibold ${
                                        hasCondition === "Yes"
                                          ? "text-emerald-600"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      {hasCondition}
                                    </div>
                                    {hasCondition === "Yes" &&
                                      conditionData?.notes && (
                                        <div className="text-xs text-slate-600 mt-1">
                                          {conditionData.notes}
                                        </div>
                                      )}
                                  </div>
                                );
                              });
                            }
                          })()}
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
              <FieldDisplay
                label="Duration of Diet"
                value={formData.dietPrescribed.durationOfDiet}
              />
              <FieldDisplay
                label="Diet Chart"
                value={formData.dietPrescribed.dietChart}
              />
              <FieldDisplay label="Code" value={formData.dietPrescribed.code} />

              {/* Uploaded PDFs */}
              {attachments && attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-700 mb-3 text-sm">
                    Uploaded Diet Charts ({attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {attachments.map((pdf, index) => (
                      <div
                        key={pdf.id || index}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                            <FileText className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium text-slate-800 truncate mb-1"
                              title={pdf.fileName}
                            >
                              {pdf.fileName}
                            </p>
                            <p className="text-xs text-slate-500 mb-2">
                              {(pdf.sizeInBytes / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {pdf.fileUrl && (
                              <a
                                href={pdf.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Preview PDF
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              {/* PDF Attachments */}
              {(attachments.some(
                (att) =>
                  att.section === "DietPrescribed" &&
                  att.fileCategory === "DIET_CHART"
              ) ||
                (formData.dietPrescribed as any)?.dietChartUrl) && (
                <div className="md:col-span-2">
                  <div className="bg-white border-2 border-emerald-200 rounded-lg p-4 shadow-sm">
                    <label className="block font-semibold mb-3 text-slate-700 text-sm sm:text-base">
                      Diet Chart PDFs
                    </label>
                    {/* Show all attachments from API, fallback to formData for backward compatibility */}
                    {(() => {
                      const dietChartAttachments = attachments.filter(
                        (att) =>
                          att.section === "DietPrescribed" &&
                          att.fileCategory === "DIET_CHART"
                      );

                      // Fallback to single file from formData for backward compatibility
                      // Note: These fields may not exist in the TypeScript interface but could be in the data
                      const dietPrescribedData = formData.dietPrescribed as any;
                      const legacyPdfUrl = dietPrescribedData?.dietChartUrl;
                      const legacyFileName =
                        dietPrescribedData?.dietChartFileName;
                      const legacyFileSize =
                        dietPrescribedData?.dietChartFileSize;

                      // If no attachments found, check for legacy single file
                      if (dietChartAttachments.length === 0 && !legacyPdfUrl) {
                        return (
                          <p className="text-sm text-slate-500 italic">
                            No PDF files uploaded
                          </p>
                        );
                      }

                      const formatFileSize = (bytes?: number) => {
                        if (!bytes) return "";
                        if (bytes === 0) return "0 Bytes";
                        const k = 1024;
                        const sizes = ["Bytes", "KB", "MB"];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        return (
                          Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
                          " " +
                          sizes[i]
                        );
                      };

                      return (
                        <div className="space-y-2">
                          {/* Display all attachments */}
                          <PDFAttachmentList
                            attachments={dietChartAttachments}
                            formatFileSize={formatFileSize}
                            onAttachmentDeleted={
                              onAttachmentDeleted || undefined
                            }
                          />

                          {/* Legacy single file fallback */}
                          {dietChartAttachments.length === 0 &&
                            legacyPdfUrl && (
                              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                                <a
                                  href={legacyPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 flex-1 min-w-0 group"
                                >
                                  <svg
                                    className="w-5 h-5 text-emerald-600 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-emerald-700 group-hover:text-emerald-800 truncate">
                                      {legacyFileName || "View Diet Chart PDF"}
                                    </p>
                                    {legacyFileSize && (
                                      <p className="text-xs text-slate-500">
                                        {formatFileSize(legacyFileSize)}
                                      </p>
                                    )}
                                  </div>
                                </a>
                                <svg
                                  className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </div>
                            )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
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
