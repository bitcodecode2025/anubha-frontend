"use client";

import { useEffect, useState } from "react";
import {
  getDoctorFieldGroups,
  searchDoctorFields,
  saveDoctorSession,
  type DoctorFieldMaster,
  type DoctorFieldGroup,
  type DoctorFormFieldValue,
} from "@/lib/doctor-notes";
import { X, Plus, Search, Loader2, Stethoscope, Save } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface DoctorNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientId: string;
  existingSession?: {
    id: string;
    notes: string | null;
    values: Array<{
      id: string;
      fieldId: string;
      stringValue: string | null;
      numberValue: number | null;
      booleanValue: boolean | null;
      dateValue: string | null;
      timeValue: string | null;
      jsonValue: any;
      notes: string | null;
      field?: {
        id: string;
        key: string;
        label: string;
        type: string;
        options?: Array<{
          id: string;
          value: string;
          label: string;
        }>;
      };
    }>;
  };
  onSave?: () => void; // Callback to refresh data after save
}

interface FieldValue {
  fieldId: string;
  value: {
    stringValue?: string | null;
    numberValue?: number | null;
    booleanValue?: boolean | null;
    dateValue?: string | null;
    timeValue?: string | null;
    jsonValue?: any;
    notes?: string | null;
  };
}

export default function DoctorNotesModal({
  isOpen,
  onClose,
  appointmentId,
  patientId,
  existingSession,
  onSave,
}: DoctorNotesModalProps) {
  const [groups, setGroups] = useState<DoctorFieldGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DoctorFieldMaster[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>(
    {}
  );
  const [notes, setNotes] = useState(existingSession?.notes || "");

  // Load field groups on mount
  useEffect(() => {
    if (isOpen) {
      loadFieldGroups();
      if (existingSession) {
        // Load existing values
        const values: Record<string, FieldValue> = {};
        const selected = new Set<string>();
        existingSession.values.forEach((v) => {
          selected.add(v.fieldId);
          values[v.fieldId] = {
            fieldId: v.fieldId,
            value: {
              stringValue: v.stringValue ?? null,
              numberValue: v.numberValue ?? null,
              booleanValue: v.booleanValue ?? null,
              dateValue: v.dateValue ?? null,
              timeValue: v.timeValue ?? null,
              jsonValue: v.jsonValue ?? null,
              notes: v.notes ?? null,
            },
          };
        });
        setSelectedFields(selected);
        setFieldValues(values);
        setNotes(existingSession.notes || "");
      }
    }
  }, [isOpen, existingSession]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen || showAddField) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, showAddField]);

  async function loadFieldGroups() {
    setLoading(true);
    try {
      const response = await getDoctorFieldGroups();
      setGroups(response.groups);
      // Pre-select some common fields (first 5 from first group)
      if (response.groups.length > 0 && response.groups[0].fields.length > 0) {
        const commonFields = response.groups[0].fields.slice(0, 5);
        const initialSelected = new Set(commonFields.map((f) => f.id));
        setSelectedFields(initialSelected);
      }
    } catch (error: any) {
      console.error("Failed to load field groups:", error);
      toast.error("Failed to load form fields");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await searchDoctorFields(query);
      setSearchResults(response.fields);
    } catch (error: any) {
      console.error("Failed to search fields:", error);
      toast.error("Failed to search fields");
    } finally {
      setSearching(false);
    }
  }

  function addField(field: DoctorFieldMaster) {
    setSelectedFields((prev) => new Set([...prev, field.id]));
    setFieldValues((prev) => ({
      ...prev,
      [field.id]: {
        fieldId: field.id,
        value: {},
      },
    }));
    setShowAddField(false);
    setSearchQuery("");
    setSearchResults([]);
  }

  function removeField(fieldId: string) {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      next.delete(fieldId);
      return next;
    });
    setFieldValues((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  function updateFieldValue(fieldId: string, value: any) {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: {
        fieldId,
        value: { ...prev[fieldId]?.value, ...value },
      },
    }));
  }

  function getFieldValue(fieldId: string, type: string): any {
    const fv = fieldValues[fieldId];
    if (!fv) return null;

    switch (type) {
      case "TEXT":
      case "TEXTAREA":
        return fv.value.stringValue || "";
      case "NUMBER":
        return fv.value.numberValue ?? null;
      case "BOOLEAN":
        return fv.value.booleanValue ?? null;
      case "DATE":
        return fv.value.dateValue || "";
      case "TIME":
        return fv.value.timeValue || "";
      case "SELECT":
      case "RADIO":
        return fv.value.stringValue || "";
      case "MULTISELECT":
        return fv.value.jsonValue || [];
      default:
        return null;
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const fieldValuesArray = Object.values(fieldValues).filter((fv) =>
        selectedFields.has(fv.fieldId)
      );

      await saveDoctorSession({
        appointmentId,
        patientId,
        title: "Doctor Notes",
        notes,
        fieldValues: fieldValuesArray,
      });

      toast.success("Doctor notes saved successfully!");
      if (onSave) onSave();
      onClose();
    } catch (error: any) {
      console.error("Failed to save doctor notes:", error);
      toast.error(
        error?.response?.data?.error || "Failed to save doctor notes"
      );
    } finally {
      setSaving(false);
    }
  }

  function renderFieldInput(field: DoctorFieldMaster) {
    const value = getFieldValue(field.id, field.type);

    switch (field.type) {
      case "TEXT":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) =>
              updateFieldValue(field.id, { stringValue: e.target.value })
            }
            placeholder={field.placeholder || field.label}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case "TEXTAREA":
        return (
          <textarea
            value={value || ""}
            onChange={(e) =>
              updateFieldValue(field.id, { stringValue: e.target.value })
            }
            placeholder={field.placeholder || field.label}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case "NUMBER":
        return (
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) =>
              updateFieldValue(field.id, {
                numberValue: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder={field.placeholder || field.label}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case "BOOLEAN":
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={value === true}
                onChange={() =>
                  updateFieldValue(field.id, { booleanValue: true })
                }
                className="w-4 h-4 text-emerald-600"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={value === false}
                onChange={() =>
                  updateFieldValue(field.id, { booleanValue: false })
                }
                className="w-4 h-4 text-emerald-600"
              />
              <span>No</span>
            </label>
          </div>
        );

      case "DATE":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) =>
              updateFieldValue(field.id, { dateValue: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case "TIME":
        return (
          <input
            type="time"
            value={value || ""}
            onChange={(e) =>
              updateFieldValue(field.id, { timeValue: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );

      case "SELECT":
        return (
          <select
            value={value || ""}
            onChange={(e) =>
              updateFieldValue(field.id, { stringValue: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select...</option>
            {field.options.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "RADIO":
        return (
          <div className="flex flex-wrap gap-4">
            {field.options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() =>
                    updateFieldValue(field.id, { stringValue: opt.value })
                  }
                  className="w-4 h-4 text-emerald-600"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case "MULTISELECT":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter((v) => v !== opt.value);
                    updateFieldValue(field.id, { jsonValue: newValues });
                  }}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="main-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-slate-900">
                    Add Doctor Notes
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <ModalSkeleton />
                ) : (
                  <div className="space-y-6">
                    {/* Add Field Button */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-slate-900">
                        Form Fields
                      </h4>
                      <button
                        onClick={() => setShowAddField(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Field
                      </button>
                    </div>

                    {/* Field Groups */}
                    {groups.map((group) => {
                      const groupFields = group.fields.filter((f) =>
                        selectedFields.has(f.id)
                      );
                      if (groupFields.length === 0) return null;

                      return (
                        <div
                          key={group.id}
                          className="border border-slate-200 rounded-lg p-4"
                        >
                          <h5 className="text-md font-semibold text-slate-900 mb-4">
                            {group.title}
                          </h5>
                          <div className="space-y-4">
                            {groupFields.map((field) => (
                              <div key={field.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-slate-700">
                                    {field.label}
                                    {field.required && (
                                      <span className="text-red-500 ml-1">
                                        *
                                      </span>
                                    )}
                                  </label>
                                  <button
                                    onClick={() => removeField(field.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                                {field.description && (
                                  <p className="text-xs text-slate-500">
                                    {field.description}
                                  </p>
                                )}
                                {renderFieldInput(field)}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Notes Section */}
                    <div className="border border-slate-200 rounded-lg p-4">
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Additional Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any additional notes or observations..."
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Notes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Field Search Modal */}
      <AnimatePresence>
        {showAddField && (
          <motion.div
            key="search-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddField(false)}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Search Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900">
                  Search and Add Field
                </h4>
                <button
                  onClick={() => setShowAddField(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search fields by name or key..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    {searchQuery.length < 2
                      ? "Type at least 2 characters to search"
                      : "No fields found"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((field) => (
                      <button
                        key={field.id}
                        onClick={() => addField(field)}
                        disabled={selectedFields.has(field.id)}
                        className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-medium text-slate-900">
                          {field.label}
                        </div>
                        {field.description && (
                          <div className="text-sm text-slate-500 mt-1">
                            {field.description}
                          </div>
                        )}
                        <div className="text-xs text-slate-400 mt-1">
                          Type: {field.type}
                        </div>
                        {selectedFields.has(field.id) && (
                          <div className="text-xs text-emerald-600 mt-1">
                            Already added
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Skeleton Loader for Modal
function ModalSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-200 rounded-lg w-32 animate-pulse"></div>
        <div className="h-10 bg-emerald-200 rounded-lg w-28 animate-pulse"></div>
      </div>

      {/* Field Groups Skeleton */}
      {[1, 2, 3].map((group) => (
        <div
          key={group}
          className="border border-slate-200 rounded-lg p-4 space-y-4"
        >
          {/* Group Title Skeleton */}
          <div className="h-5 bg-slate-200 rounded w-1/3 animate-pulse"></div>

          {/* Fields Skeleton */}
          {[1, 2, 3].map((field) => (
            <div key={field} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      ))}

      {/* Notes Section Skeleton */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
        <div className="h-24 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}
