"use client";

import React from "react";

// Helper function to format values
export const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map((v) => formatValue(v)).join(", ");
  }
  if (typeof value === "object") {
    return "—";
  }
  return String(value);
};

// Field display component
export const FieldDisplay = ({
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
