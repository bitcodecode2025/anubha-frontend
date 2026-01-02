"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { DoctorNotesFormData } from "@/lib/doctor-notes-api";

interface DoctorNotesContextType {
  formData: DoctorNotesFormData;
  updateFormData: (path: string[], value: any) => void;
  getFormValue: (path: string[]) => any;
  clearFormData: () => void;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  isAutoSaving: boolean;
}

const DoctorNotesContext = createContext<DoctorNotesContextType | undefined>(
  undefined
);

const STORAGE_PREFIX = "doctor_notes_draft_";
const AUTO_SAVE_DELAY = 2000; // 2 seconds debounce

interface DoctorNotesProviderProps {
  children: React.ReactNode;
  appointmentId: string;
  initialData?: DoctorNotesFormData;
}

export function DoctorNotesProvider({
  children,
  appointmentId,
  initialData,
}: DoctorNotesProviderProps) {
  const storageKey = `${STORAGE_PREFIX}${appointmentId}`;
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<DoctorNotesFormData>(
    initialData || {}
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    if (!appointmentId) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Remove metadata before setting form data
        const { _lastSaved, ...restoredData } = parsed;

        // If initialData is provided (from server), it takes precedence
        // Otherwise, use restored data from localStorage
        const mergedData = initialData
          ? { ...restoredData, ...initialData }
          : restoredData;

        setFormData(mergedData);
        setLastSaved(_lastSaved ? new Date(_lastSaved) : null);
        setHasUnsavedChanges(false);
      } else if (initialData) {
        // No stored data, use initial data from server
        setFormData(initialData);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      // If restore fails, use initialData or empty object
      if (initialData) {
        setFormData(initialData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, storageKey]); // Only run on mount, initialData is intentionally excluded

  // Auto-save to localStorage with debounce
  const saveToLocalStorage = useCallback(
    (data: DoctorNotesFormData) => {
      if (!appointmentId) return;

      try {
        const dataToStore = {
          ...data,
          _lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
        setLastSaved(new Date());
        setIsAutoSaving(false);
      } catch (error) {
        setIsAutoSaving(false);
      }
    },
    [appointmentId, storageKey]
  );

  // Debounced auto-save
  // Use a ref to always get the latest formData without causing re-renders
  const formDataRef = useRef(formData);

  // Update ref whenever formData changes
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    if (!hasUnsavedChanges || !appointmentId) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setIsAutoSaving(true);

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Use ref to get latest formData without causing dependency issues
      saveToLocalStorage(formDataRef.current);
      setHasUnsavedChanges(false);
    }, AUTO_SAVE_DELAY);

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, appointmentId, saveToLocalStorage]); // Removed formData from dependencies

  // Update form data
  const updateFormData = useCallback((path: string[], value: any) => {
    setFormData((prev) => {
      const newData = { ...prev };
      let current: any = newData;

      // Navigate to the nested path
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        // Ensure we're working with a copy, not the original
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }

      // Set the value
      current[path[path.length - 1]] = value;

      // Mark as having unsaved changes
      setHasUnsavedChanges(true);

      return newData;
    });
  }, []);

  // Get form value by path
  const getFormValue = useCallback(
    (path: string[]): any => {
      let current: any = formData;
      for (const key of path) {
        if (current && typeof current === "object") {
          current = current[key];
        } else {
          return undefined;
        }
      }
      return current;
    },
    [formData]
  );

  // Clear form data (called after successful submission)
  const clearFormData = useCallback(() => {
    if (!appointmentId) return;

    try {
      localStorage.removeItem(storageKey);
      setFormData({});
      setHasUnsavedChanges(false);
      setLastSaved(null);
    } catch (error) {
      // Failed to clear localStorage, silently continue
    }
  }, [appointmentId, storageKey]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges && appointmentId) {
        // Save immediately without debounce
        saveToLocalStorage(formData);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData, hasUnsavedChanges, appointmentId, saveToLocalStorage]);

  const value: DoctorNotesContextType = {
    formData,
    updateFormData,
    getFormValue,
    clearFormData,
    hasUnsavedChanges,
    lastSaved,
    isAutoSaving,
  };

  return (
    <DoctorNotesContext.Provider value={value}>
      {children}
    </DoctorNotesContext.Provider>
  );
}

export function useDoctorNotes() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useDoctorNotes must be used within a DoctorNotesProvider");
  }
  return context;
}
