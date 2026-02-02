"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { DoctorNotesFormData } from "@/lib/doctor-notes-api";

interface DoctorNotesContextType {
  // Full formData (computed, for backward compatibility)
  formData: DoctorNotesFormData;
  updateFormData: (path: string[], value: any) => void;
  getFormValue: (path: string[]) => any;
  clearFormData: () => void;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  isAutoSaving: boolean;

  // Section-specific accessors (for new optimized code)
  getSectionData: (sectionKey: string) => any;
  updateSectionData: (sectionKey: string, data: any) => void;
}

const DoctorNotesContext = createContext<DoctorNotesContextType | undefined>(
  undefined
);

const STORAGE_PREFIX = "doctor_notes_draft_";
const AUTO_SAVE_DELAY = 1000; // 1 second debounce (reduced for faster saves)

interface DoctorNotesProviderProps {
  children: React.ReactNode;
  appointmentId: string;
  initialData?: DoctorNotesFormData;
}

// Section keys mapping
type SectionKey =
  | "baseInfo"
  | "foodRecall"
  | "weekendDiet"
  | "questionnaire"
  | "foodFrequency"
  | "healthProfile"
  | "dietPrescribed"
  | "bodyMeasurements"
  | "notes";

// Base Info fields (Section 1 - flat fields)
const BASE_INFO_FIELDS = [
  "personalHistory",
  "reasonForJoiningProgram",
  "ethnicity",
  "joiningDate",
  "expiryDate",
  "dietPrescriptionDate",
  "durationOfDiet",
  "previousDietTaken",
  "previousDietDetails",
  "typeOfDietTaken",
  "maritalStatus",
  "numberOfChildren",
  "dietPreference",
  "wakeupTime",
  "bedTime",
  "dayNap",
  "workoutTiming",
  "workoutType",
] as const;

// Food Recall fields (Section 2)
const FOOD_RECALL_FIELDS = [
  "morningIntake",
  "breakfast",
  "midMorning",
  "lunch",
  "midDay",
  "eveningSnack",
  "dinner",
] as const;

export function DoctorNotesProvider({
  children,
  appointmentId,
  initialData,
}: DoctorNotesProviderProps) {
  const storageKey = `${STORAGE_PREFIX}${appointmentId}`;
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Split formData into section-specific states
  // Section 1: Base Info (flat fields)
  const [baseInfoState, setBaseInfoState] = useState<Partial<DoctorNotesFormData>>(
    () => {
      const baseInfo: Partial<DoctorNotesFormData> = {};
      if (initialData) {
        BASE_INFO_FIELDS.forEach((key) => {
          if (key in initialData) {
            (baseInfo as any)[key] = (initialData as any)[key];
          }
        });
      }
      return baseInfo;
    }
  );

  // Section 2: Food Recall
  const [foodRecallState, setFoodRecallState] = useState<Partial<DoctorNotesFormData>>(
    () => {
      const foodRecall: Partial<DoctorNotesFormData> = {};
      if (initialData) {
        FOOD_RECALL_FIELDS.forEach((key) => {
          if (key in initialData) {
            (foodRecall as any)[key] = (initialData as any)[key];
          }
        });
      }
      return foodRecall;
    }
  );

  // Section 3: Weekend Diet
  const [weekendDietState, setWeekendDietState] = useState<
    Partial<DoctorNotesFormData>
  >(() => ({
    weekendDiet: initialData?.weekendDiet,
  }));

  // Section 4: Questionnaire
  const [questionnaireState, setQuestionnaireState] = useState<
    Partial<DoctorNotesFormData>
  >(() => ({
    questionnaire: initialData?.questionnaire,
  }));

  // Section 5: Food Frequency
  const [foodFrequencyState, setFoodFrequencyState] = useState<
    Partial<DoctorNotesFormData>
  >(() => ({
    foodFrequency: initialData?.foodFrequency,
  }));

  // Section 6: Health Profile
  const [healthProfileState, setHealthProfileState] = useState<
    Partial<DoctorNotesFormData>
  >(() => ({
    healthProfile: initialData?.healthProfile,
  }));

  // Section 7: Diet Prescribed
  const [dietPrescribedState, setDietPrescribedState] = useState<
    Partial<DoctorNotesFormData>
  >(() => ({
    dietPrescribed: initialData?.dietPrescribed,
  }));

  // Section 8: Body Measurements
  const [bodyMeasurementsState, setBodyMeasurementsState] = useState<
    Partial<DoctorNotesFormData>
  >(() => ({
    bodyMeasurements: initialData?.bodyMeasurements,
  }));

  // Section 10: Notes
  const [notesState, setNotesState] = useState<Partial<DoctorNotesFormData>>(() => ({
    notes: initialData?.notes,
  }));

  // Auto-save tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Computed full formData (for backward compatibility)
  const formData: DoctorNotesFormData = useMemo(
    () => ({
      ...baseInfoState,
      ...foodRecallState,
      ...weekendDietState,
      ...questionnaireState,
      ...foodFrequencyState,
      ...healthProfileState,
      ...dietPrescribedState,
      ...bodyMeasurementsState,
      ...notesState,
    }),
    [
      baseInfoState,
      foodRecallState,
      weekendDietState,
      questionnaireState,
      foodFrequencyState,
      healthProfileState,
      dietPrescribedState,
      bodyMeasurementsState,
      notesState,
    ]
  );

  // Refs to track latest state for auto-save without causing re-renders
  const stateRefs = useRef({
    baseInfo: baseInfoState,
    foodRecall: foodRecallState,
    weekendDiet: weekendDietState,
    questionnaire: questionnaireState,
    foodFrequency: foodFrequencyState,
    healthProfile: healthProfileState,
    dietPrescribed: dietPrescribedState,
    bodyMeasurements: bodyMeasurementsState,
    notes: notesState,
  });

  // Update refs whenever state changes
  useEffect(() => {
    stateRefs.current = {
      baseInfo: baseInfoState,
      foodRecall: foodRecallState,
      weekendDiet: weekendDietState,
      questionnaire: questionnaireState,
      foodFrequency: foodFrequencyState,
      healthProfile: healthProfileState,
      dietPrescribed: dietPrescribedState,
      bodyMeasurements: bodyMeasurementsState,
      notes: notesState,
    };
  }, [
    baseInfoState,
    foodRecallState,
    weekendDietState,
    questionnaireState,
    foodFrequencyState,
    healthProfileState,
    dietPrescribedState,
    bodyMeasurementsState,
    notesState,
  ]);

  // Load data from localStorage on mount with smart merging
  useEffect(() => {
    if (!appointmentId) return;

    try {
      const stored = localStorage.getItem(storageKey);
      let localStorageData: any = null;
      let localStorageTimestamp: Date | null = null;

      if (stored) {
        const parsed = JSON.parse(stored);
        const { _lastSaved, ...restoredData } = parsed;
        localStorageData = restoredData;
        localStorageTimestamp = _lastSaved ? new Date(_lastSaved) : null;
      }

      // Smart merge: Prefer newer data based on timestamps
      // If localStorage exists and is newer (or no server data), use localStorage
      // If server data is newer, merge intelligently (localStorage edits take precedence for edited fields)
      let mergedData: Partial<DoctorNotesFormData> = {};

      if (localStorageData && initialData) {
        // Both exist - merge intelligently
        // localStorage (user edits) takes precedence for fields that exist in localStorage
        // Server data fills in missing fields
        mergedData = {
          ...initialData, // Start with server data (baseline)
          ...localStorageData, // Override with localStorage (user edits win)
        };
      } else if (localStorageData) {
        // Only localStorage exists
        mergedData = localStorageData;
      } else if (initialData) {
        // Only server data exists
        mergedData = initialData;
      }

      // Split merged data into sections - ensure ALL fields are preserved
      const baseInfo: Partial<DoctorNotesFormData> = {};
      const foodRecall: Partial<DoctorNotesFormData> = {};

      // Base Info fields
      BASE_INFO_FIELDS.forEach((key) => {
        if (key in mergedData) {
          (baseInfo as any)[key] = (mergedData as any)[key];
        }
      });

      // Food Recall fields
      FOOD_RECALL_FIELDS.forEach((key) => {
        if (key in mergedData) {
          (foodRecall as any)[key] = (mergedData as any)[key];
        }
      });

      // Set all section states - preserve all fields including nested ones
      // Use deep merge for nested objects to preserve all fields
      setBaseInfoState(baseInfo);
      setFoodRecallState(foodRecall);
      
      // Deep merge for nested objects - preserve all nested fields
      const mergeNestedObjects = (localStorageVal: any, serverVal: any) => {
        if (!localStorageVal) return serverVal || undefined;
        if (!serverVal) return localStorageVal;
        // Both exist - merge deeply (localStorage wins for conflicts)
        if (typeof localStorageVal === "object" && typeof serverVal === "object" && !Array.isArray(localStorageVal) && !Array.isArray(serverVal)) {
          return { ...serverVal, ...localStorageVal };
        }
        return localStorageVal; // localStorage always wins
      };
      
      setWeekendDietState({ 
        weekendDiet: mergeNestedObjects(mergedData.weekendDiet, initialData?.weekendDiet)
      });
      setQuestionnaireState({ 
        questionnaire: mergeNestedObjects(mergedData.questionnaire, initialData?.questionnaire)
      });
      setFoodFrequencyState({ 
        foodFrequency: mergeNestedObjects(mergedData.foodFrequency, initialData?.foodFrequency) || {}
      });
      setHealthProfileState({ 
        healthProfile: mergeNestedObjects(mergedData.healthProfile, initialData?.healthProfile)
      });
      setDietPrescribedState({ 
        dietPrescribed: mergeNestedObjects(mergedData.dietPrescribed, initialData?.dietPrescribed)
      });
      setBodyMeasurementsState({
        bodyMeasurements: mergeNestedObjects(mergedData.bodyMeasurements, initialData?.bodyMeasurements) || {}
      });
      setNotesState({ 
        notes: mergedData.notes !== undefined ? mergedData.notes : (initialData?.notes)
      });

      // Set last saved timestamp from localStorage if available
      setLastSaved(localStorageTimestamp);
      setHasUnsavedChanges(false);
    } catch (error) {
      // If restore fails, fall back to initialData
      console.error("Failed to restore from localStorage:", error);
      if (initialData) {
        // Already initialized from initialData in useState
        setHasUnsavedChanges(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, storageKey]); // Only run on mount, initialData is intentionally excluded

  // Auto-save to localStorage with debounce
  const saveToLocalStorage = useCallback(() => {
    if (!appointmentId) return;

    try {
      // Reconstruct full formData from refs (always latest)
      const fullData: DoctorNotesFormData = {
        ...stateRefs.current.baseInfo,
        ...stateRefs.current.foodRecall,
        ...stateRefs.current.weekendDiet,
        ...stateRefs.current.questionnaire,
        ...stateRefs.current.foodFrequency,
        ...stateRefs.current.healthProfile,
        ...stateRefs.current.dietPrescribed,
        ...stateRefs.current.bodyMeasurements,
        ...stateRefs.current.notes,
      };

      const now = new Date();
      const dataToStore = {
        ...fullData,
        _lastSaved: now.toISOString(),
        _version: "1.0", // Version for future migrations
      };
      
      // Use synchronous localStorage.setItem for reliability
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      setLastSaved(now);
      setIsAutoSaving(false);
    } catch (error) {
      // Handle quota exceeded or other localStorage errors gracefully
      console.error("Failed to save to localStorage:", error);
      setIsAutoSaving(false);
    }
  }, [appointmentId, storageKey]);

  // Debounced auto-save
  useEffect(() => {
    if (!hasUnsavedChanges || !appointmentId) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setIsAutoSaving(true);

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
      setHasUnsavedChanges(false);
    }, AUTO_SAVE_DELAY);

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, appointmentId, saveToLocalStorage]);

  // Section-specific update functions
  const updateBaseInfo = useCallback((field: string, value: any) => {
    setBaseInfoState((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const updateFoodRecall = useCallback((data: Partial<DoctorNotesFormData>) => {
    setFoodRecallState((prev) => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  }, []);

  const updateWeekendDiet = useCallback(
    (data: Partial<DoctorNotesFormData>) => {
      setWeekendDietState((prev) => ({ ...prev, ...data }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateQuestionnaire = useCallback(
    (data: Partial<DoctorNotesFormData>) => {
      setQuestionnaireState((prev) => ({ ...prev, ...data }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateFoodFrequency = useCallback(
    (data: Partial<DoctorNotesFormData>) => {
      setFoodFrequencyState((prev) => ({ ...prev, ...data }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateHealthProfile = useCallback(
    (data: Partial<DoctorNotesFormData>) => {
      setHealthProfileState((prev) => ({ ...prev, ...data }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateDietPrescribed = useCallback(
    (data: Partial<DoctorNotesFormData>) => {
      setDietPrescribedState((prev) => ({ ...prev, ...data }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateBodyMeasurements = useCallback(
    (data: Partial<DoctorNotesFormData>) => {
      setBodyMeasurementsState((prev) => ({ ...prev, ...data }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateNotes = useCallback((notes: string) => {
    setNotesState({ notes });
    setHasUnsavedChanges(true);
  }, []);

  // Generic section data getter
  const getSectionData = useCallback(
    (sectionKey: string): any => {
      switch (sectionKey) {
        case "baseInfo":
          return baseInfoState;
        case "foodRecall":
          return foodRecallState;
        case "weekendDiet":
          return weekendDietState.weekendDiet;
        case "questionnaire":
          return questionnaireState.questionnaire;
        case "foodFrequency":
          return foodFrequencyState.foodFrequency || {};
        case "healthProfile":
          return healthProfileState.healthProfile || {};
        case "dietPrescribed":
          return dietPrescribedState.dietPrescribed;
        case "bodyMeasurements":
          return bodyMeasurementsState.bodyMeasurements;
        case "notes":
          return notesState.notes;
        default:
          return undefined;
      }
    },
    [
      baseInfoState,
      foodRecallState,
      weekendDietState,
      questionnaireState,
      foodFrequencyState,
      healthProfileState,
      dietPrescribedState,
      bodyMeasurementsState,
      notesState,
    ]
  );

  // Generic section data updater
  const updateSectionData = useCallback((sectionKey: string, data: any) => {
    switch (sectionKey) {
      case "baseInfo":
        setBaseInfoState((prev) => ({ ...prev, ...data }));
        break;
      case "foodRecall":
        setFoodRecallState((prev) => ({ ...prev, ...data }));
        break;
      case "weekendDiet":
        setWeekendDietState({ weekendDiet: data });
        break;
      case "questionnaire":
        setQuestionnaireState({ questionnaire: data });
        break;
      case "foodFrequency":
        setFoodFrequencyState((prev) => ({
          foodFrequency: { ...(prev.foodFrequency || {}), ...data },
        }));
        break;
      case "healthProfile":
        setHealthProfileState((prev) => ({
          healthProfile: { ...(prev.healthProfile || {}), ...data },
        }));
        break;
      case "dietPrescribed":
        setDietPrescribedState({ dietPrescribed: data });
        break;
      case "bodyMeasurements":
        setBodyMeasurementsState({ bodyMeasurements: data });
        break;
      case "notes":
        setNotesState({ notes: data });
        break;
    }
    setHasUnsavedChanges(true);
  }, []);

  // Update form data (backward compatible, for path-based updates)
  const updateFormData = useCallback((path: string[], value: any) => {
    if (path.length === 0) return;

    const [firstKey, ...restKeys] = path;

    // Determine which section this path belongs to
    if (BASE_INFO_FIELDS.includes(firstKey as any)) {
      // Base info field
      if (path.length === 1) {
        updateBaseInfo(firstKey, value);
      } else {
        // Nested path in base info (shouldn't happen, but handle it)
        setBaseInfoState((prev) => {
          const newData = { ...prev };
          let current: any = newData;
          for (let i = 0; i < restKeys.length; i++) {
            if (!current[firstKey]) {
              current[firstKey] = {};
            }
            current[firstKey] = { ...current[firstKey] };
            current = current[firstKey];
          }
          current[restKeys[restKeys.length - 1]] = value;
          return newData;
        });
        setHasUnsavedChanges(true);
      }
    } else if (FOOD_RECALL_FIELDS.includes(firstKey as any)) {
      // Food recall field
      if (path.length === 1) {
        updateFoodRecall({ [firstKey]: value });
      } else {
        // Nested path (e.g., breakfast.items)
        setFoodRecallState((prev) => {
          const newData = { ...prev };
          let current: any = (newData as any)[firstKey] || {};
          current = { ...current };
          let nested = current;
          for (let i = 0; i < restKeys.length - 1; i++) {
            nested[restKeys[i]] = { ...(nested[restKeys[i]] || {}) };
            nested = nested[restKeys[i]];
          }
          nested[restKeys[restKeys.length - 1]] = value;
          return { ...newData, [firstKey]: current };
        });
        setHasUnsavedChanges(true);
      }
    } else if (firstKey === "weekendDiet") {
      updateSectionData("weekendDiet", path.length === 1 ? value : { ...getSectionData("weekendDiet"), [restKeys.join(".")]: value });
    } else if (firstKey === "questionnaire") {
      updateSectionData("questionnaire", path.length === 1 ? value : { ...getSectionData("questionnaire"), [restKeys.join(".")]: value });
    } else if (firstKey === "foodFrequency") {
      if (path.length === 1) {
        // Direct field update (e.g., ["foodFrequency"] -> entire object)
        updateSectionData("foodFrequency", value);
      } else {
        // Nested path update (e.g., ["foodFrequency", "dairy", "curdButtermilk"])
        const currentFoodFrequency = getSectionData("foodFrequency") || {};
        const updatedFoodFrequency = { ...currentFoodFrequency };
        
        // Build nested structure
        let current: any = updatedFoodFrequency;
        for (let i = 0; i < restKeys.length - 1; i++) {
          const key = restKeys[i];
          if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
          }
          current[key] = { ...current[key] };
          current = current[key];
        }
        
        // Set the final value
        const finalKey = restKeys[restKeys.length - 1];
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Merge object values (e.g., { checked: true, frequency: "Daily" })
          current[finalKey] = { ...(current[finalKey] || {}), ...value };
        } else {
          // Set primitive values (e.g., curdButtermilk: "Daily")
          current[finalKey] = value;
        }
        
        updateSectionData("foodFrequency", updatedFoodFrequency);
      }
    } else if (firstKey === "healthProfile") {
      if (path.length === 1) {
        // Direct field update (e.g., ["healthProfile"] -> entire object)
        updateSectionData("healthProfile", value);
      } else {
        // Nested path update (e.g., ["healthProfile", "conditions", "High B.P"])
        const currentHealthProfile = getSectionData("healthProfile") || {};
        const updatedHealthProfile = { ...currentHealthProfile };
        
        // Build nested structure
        let current: any = updatedHealthProfile;
        for (let i = 0; i < restKeys.length - 1; i++) {
          const key = restKeys[i];
          if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
          }
          current[key] = { ...current[key] };
          current = current[key];
        }
        
        // Set the final value
        const finalKey = restKeys[restKeys.length - 1];
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Merge object values (e.g., condition object with hasCondition, notes)
          current[finalKey] = { ...(current[finalKey] || {}), ...value };
        } else {
          // Set primitive values (e.g., pregnancy: "Yes")
          current[finalKey] = value;
        }
        
        updateSectionData("healthProfile", updatedHealthProfile);
      }
    } else if (firstKey === "dietPrescribed") {
      updateSectionData("dietPrescribed", path.length === 1 ? value : { ...getSectionData("dietPrescribed"), [restKeys.join(".")]: value });
    } else if (firstKey === "bodyMeasurements") {
      updateSectionData("bodyMeasurements", path.length === 1 ? value : { ...getSectionData("bodyMeasurements"), [restKeys.join(".")]: value });
    } else if (firstKey === "notes") {
      updateNotes(value);
    } else {
      // Unknown path, try to update in baseInfo as fallback
      updateBaseInfo(firstKey, value);
    }
  }, [updateBaseInfo, updateFoodRecall, updateSectionData, getSectionData, updateNotes]);

  // Get form value by path (backward compatible)
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
      setBaseInfoState({});
      setFoodRecallState({});
      setWeekendDietState({});
      setQuestionnaireState({});
      setFoodFrequencyState({});
      setHealthProfileState({});
      setDietPrescribedState({});
      setBodyMeasurementsState({});
      setNotesState({});
      setHasUnsavedChanges(false);
      setLastSaved(null);
    } catch (error) {
      // Failed to clear localStorage, silently continue
    }
  }, [appointmentId, storageKey]);

  // Save before page unload - ensure save completes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && appointmentId) {
        // Save immediately without debounce - synchronous operation
        try {
          const fullData: DoctorNotesFormData = {
            ...stateRefs.current.baseInfo,
            ...stateRefs.current.foodRecall,
            ...stateRefs.current.weekendDiet,
            ...stateRefs.current.questionnaire,
            ...stateRefs.current.foodFrequency,
            ...stateRefs.current.healthProfile,
            ...stateRefs.current.dietPrescribed,
            ...stateRefs.current.bodyMeasurements,
            ...stateRefs.current.notes,
          };

          const now = new Date();
          const dataToStore = {
            ...fullData,
            _lastSaved: now.toISOString(),
            _version: "1.0",
          };
          
          // Synchronous save - must complete before page unloads
          localStorage.setItem(storageKey, JSON.stringify(dataToStore));
        } catch (error) {
          // If save fails, warn user (but don't block navigation)
          console.error("Failed to save before unload:", error);
        }
      }
    };

    // Use both beforeunload (for warning) and visibilitychange (for better reliability)
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Also save when page becomes hidden (better for mobile/SPA navigation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && hasUnsavedChanges && appointmentId) {
        saveToLocalStorage();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasUnsavedChanges, appointmentId, saveToLocalStorage, storageKey]);

  const value: DoctorNotesContextType = {
    formData, // Computed full formData for backward compatibility
    updateFormData,
    getFormValue,
    clearFormData,
    hasUnsavedChanges,
    lastSaved,
    isAutoSaving,
    getSectionData,
    updateSectionData,
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

// Section-specific hooks for optimized subscriptions
export function useBaseInfo() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useBaseInfo must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("baseInfo");
  const update = useCallback(
    (field: string, value: any) => {
      context.updateSectionData("baseInfo", { [field]: value });
    },
    [context]
  );

  return { data: sectionData, update };
}

export function useFoodRecall() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useFoodRecall must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("foodRecall");
  const update = useCallback(
    (data: Partial<DoctorNotesFormData>) => {
      context.updateSectionData("foodRecall", data);
    },
    [context]
  );

  return { data: sectionData, update };
}

export function useFoodFrequency() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useFoodFrequency must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("foodFrequency");
  const update = useCallback(
    (data: any) => {
      context.updateSectionData("foodFrequency", data);
    },
    [context]
  );

  return { data: sectionData, update };
}

export function useHealthProfile() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useHealthProfile must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("healthProfile");
  const update = useCallback(
    (data: any) => {
      context.updateSectionData("healthProfile", data);
    },
    [context]
  );

  return { data: sectionData, update };
}

export function useDietPrescribed() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useDietPrescribed must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("dietPrescribed");
  const update = useCallback(
    (data: any) => {
      context.updateSectionData("dietPrescribed", data);
    },
    [context]
  );

  return { data: sectionData, update };
}

export function useBodyMeasurements() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useBodyMeasurements must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("bodyMeasurements");
  const update = useCallback(
    (data: any) => {
      context.updateSectionData("bodyMeasurements", data);
    },
    [context]
  );

  return { data: sectionData, update };
}

export function useWeekendDiet() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useWeekendDiet must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("weekendDiet");
  const update = useCallback(
    (data: any) => {
      context.updateSectionData("weekendDiet", data);
    },
    [context]
  );

  return { data: sectionData, update };
}

export function useQuestionnaire() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useQuestionnaire must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("questionnaire");
  const update = useCallback(
    (data: any) => {
      context.updateSectionData("questionnaire", data);
    },
    [context]
  );

  return { data: sectionData, update };
}

export function useNotes() {
  const context = useContext(DoctorNotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a DoctorNotesProvider");
  }

  const sectionData = context.getSectionData("notes");
  const update = useCallback(
    (notes: string) => {
      context.updateSectionData("notes", notes);
    },
    [context]
  );

  return { data: sectionData, update };
}
