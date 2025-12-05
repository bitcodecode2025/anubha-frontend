"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/* ---------------------------------------
   TYPES
----------------------------------------*/

// One recall entry in the recall form
export type RecallEntry = {
  id: string;
  mealType: string;
  foodItem: string;
  quantity: string;
  time: string;
  notes?: string;
};

// Entire booking form
export type BookingForm = {
  fullName: string | null;
  mobile: string | null;
  email: string | null;
  dob: string | null;
  age: number | null;
  gender: string | null;
  address: string | null;

  weight: string | null;
  height: string | null;
  neck: string | null;
  waist: string | null;
  hip: string | null;
  // Detailed measurements (for weight loss plan)
  chest: string | null;
  chestFemale: string | null;
  normalChestLung: string | null;
  expandedChestLungs: string | null;
  arms: string | null;
  forearms: string | null;
  wrist: string | null;
  abdomenUpper: string | null;
  abdomenLower: string | null;
  thighUpper: string | null;
  thighLower: string | null;
  calf: string | null;
  ankle: string | null;

  medicalHistory: string | null;
  appointmentConcerns: string | null;
  reports?: File[];

  bowel: string | null;
  dailyFood: string | null;
  waterIntake: string | null;
  wakeUpTime: string | null;
  sleepTime: string | null;
  sleepQuality: string | null;
  foodPreference: string | null;
  allergiesIntolerance: string | null;

  // Plan / service
  planSlug: string | null;
  planName: string | null;
  planPrice: string | null;
  planPriceRaw: number | null;
  planPackageName: string | null;
  planPackageDuration: string | null;

  // Appointment data
  appointmentMode?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;

  slotId: string | null;
  patientId: string | null;
  appointmentId: string | null; // Store appointment ID after creation

  // Recall form data
  recallEntries: RecallEntry[];
  recallNotes: string | null;
};

/* ---------------------------------------
   INITIAL FORM
----------------------------------------*/

const initialForm: BookingForm = {
  fullName: null,
  mobile: null,
  email: null,
  dob: null,
  age: null,
  gender: null,
  address: null,

  weight: null,
  height: null,
  neck: null,
  waist: null,
  hip: null,
  // Detailed measurements
  chest: null,
  chestFemale: null,
  normalChestLung: null,
  expandedChestLungs: null,
  arms: null,
  forearms: null,
  wrist: null,
  abdomenUpper: null,
  abdomenLower: null,
  thighUpper: null,
  thighLower: null,
  calf: null,
  ankle: null,

  medicalHistory: null,
  appointmentConcerns: null,
  reports: [],

  bowel: null,
  dailyFood: null,
  waterIntake: null,
  wakeUpTime: null,
  sleepTime: null,
  sleepQuality: null,
  foodPreference: null,
  allergiesIntolerance: null,

  planSlug: null,
  planName: null,
  planPrice: null,
  planPriceRaw: null,
  planPackageName: null,
  planPackageDuration: null,

  appointmentMode: null,
  appointmentDate: null,
  appointmentTime: null,

  slotId: null,
  patientId: null,
  appointmentId: null,

  // NEW recall fields
  recallEntries: [],
  recallNotes: null,
};

/* ---------------------------------------
   CONTEXT
----------------------------------------*/

type ContextType = {
  form: BookingForm;
  setForm: (data: Partial<BookingForm>) => void;
  resetForm: () => void;
};

const BookingFormContext = createContext<ContextType | undefined>(undefined);

/* ---------------------------------------
   PROVIDER
----------------------------------------*/

export function BookingFormProvider({ children }: { children: ReactNode }) {
  const [form, setFormState] = useState<BookingForm>(initialForm);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookingForm");
      if (saved) {
        const parsed = JSON.parse(saved);

        // merge saved data over initialForm
        setFormState({ ...initialForm, ...parsed });
      }
    } catch (err) {
      console.error("Form restore error:", err);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem("bookingForm", JSON.stringify(form));
    } catch (err) {
      console.error("Form save error:", err);
    }
  }, [form, loaded]);

  /* ---------------------------------------
     UPDATE FORM (SAFE MERGE)
  ----------------------------------------*/
  function setForm(data: Partial<BookingForm>) {
    setFormState((prev) => ({
      ...prev,
      ...data,
    }));
  }

  /* ---------------------------------------
     RESET FORM
  ----------------------------------------*/
  function resetForm() {
    setFormState(initialForm);
    localStorage.removeItem("bookingForm");
  }

  if (!loaded) return null; // Prevent hydration mismatch

  return (
    <BookingFormContext.Provider value={{ form, setForm, resetForm }}>
      {children}
    </BookingFormContext.Provider>
  );
}

/* ---------------------------------------
   HOOK
----------------------------------------*/
export function useBookingForm() {
  const ctx = useContext(BookingFormContext);
  if (!ctx) {
    throw new Error("useBookingForm must be used inside BookingFormProvider");
  }
  return ctx;
}
