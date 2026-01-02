import api from "./api";

/**
 * TypeScript interfaces for Doctor Notes form data
 * Matching the Prisma schema structure
 */

export interface DoctorNotesFormData {
  // Section 1: Personal Info
  personalHistory?: string;
  reasonForJoiningProgram?: string;
  ethnicity?: string;
  joiningDate?: string;
  expiryDate?: string;
  dietPrescriptionDate?: string;
  durationOfDiet?: string;
  previousDietTaken?: "Yes" | "No";
  previousDietDetails?: string;
  typeOfDietTaken?: "By Google" | "By Experts";
  maritalStatus?: "Married" | "Unmarried";
  numberOfChildren?: number;
  dietPreference?: "Veg" | "Non-Veg" | "Egg & Veg";
  wakeupTime?: string;
  bedTime?: string;
  dayNap?: string;
  workoutTiming?: "Morning" | "Afternoon" | "Evening" | "Night";
  workoutType?: "Sport Type" | "Yoga" | "Gym" | "Homebase";

  // Section 2: 24-Hour Food Recall
  morningIntake?: {
    time?: string;
    waterIntake?: number;
    medicines?: string;
    tea?: { checked: boolean; type?: string };
    coffee?: { checked: boolean };
    lemonWater?: { checked: boolean };
    garlicHerbs?: { checked: boolean; types?: string };
    soakedDryFruits?: { checked: boolean; quantity?: string };
    biscuitToast?: { checked: boolean; quantity?: string };
    fruits?: string;
    fruitQuantity?: string;
  };
  breakfast?: {
    time?: string;
    items?: Array<{ name: string; quantity?: string; checked: boolean }>;
    roti?: { checked: boolean; ghee?: "With Ghee" | "Without Ghee" };
    other?: string;
  };
  midMorning?: {
    time?: string;
    items?: Array<{ name: string; quantity?: string; checked: boolean }>;
  };
  lunch?: {
    time?: string;
    rice?: { bowls?: string; type?: string };
    roti?: { count?: string };
    dal?: { bowls?: string; type?: string; otherType?: string };
    sambhar?: { bowls?: string; type?: string; otherType?: string };
    curdKadhi?: { bowls?: string };
    choleRajmaBeans?: { bowls?: string };
    chicken?: { quantity?: string; checked: boolean };
    fish?: { quantity?: string; checked: boolean };
    mutton?: { quantity?: string; checked: boolean };
    seafood?: { quantity?: string; checked: boolean };
    pulao?: { bowls?: string; checked: boolean };
    khichdi?: { bowls?: string; checked: boolean };
    biryani?: { bowls?: string; checked: boolean };
    salad?: { checked: boolean; type?: string; quantity?: string };
    chutney?: { checked: boolean; type?: string };
    pickle?: { checked: boolean };
    other?: string;
    otherQuantity?: string;
  };
  midDay?: {
    time?: string;
    sweets?: { bowls?: string; checked: boolean };
    dessert?: { bowls?: string; checked: boolean };
    laddu?: { bowls?: string; checked: boolean };
    fruits?: { bowls?: string; checked: boolean };
    other?: string;
    otherQuantity?: string;
  };
  eveningSnack?: {
    time?: string;
    items?: Array<{ name: string; quantity?: string; checked: boolean }>;
    other?: string;
    otherQuantity?: string;
  };
  dinner?: {
    time?: string;
    // Same structure as lunch + midDay
    [key: string]: any;
  };

  // Section 3: Weekend Diet
  weekendDiet?: {
    snacks?: string;
    starters?: string;
    mainCourse?: string;
    changesInDiet?: string;
    eatingOutFoodItems?: string;
    eatingOutFrequency?: string;
    orderedFromOutsideFoodItems?: string;
    snacksList?: string;
    starterList?: string;
    mainCourseList?: string;
    sweetItemList?: string;
    sleepingTime?: string;
    wakeupTime?: string;
    napTime?: string;
  };

  // Section 4: Questionnaire
  questionnaire?: {
    foodAllergies?: "Yes" | "No";
    foodIntolerance?: "Yes" | "No";
    intoleranceType?: string;
    eatingSpeed?: "Quick" | "Slow" | "Moderate";
    activityDuringMeal?: string;
    hungerPangs?: "Yes" | "No";
    hungerPangsTime?: "Morning" | "Afternoon" | "Evening" | "Night";
    emotionalEater?: "Yes" | "No";
    describeEmotionalEating?: string;
    mainMeal?: "Breakfast" | "Lunch" | "Dinner";
    snackFoodsPrefer?: string;
    craveSweets?: "Yes" | "No";
    sweetTypes?: string;
    specificLikes?: string;
    specificDislikes?: string;
    fastingInWeek?: "Yes" | "No";
    fastingReason?: "Religious Based" | "Personal Based";
  };

  // Section 5: Food Frequency
  foodFrequency?: {
    nonVeg?: Array<{
      name: string;
      checked: boolean;
      prepType?: string;
      qtyPieces?: string;
    }>;
    dairy?: {
      milk?: { glasses?: string; checked: boolean };
      curdButtermilk?: "Daily" | "Weekly" | "Monthly";
    };
    packaged?: Array<{
      name: string;
      checked: boolean;
      quantity?: string;
      frequency?: string;
    }>;
    sweeteners?: Array<{
      name: string;
      checked: boolean;
      qty?: string;
      frequency?: string;
    }>;
    drinks?: Array<{
      name: string;
      checked: boolean;
      qty?: string;
      frequency?: string;
    }>;
    lifestyle?: Array<{
      name: string;
      checked: boolean;
      qty?: string;
      frequency?: string;
    }>;
    water?: {
      checked: boolean;
      qty?: string;
      frequency?: string;
    };
    healthyFoods?: Array<{
      name: string;
      checked: boolean;
      qty?: string;
      frequency?: string;
    }>;
    eatingOut?: {
      checked: boolean;
      frequency?: string;
      foodItems?: string;
    };
    coconut?: {
      checked: boolean;
      frequency?: string;
    };
    pizzaBurger?: {
      checked: boolean;
      qty?: string;
      frequency?: string;
    };
    oilFat?: {
      typeOfOil?: string;
      oilPerMonth?: string;
      totalMembersInHouse?: string;
      reuseFriedOil?: "Yes" | "No";
    };
  };

  // Section 6: Health Profile
  healthProfile?: {
    physicalActivityLevel?: "Sedentary" | "Moderate" | "Heavy";
    sleepQuality?: "Normal" | "Inadequate" | "Disturbed" | "Insomnia";
    insomniaPillsDetails?: string;
    disturbanceDueToUrineBreak?: string;
    conditions?: Array<{
      name: string;
      hasCondition: "Yes" | "No";
      notes?: string;
    }>;
    medicationName?: string;
    medicationReason?: string;
    medicationTimingQuantity?: string;
    pregnancy?: "Yes" | "No";
    planningPregnancy?: "Yes" | "No";
    planningPregnancyWhen?: string;
    familyHistory?: {
      father?: string;
      mother?: string;
      siblings?: string;
    };
  };

  // Section 7: Diet Prescribed
  dietPrescribed?: {
    joiningDate?: string;
    expiryDate?: string;
    dietPrescriptionDate?: string;
    date?: string;
    durationOfDiet?: string;
    dietChart?: string;
    dietChartFile?: File | null; // Deprecated: use dietChartFiles instead
    dietChartFiles?: File[]; // Array of PDF files (max 10)
    code?: string;
  };

  // Section 8: Body Measurements
  bodyMeasurements?: {
    // Upper Body
    neck?: string;
    chest?: string;
    chestFemale?: string;
    normalChestLung?: string;
    expandedChestLungs?: string;
    arms?: string;
    forearms?: string;
    wrist?: string;
    // Lower Body
    abdomenUpper?: string;
    abdomenLower?: string;
    waist?: string;
    hip?: string;
    thighUpper?: string;
    thighLower?: string;
    calf?: string;
    ankle?: string;
  };

  // General notes
  notes?: string;
}

export interface SaveDoctorNotesRequest {
  appointmentId: string;
  formData: DoctorNotesFormData;
  isDraft?: boolean;
}

export interface SaveDoctorNotesResponse {
  success: boolean;
  message?: string;
  doctorNotes?: {
    id: string;
    appointmentId: string;
  };
}

export interface DoctorNoteAttachment {
  id: string;
  fileName: string;
  fileUrl: string | null;
  mimeType: string;
  sizeInBytes: number;
  fileCategory: string;
  section: string | null;
  createdAt: string;
}

export interface GetDoctorNotesResponse {
  success: boolean;
  doctorNotes?: {
    id: string;
    appointmentId: string;
    formData: any;
    notes?: string;
    isDraft: boolean;
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    attachments?: DoctorNoteAttachment[];
  };
}

/**
 * Save doctor notes to backend (full form submission)
 */
export async function saveDoctorNotes(
  data: SaveDoctorNotesRequest
): Promise<SaveDoctorNotesResponse> {
  console.log("[API] saveDoctorNotes - Starting full form submission");
  console.log("[API] saveDoctorNotes - Appointment ID:", data.appointmentId);
  console.log("[API] saveDoctorNotes - Is Draft:", data.isDraft);
  console.log(
    "[API] saveDoctorNotes - Form Data Keys:",
    Object.keys(data.formData)
  );
  console.log(
    "[API] saveDoctorNotes - Form Data Size:",
    JSON.stringify(data.formData).length,
    "bytes"
  );

  const startTime = Date.now();
  const formData = new FormData();
  formData.append("appointmentId", data.appointmentId);
  formData.append("formData", JSON.stringify(data.formData));
  formData.append("isDraft", String(data.isDraft ?? false));

  // Handle multiple file uploads if present
  const dietChartFiles = data.formData.dietPrescribed?.dietChartFiles;
  if (
    dietChartFiles &&
    Array.isArray(dietChartFiles) &&
    dietChartFiles.length > 0
  ) {
    console.log(
      "[API] saveDoctorNotes - Including diet chart files:",
      dietChartFiles.length,
      "file(s)"
    );
    dietChartFiles.forEach((file: File) => {
      console.log("[API] saveDoctorNotes - Diet chart file:", file);
    });
    dietChartFiles.forEach((file: File) => {
      formData.append("dietCharts", file);
    });
  }

  try {
    // When using FormData, axios automatically sets Content-Type with boundary
    // Don't manually set Content-Type header - axios handles it automatically
    const res = await api.post<SaveDoctorNotesResponse>(
      "admin/doctor-notes",
      formData
    );
    const duration = Date.now() - startTime;
    console.log(
      `[API] saveDoctorNotes - Success (${duration}ms) - Response:`,
      res.data
    );
    return res.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Log the raw error first
    console.error(`[API] saveDoctorNotes - Raw Error:`, error);
    console.error(`[API] saveDoctorNotes - Error Type:`, typeof error);
    console.error(
      `[API] saveDoctorNotes - Error Constructor:`,
      error?.constructor?.name
    );

    // Log full error details for debugging
    const errorDetails: any = {
      errorType: error?.constructor?.name || typeof error,
      errorMessage: error?.message || "Unknown error",
      errorStatus: error?.response?.status,
      errorStatusText: error?.response?.statusText,
    };

    // Add response data if available
    if (error?.response?.data) {
      errorDetails.errorResponse = error.response.data;
      // Extract errors array if present
      if (error.response.data.errors) {
        errorDetails.errors = error.response.data.errors;
      }
      // Extract message if present
      if (error.response.data.message) {
        errorDetails.errorMessage = error.response.data.message;
      }
      if (error.response.data.error) {
        errorDetails.errorMessage = error.response.data.error;
      }
    }

    // Add request config if available
    if (error?.config) {
      errorDetails.requestConfig = {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL,
      };
    }

    // Add request info if available (network errors)
    if (error?.request) {
      errorDetails.requestInfo = "Request made but no response received";
      errorDetails.isNetworkError = true;
    }

    // Add stack trace for debugging
    if (error?.stack) {
      errorDetails.stack = error.stack;
    }

    // Log error details
    console.error(
      `[API] saveDoctorNotes - Error (${duration}ms):`,
      JSON.stringify(errorDetails, null, 2)
    );

    // Also log the full error object
    console.error(`[API] saveDoctorNotes - Full Error Object:`, {
      error,
      response: error?.response,
      request: error?.request,
      config: error?.config,
    });

    throw error;
  }
}

/**
 * Update doctor notes partially (PATCH for fast editing)
 */
export async function updateDoctorNotes(
  appointmentId: string,
  partialData: Partial<DoctorNotesFormData>,
  isDraft: boolean = false
): Promise<SaveDoctorNotesResponse> {
  console.log("[API] updateDoctorNotes - Starting partial update");
  console.log("[API] updateDoctorNotes - Appointment ID:", appointmentId);
  console.log("[API] updateDoctorNotes - Is Draft:", isDraft);
  console.log(
    "[API] updateDoctorNotes - Changed Fields:",
    Object.keys(partialData)
  );
  console.log(
    "[API] updateDoctorNotes - Partial Data Size:",
    JSON.stringify(partialData).length,
    "bytes"
  );

  const startTime = Date.now();
  const formData = new FormData();
  formData.append("appointmentId", appointmentId);
  formData.append("formData", JSON.stringify(partialData));
  formData.append("isDraft", String(isDraft));

  // Handle multiple file uploads if present
  const dietChartFiles = partialData.dietPrescribed?.dietChartFiles;
  if (
    dietChartFiles &&
    Array.isArray(dietChartFiles) &&
    dietChartFiles.length > 0
  ) {
    console.log(
      "[API] updateDoctorNotes - Including diet chart files:",
      dietChartFiles.length,
      "file(s)"
    );
    dietChartFiles.forEach((file: File) => {
      formData.append("dietCharts", file);
    });
  }

  try {
    // When using FormData, axios automatically sets Content-Type with boundary
    // Don't manually set Content-Type header - axios handles it automatically
    const res = await api.patch<SaveDoctorNotesResponse>(
      `admin/doctor-notes/${appointmentId}`,
      formData
    );
    const duration = Date.now() - startTime;
    console.log(
      `[API] updateDoctorNotes - Success (${duration}ms) - Response:`,
      res.data
    );
    return res.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Log full error details for debugging
    const errorDetails: any = {
      errorType: error?.constructor?.name || typeof error,
      errorMessage: error?.message || "Unknown error",
      errorStatus: error?.response?.status,
      errorStatusText: error?.response?.statusText,
    };

    // Add response data if available
    if (error?.response?.data) {
      errorDetails.errorResponse = error.response.data;
      // Extract errors array if present
      if (error.response.data.errors) {
        errorDetails.errors = error.response.data.errors;
      }
    }

    // Add request config if available
    if (error?.config) {
      errorDetails.requestConfig = {
        url: error.config.url,
        method: error.config.method,
      };
    }

    // Add request info if available (network errors)
    if (error?.request) {
      errorDetails.requestInfo = "Request made but no response received";
    }

    // Add stack trace for debugging
    if (error?.stack) {
      errorDetails.stack = error.stack;
    }

    console.error(
      `[API] updateDoctorNotes - Error (${duration}ms):`,
      errorDetails
    );

    throw error;
  }
}

/**
 * Get existing doctor notes for an appointment
 */
export async function getDoctorNotes(
  appointmentId: string
): Promise<GetDoctorNotesResponse> {
  console.log(
    "[API] getDoctorNotes - Fetching notes for appointment:",
    appointmentId
  );
  const startTime = Date.now();
  try {
    const res = await api.get<GetDoctorNotesResponse>(
      `admin/doctor-notes/${appointmentId}`
    );
    const duration = Date.now() - startTime;
    console.log(
      `[API] getDoctorNotes - Success (${duration}ms) - Notes exist:`,
      !!res.data.doctorNotes
    );
    if (res.data.doctorNotes) {
      console.log(
        "[API] getDoctorNotes - Form Data Keys:",
        Object.keys(res.data.doctorNotes.formData || {})
      );
      console.log(
        "[API] getDoctorNotes - Attachments:",
        res.data.doctorNotes.attachments
      );
      console.log(
        "[API] getDoctorNotes - Attachments count:",
        res.data.doctorNotes.attachments?.length || 0
      );
      if (
        res.data.doctorNotes.attachments &&
        res.data.doctorNotes.attachments.length > 0
      ) {
        console.log(
          "[API] getDoctorNotes - First attachment:",
          JSON.stringify(res.data.doctorNotes.attachments[0], null, 2)
        );
      }
    }
    return res.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(
      `[API] getDoctorNotes - Error (${duration}ms):`,
      error?.response?.data || error?.message
    );
    throw error;
  }
}

/**
 * Delete a doctor note attachment (PDF)
 */
export async function deleteDoctorNoteAttachment(
  attachmentId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  console.log(
    "[API] deleteDoctorNoteAttachment - Deleting attachment:",
    attachmentId
  );
  const startTime = Date.now();
  try {
    const res = await api.delete<{
      success: boolean;
      message?: string;
      error?: string;
    }>(`admin/doctor-notes/attachment/${attachmentId}`);
    const duration = Date.now() - startTime;
    console.log(`[API] deleteDoctorNoteAttachment - Success (${duration}ms)`);
    return res.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(
      `[API] deleteDoctorNoteAttachment - Error (${duration}ms):`,
      error?.response?.data || error?.message
    );
    throw error;
  }
}
