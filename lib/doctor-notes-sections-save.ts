import api from "./api";
import type { DoctorNotesFormData } from "./doctor-notes-api";
import { getDoctorNotes, saveDoctorNotes } from "./doctor-notes-api";

/**
 * Deep equality check for two values (handles objects, arrays, primitives)
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, idx) => deepEqual(item, b[idx]));
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every((key) => deepEqual(a[key], b[key]));
  }
  
  return false;
}

/**
 * Get list of dirty (modified) section keys by comparing formData with originalFormData
 * Handles composite sections (baseInfo, foodRecall) correctly
 */
export function getDirtySections(
  formData: DoctorNotesFormData,
  originalFormData: DoctorNotesFormData
): DoctorNotesSectionKey[] {
  const dirtySections: DoctorNotesSectionKey[] = [];

  DOCTOR_NOTES_SECTION_SAVE_CONFIG.forEach((cfg) => {
    const sectionKey = cfg.sectionKey;
    let isDirty = false;

    // Special handling for composite sections
    if (sectionKey === "baseInfo") {
      // Compare all 18 Section 1 flat fields
      const baseInfoFields = [
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
      ];
      
      // Check if any field differs
      isDirty = baseInfoFields.some((field) => {
        const currentValue = (formData as any)[field];
        const originalValue = (originalFormData as any)[field];
        return !deepEqual(currentValue, originalValue);
      });
    } else if (sectionKey === "foodRecall") {
      // Compare all 7 Section 2 meal objects
      const mealKeys = [
        "morningIntake",
        "breakfast",
        "midMorning",
        "lunch",
        "midDay",
        "eveningSnack",
        "dinner",
      ];
      
      // Check if any meal differs
      isDirty = mealKeys.some((mealKey) => {
        const currentMeal = (formData as any)[mealKey];
        const originalMeal = (originalFormData as any)[mealKey];
        return !deepEqual(currentMeal, originalMeal);
      });
    } else {
      // Direct comparison for other sections (sectionKey maps directly to formData property)
      const currentValue = (formData as any)[sectionKey];
      const originalValue = (originalFormData as any)[sectionKey];
      isDirty = !deepEqual(currentValue, originalValue);
    }

    if (isDirty) {
      dirtySections.push(sectionKey);
    }
  });

  return dirtySections;
}

/**
 * Recursively remove File objects and File arrays from data to exclude attachments
 */
function excludeAttachments<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof File) {
    // Exclude File objects
    return undefined as any;
  }

  if (Array.isArray(data)) {
    // Filter out File objects and recursively clean array items
    const cleaned = data
      .map((item) => excludeAttachments(item))
      .filter((item) => item !== undefined);
    return cleaned as any;
  }

  if (typeof data === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip known attachment fields
      if (
        key === "dietChartFiles" ||
        key === "dietChartFile" ||
        key === "preConsultationImages" ||
        key === "postConsultationImages" ||
        key === "medicalReports" ||
        key === "prePostConsultationImages"
      ) {
        continue;
      }
      const cleanedValue = excludeAttachments(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned as T;
  }

  return data;
}

/**
 * Valid section keys that can be saved individually.
 * These correspond to top-level keys in DoctorNotesFormData or individual flat fields.
 */
export type DoctorNotesSectionKey =
  // Section 1: Base Info (composite key for atomic save)
  | "baseInfo"
  // Section 1: Base Info (individual fields - backward compatibility)
  | "personalHistory"
  | "reasonForJoiningProgram"
  | "ethnicity"
  | "joiningDate"
  | "expiryDate"
  | "dietPrescriptionDate"
  | "durationOfDiet"
  | "previousDietTaken"
  | "previousDietDetails"
  | "typeOfDietTaken"
  | "maritalStatus"
  | "numberOfChildren"
  | "dietPreference"
  | "wakeupTime"
  | "bedTime"
  | "dayNap"
  | "workoutTiming"
  | "workoutType"
  // Section 2: Food Recall (composite key for atomic save)
  | "foodRecall"
  // Section 2: Food Recall (individual meals - backward compatibility)
  | "morningIntake"
  | "breakfast"
  | "midMorning"
  | "lunch"
  | "midDay"
  | "eveningSnack"
  | "dinner"
  // Section 3: Weekend Diet
  | "weekendDiet"
  // Section 4: Questionnaire
  | "questionnaire"
  // Section 5: Food Frequency
  | "foodFrequency"
  // Section 6: Health Profile
  | "healthProfile"
  // Section 7: Diet Prescribed
  | "dietPrescribed"
  // Section 8: Body Measurements
  | "bodyMeasurements"
  // Section 10: Notes
  | "notes";

export interface DoctorNotesSectionSaveConfig<TSelected> {
  /**
   * A stable key used for tracking save status per section.
   * This must match a valid sectionKey that the backend accepts.
   */
  sectionKey: DoctorNotesSectionKey;
  /**
   * Select the section data from the full form state.
   * Should return only the data for this section (not wrapped in formData).
   */
  selectData: (formState: DoctorNotesFormData) => TSelected;
}

/**
 * Section save configuration for all sections.
 * Each section sends only its own data with sectionKey in header.
 */
export const DOCTOR_NOTES_SECTION_SAVE_CONFIG: Array<
  DoctorNotesSectionSaveConfig<any>
> = [
  // Section 1: Base Info (flat fields) - Save atomically as "baseInfo"
  {
    sectionKey: "baseInfo",
    selectData: (formState) => {
      // Extract all 18 Section 1 fields into a single object
      const baseInfo = {
        personalHistory: formState.personalHistory,
        reasonForJoiningProgram: formState.reasonForJoiningProgram,
        ethnicity: formState.ethnicity,
        joiningDate: formState.joiningDate,
        expiryDate: formState.expiryDate,
        dietPrescriptionDate: formState.dietPrescriptionDate,
        durationOfDiet: formState.durationOfDiet,
        previousDietTaken: formState.previousDietTaken,
        previousDietDetails: formState.previousDietDetails,
        typeOfDietTaken: formState.typeOfDietTaken,
        maritalStatus: formState.maritalStatus,
        numberOfChildren: formState.numberOfChildren ?? undefined,
        dietPreference: formState.dietPreference,
        wakeupTime: formState.wakeupTime,
        bedTime: formState.bedTime,
        dayNap: formState.dayNap,
        workoutTiming: formState.workoutTiming,
        workoutType: formState.workoutType,
      };
      
      // Log payload structure for verification
      console.log("[DOCTOR_NOTES] baseInfo payload structure:", {
        sectionKey: "baseInfo",
        fieldCount: Object.keys(baseInfo).length,
        fields: Object.keys(baseInfo),
        hasValues: Object.values(baseInfo).some(v => v !== undefined && v !== null),
      });
      
      return baseInfo;
    },
  },
  // Section 2: Food Recall - Save atomically as "foodRecall"
  {
    sectionKey: "foodRecall",
    selectData: (formState) => {
      // Extract all 7 meals into a single object
      const foodRecall = {
        morningIntake: excludeAttachments(formState.morningIntake ?? {}),
        breakfast: excludeAttachments(formState.breakfast ?? {}),
        midMorning: excludeAttachments(formState.midMorning ?? {}),
        lunch: excludeAttachments(formState.lunch ?? {}),
        midDay: excludeAttachments(formState.midDay ?? {}),
        eveningSnack: excludeAttachments(formState.eveningSnack ?? {}),
        dinner: excludeAttachments(formState.dinner ?? {}),
      };
      
      // Log payload structure for verification
      console.log("[DOCTOR_NOTES] foodRecall payload structure:", {
        sectionKey: "foodRecall",
        mealCount: Object.keys(foodRecall).length,
        meals: Object.keys(foodRecall),
        hasValues: Object.values(foodRecall).some(v => 
          v !== undefined && v !== null && Object.keys(v).length > 0
        ),
      });
      
      return foodRecall;
    },
  },
  // Section 3: Weekend Diet
  {
    sectionKey: "weekendDiet",
    selectData: (formState) => excludeAttachments(formState.weekendDiet ?? {}),
  },
  // Section 4: Questionnaire
  {
    sectionKey: "questionnaire",
    selectData: (formState) => excludeAttachments(formState.questionnaire ?? {}),
  },
  // Section 5: Food Frequency
  {
    sectionKey: "foodFrequency",
    selectData: (formState) => excludeAttachments(formState.foodFrequency ?? {}),
  },
  // Section 6: Health Profile
  {
    sectionKey: "healthProfile",
    selectData: (formState) => excludeAttachments(formState.healthProfile ?? {}),
  },
  // Section 7: Diet Prescribed
  {
    sectionKey: "dietPrescribed",
    selectData: (formState) => excludeAttachments(formState.dietPrescribed ?? {}),
  },
  // Section 8: Body Measurements
  {
    sectionKey: "bodyMeasurements",
    selectData: (formState) => excludeAttachments(formState.bodyMeasurements ?? {}),
  },
  // Section 10: Notes
  {
    sectionKey: "notes",
    selectData: (formState) => formState.notes ?? "",
  },
];

export interface SaveAllSectionsParams {
  appointmentId: string;
  formState: DoctorNotesFormData;
  originalFormData?: DoctorNotesFormData; // Optional: if provided, only dirty sections will be saved
  isDraft?: boolean;
}

export type SaveSectionResult =
  | {
      sectionKey: DoctorNotesSectionKey;
      status: "fulfilled";
      response: any;
    }
  | {
      sectionKey: DoctorNotesSectionKey;
      status: "rejected";
      error: unknown;
    };

/**
 * Save all configured sections in parallel using section-aware saving.
 *
 * - Each section sends ONLY its own data (not full formData)
 * - Includes sectionKey in X-Section-Key header
 * - Uses PATCH /admin/doctor-notes/:appointmentId (existing endpoint)
 * - Backend updates only that section in JSON using jsonb_set
 * - Uses Promise.allSettled for resilience
 * - Returns per-section status (fulfilled/rejected)
 *
 * Bootstrap: Automatically creates Doctor Notes record if it doesn't exist
 * before sending PATCH requests. This ensures PATCH requests always succeed.
 */
export async function saveAllSections(
  params: SaveAllSectionsParams
): Promise<Record<DoctorNotesSectionKey, SaveSectionResult>> {
  const { appointmentId, formState, originalFormData, isDraft = false } = params;

  // Bootstrap: Check if Doctor Notes record exists, create if missing
  // This ensures PATCH requests always have a record to update
  let recordExists = false;
  try {
    const existingNotes = await getDoctorNotes(appointmentId);
    if (existingNotes.success && existingNotes.doctorNotes) {
      recordExists = true;
    }
  } catch (error: any) {
    // Record doesn't exist (404 or other error)
    recordExists = false;
  }

  // If record doesn't exist, create it first with POST (no sectionKey)
  if (!recordExists) {
    try {
      await saveDoctorNotes({
        appointmentId,
        formData: {}, // Empty formData for bootstrap
        isDraft: true, // Create as draft
      });
      // Successfully created, now proceed with PATCH requests
    } catch (createError: any) {
      // If creation fails, return error for all sections
      const errorResult: Record<DoctorNotesSectionKey, SaveSectionResult> = {} as any;
      DOCTOR_NOTES_SECTION_SAVE_CONFIG.forEach((cfg) => {
        errorResult[cfg.sectionKey] = {
          sectionKey: cfg.sectionKey,
          status: "rejected",
          error: createError,
        };
      });
      return errorResult;
    }
  }

  const endpoint = `admin/doctor-notes/${appointmentId}`;

  // Determine which sections are dirty (if originalFormData provided)
  let sectionsToSave = DOCTOR_NOTES_SECTION_SAVE_CONFIG;
  if (originalFormData) {
    const dirtySections = getDirtySections(formState, originalFormData);
    // Filter to only dirty sections
    sectionsToSave = DOCTOR_NOTES_SECTION_SAVE_CONFIG.filter((cfg) =>
      dirtySections.includes(cfg.sectionKey)
    );
    
    // If no sections are dirty, return early with all sections marked as fulfilled
    if (sectionsToSave.length === 0) {
      const result: Record<DoctorNotesSectionKey, SaveSectionResult> = {} as any;
      DOCTOR_NOTES_SECTION_SAVE_CONFIG.forEach((cfg) => {
        result[cfg.sectionKey] = {
          sectionKey: cfg.sectionKey,
          status: "fulfilled",
          response: { success: true, message: "No changes detected" },
        };
      });
      return result;
    }
  }

  // Create parallel save jobs for dirty sections only
  const jobs = sectionsToSave.map(async (cfg) => {
    // Extract only this section's data (not full formData)
    const sectionData = cfg.selectData(formState);

    // Build payload with only this section's data
    // Format: { formData: { [sectionKey]: sectionData } }
    const payload = {
      formData: {
        [cfg.sectionKey]: sectionData,
      },
      isDraft,
    };

    // Send PATCH request with sectionKey in header
    // Note: If this throws, Promise.allSettled will catch it in the reason
    const res = await api.patch(endpoint, payload, {
      headers: {
        "X-Section-Key": cfg.sectionKey,
      },
    });

    return {
      sectionKey: cfg.sectionKey,
      response: res.data,
    };
  });

  // Wait for all dirty sections to complete (fulfilled or rejected)
  const settled = await Promise.allSettled(jobs);

  // Process results
  const result: Partial<Record<DoctorNotesSectionKey, SaveSectionResult>> = {};

  // Mark all sections (including clean ones) in result
  DOCTOR_NOTES_SECTION_SAVE_CONFIG.forEach((cfg) => {
    const sectionKey = cfg.sectionKey;
    // Check if this section was saved (in sectionsToSave)
    const wasSaved = sectionsToSave.some((s) => s.sectionKey === sectionKey);
    
    if (!wasSaved && originalFormData) {
      // Section was clean, mark as fulfilled (no changes)
      result[sectionKey] = {
        sectionKey,
        status: "fulfilled",
        response: { success: true, message: "No changes detected" },
      };
    }
  });

  // Process settled results for sections that were actually saved
  settled.forEach((item, idx) => {
    const cfg = sectionsToSave[idx];
    const sectionKey = cfg.sectionKey;

    if (item.status === "fulfilled") {
      // Success: extract response from fulfilled promise
      result[sectionKey] = {
        sectionKey,
        status: "fulfilled",
        response: item.value.response,
      };
    } else {
      // Failure: extract error from rejected promise
      result[sectionKey] = {
        sectionKey,
        status: "rejected",
        error: item.reason, // item.reason contains the error from the rejected promise
      };
    }
  });

  return result as Record<DoctorNotesSectionKey, SaveSectionResult>;
}
