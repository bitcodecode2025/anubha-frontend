"use client";

import { useState, useEffect } from "react";
import { DoctorNotesFormData, getDoctorNotes } from "@/lib/doctor-notes-api";
import { useDoctorNotes } from "@/app/context/DoctorNotesContext";

interface UseDoctorNotesFormProps {
  appointmentId: string;
}

interface UseDoctorNotesFormReturn {
  // Form state
  originalFormData: DoctorNotesFormData;
  setOriginalFormData: (data: DoctorNotesFormData) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  loading: boolean;
  hasExistingNotes: boolean;
  saveStartTime: number | null;
  setSaveStartTime: (time: number | null) => void;
  elapsedTime: number;
  attachments: any[];
  setAttachments: (attachments: any[]) => void;
  openSections: Set<string>;
  toggleSection: (sectionId: string) => void;
  
  // Form data from context
  formData: DoctorNotesFormData;
  updateFormData: (path: string[], value: any) => void;
  getFormValue: (path: string[]) => any;
  clearFormData: () => void;
  
  // Helper functions
  formatFileSize: (bytes: number) => string;
  getChangedFields: (
    original: any,
    current: any,
    path?: string[]
  ) => Partial<DoctorNotesFormData>;
  
  // Auto-save state from context
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  isAutoSaving: boolean;
  
  // Actions
  loadExistingNotes: () => Promise<void>;
}

export function useDoctorNotesForm({
  appointmentId,
}: UseDoctorNotesFormProps): UseDoctorNotesFormReturn {
  // Use context for form data management
  const {
    formData,
    updateFormData,
    getFormValue,
    clearFormData,
    hasUnsavedChanges,
    lastSaved,
    isAutoSaving,
  } = useDoctorNotes();

  const [originalFormData, setOriginalFormData] = useState<DoctorNotesFormData>(
    {}
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasExistingNotes, setHasExistingNotes] = useState(false);
  const [saveStartTime, setSaveStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["section1"])
  );

  // Update elapsed time every second when saving
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (saving && saveStartTime) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - saveStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [saving, saveStartTime]);

  // Load existing notes on mount to check if notes exist in database
  useEffect(() => {
    loadExistingNotes();
  }, [appointmentId]);

  async function loadExistingNotes() {
    setLoading(true);
    try {
      const response = await getDoctorNotes(appointmentId);
      if (response.success && response.doctorNotes) {
        if (response.doctorNotes.formData) {
          const loadedData = response.doctorNotes.formData;
          // Store original for change detection
          setOriginalFormData(JSON.parse(JSON.stringify(loadedData))); // Deep copy
          setHasExistingNotes(true);
        } else {
          setHasExistingNotes(false);
        }
        // Load attachments for preview
        if (response.doctorNotes.attachments) {
          setAttachments(response.doctorNotes.attachments);
        }
      } else {
        setHasExistingNotes(false);
      }
    } catch (error: any) {
      // Don't show error toast - it's okay if no notes exist yet
      setHasExistingNotes(false);
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  /**
   * Get only changed fields between original and current form data
   */
  function getChangedFields(
    original: any,
    current: any,
    path: string[] = []
  ): Partial<DoctorNotesFormData> {
    const changed: any = {};

    // Get all keys from both objects
    const allKeys = new Set([
      ...Object.keys(original || {}),
      ...Object.keys(current || {}),
    ]);

    for (const key of allKeys) {
      const currentPath = [...path, key];
      const originalValue = original?.[key];
      const currentValue = current?.[key];

      if (
        typeof originalValue === "object" &&
        typeof currentValue === "object" &&
        originalValue !== null &&
        currentValue !== null &&
        !Array.isArray(originalValue) &&
        !Array.isArray(currentValue)
      ) {
        // Recursively check nested objects
        const nestedChanges = getChangedFields(
          originalValue,
          currentValue,
          currentPath
        );
        if (Object.keys(nestedChanges).length > 0) {
          changed[key] = nestedChanges;
        }
      } else if (
        JSON.stringify(originalValue) !== JSON.stringify(currentValue)
      ) {
        // Field has changed
        changed[key] = currentValue;
      }
    }

    return changed;
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return {
    // Form state
    originalFormData,
    setOriginalFormData,
    saving,
    setSaving,
    loading,
    hasExistingNotes,
    saveStartTime,
    setSaveStartTime,
    elapsedTime,
    attachments,
    setAttachments,
    openSections,
    toggleSection,
    
    // Form data from context
    formData,
    updateFormData,
    getFormValue,
    clearFormData,
    hasUnsavedChanges,
    lastSaved,
    isAutoSaving,
    
    // Helper functions
    formatFileSize,
    getChangedFields,
    
    // Actions
    loadExistingNotes,
  };
}
