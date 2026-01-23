"use client";

import React, { useMemo } from "react";
import type { DoctorNotesFormData } from "@/lib/doctor-notes-api";

interface NotesSectionProps {
  formData: Pick<DoctorNotesFormData, "notes">;
}

const NotesSection = ({ formData }: NotesSectionProps) => {
  // Memoize check for whether section has data
  const hasData = useMemo(() => {
    return !!formData.notes;
  }, [formData.notes]);

  if (!hasData) return null;

  return (
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
  );
};

export default React.memo(NotesSection);
