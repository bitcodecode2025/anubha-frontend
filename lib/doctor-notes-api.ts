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
    dietChartFile?: File | null;
    code?: string;
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
  };
}

/**
 * Save doctor notes to backend
 */
export async function saveDoctorNotes(
  data: SaveDoctorNotesRequest
): Promise<SaveDoctorNotesResponse> {
  const formData = new FormData();
  formData.append("appointmentId", data.appointmentId);
  formData.append("formData", JSON.stringify(data.formData));
  formData.append("isDraft", String(data.isDraft ?? false));

  // Handle file upload if present
  if (data.formData.dietPrescribed?.dietChartFile) {
    formData.append("dietChart", data.formData.dietPrescribed.dietChartFile);
  }

  const res = await api.post<SaveDoctorNotesResponse>(
    "admin/doctor-notes",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

/**
 * Get existing doctor notes for an appointment
 */
export async function getDoctorNotes(
  appointmentId: string
): Promise<GetDoctorNotesResponse> {
  const res = await api.get<GetDoctorNotesResponse>(
    `admin/doctor-notes/${appointmentId}`
  );
  return res.data;
}
