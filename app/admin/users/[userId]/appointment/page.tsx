"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  UserPlus,
  Check,
  ChevronDown,
  Video,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getUserById,
  AdminUser,
  getUserPatients,
  AdminPatient,
  createPatientForUser,
} from "@/lib/admin-users";
import { createAppointmentByAdmin } from "@/lib/admin-appointments";
import { getAvailableSlots, Slot } from "@/lib/slots";
import { plans } from "@/lib/constants/plan";

// Simplified Patient Creation Form Component for Admin
function PatientCreationForm({
  userData,
  onPatientCreated,
  onCancel,
  creating,
}: {
  userData: AdminUser;
  onPatientCreated: (data: any) => Promise<void>;
  onCancel: () => void;
  creating: boolean;
}) {
  // Normalize initial phone to last 10 digits (strip country code like 91)
  const initialPhoneDigits =
    (userData.phone && userData.phone.replace(/\D/g, "").slice(-10)) || "";

  const [formData, setFormData] = useState({
    name: "",
    // Store only 10-digit local number in state; UI shows +91 prefix separately
    phone: initialPhoneDigits,
    email: userData.email || "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    dateOfBirth: "",
    age: "",
    address: "",
    weight: "",
    height: "",
    medicalHistory: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  };

  const handleDateChange = (value: string) => {
    handleChange("dateOfBirth", value);
    const age = calculateAge(value);
    if (age) handleChange("age", age);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      toast.error("Phone must be exactly 10 digits");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error("Date of birth is required");
      return;
    }
    if (!formData.age || Number(formData.age) < 0) {
      toast.error("Valid age is required");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!formData.weight || Number(formData.weight) <= 0) {
      toast.error("Valid weight is required");
      return;
    }
    if (!formData.height || Number(formData.height) <= 0) {
      toast.error("Valid height is required");
      return;
    }

    // Create patient data with only required fields
    // Note: Setting default values for required fields that aren't in the simplified form
    // Phone is always stored as country code + 10 digits (e.g. 91XXXXXXXXXX)
    const patientData = {
      name: formData.name.trim(),
      phone: `91${phoneDigits}`,
      email: formData.email.trim(),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      age: Number(formData.age),
      address: formData.address.trim(),
      weight: Number(formData.weight),
      height: Number(formData.height),
      medicalHistory: formData.medicalHistory.trim() || undefined,
      // Required fields with default values
      bowelMovement: "NORMAL" as const,
      foodPreference: "VEG" as const,
      dailyWaterIntake: 8,
      wakeUpTime: "07:00",
      sleepTime: "22:00",
      sleepQuality: "NORMAL" as const,
      fileIds: [], // No file uploads for admin-created patients
    };

    await onPatientCreated(patientData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 border border-emerald-200 rounded-lg bg-slate-50 text-slate-700 text-sm">
              +91
            </span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                // Allow only digits and enforce max 10 digits
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleChange("phone", digits);
              }}
              required
              maxLength={10}
              inputMode="numeric"
              pattern="\d{10}"
              placeholder="10-digit mobile number"
              className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) =>
              handleChange(
                "gender",
                e.target.value as "MALE" | "FEMALE" | "OTHER"
              )
            }
            required
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleDateChange(e.target.value)}
            required
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Age <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.age}
            readOnly
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg bg-slate-50"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
            required
            min="0"
            step="0.1"
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Height (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleChange("height", e.target.value)}
            required
            min="0"
            step="0.1"
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Medical History
          </label>
          <textarea
            value={formData.medicalHistory}
            onChange={(e) => handleChange("medicalHistory", e.target.value)}
            rows={4}
            placeholder="Enter medical history (optional)"
            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={creating}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Save Patient</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// This is a simplified version of admin appointment creation
// It handles the core flow: patient selection -> plan -> slot -> payment
// Admin-created appointments skip recall, file uploads, and user details form

export default function AdminAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<AdminUser | null>(null);
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);

  // Form state
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string>("");
  const [isCustomSlot, setIsCustomSlot] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customMode, setCustomMode] = useState<"IN_PERSON" | "ONLINE">(
    "IN_PERSON"
  );
  const [slotMode, setSlotMode] = useState<"In-person" | "Online">("In-person");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointmentMode, setAppointmentMode] = useState<
    "IN_PERSON" | "ONLINE"
  >("IN_PERSON");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "OFFLINE" | "PAID">(
    "CASH"
  );

  // Slots and plans
  const [slots, setSlots] = useState<Slot[]>([]);
  const [plansList, setPlansList] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Route protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.role !== "ADMIN") {
        router.replace("/");
        return;
      }
    }
  }, [user, authLoading, router]);

  // Fetch user data and patients
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const [userDataResult, patientsData] = await Promise.all([
          getUserById(userId),
          getUserPatients(userId),
        ]);

        setUserData(userDataResult);
        setPatients(patientsData);

        // If user has patients, select the first one by default
        if (patientsData.length > 0) {
          setSelectedPatientId(patientsData[0].id);
          setShowPatientForm(false); // Don't show form if patients exist
        } else {
          // If no patients, don't auto-show form - wait for "Add Patient" button click
          setShowPatientForm(false);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load data");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [userId, user, router]);

  // Fetch plans from constants
  useEffect(() => {
    // Start with General Consultation
    const planList: any[] = [
      {
        id: "general-consultation",
        slug: "general-consultation",
        name: "General Consultation",
        price: 1000,
        duration: "40 min",
        packageName: null as string | null,
      },
    ];

    // Add plans from constants
    if (plans && plans.length > 0) {
      // Convert plan constants to appointment format
      const plansFromConstants = plans.flatMap((plan) => {
        if (plan.packages && plan.packages.length > 0) {
          return plan.packages.map((pkg) => ({
            id: `${plan.slug}-${pkg.name}`,
            slug: plan.slug,
            name: `${plan.title} - ${pkg.name}`,
            price: parseInt(pkg.price.replace(/[₹,]/g, ""), 10),
            duration: pkg.duration || "40 min",
            packageName: pkg.name,
          }));
        } else {
          // Plans without packages
          return [
            {
              id: plan.slug,
              slug: plan.slug,
              name: plan.title,
              price: 1000, // Default for plans without price
              duration: "40 min",
              packageName: null as string | null,
            },
          ];
        }
      });

      planList.push(...plansFromConstants);
    }

    setPlansList(planList);
    if (planList.length > 0) {
      setSelectedPlan(planList[0]);
    }
  }, []);

  // Calendar helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);

  const isPast = (date: Date) => date < today;
  const isSunday = (date: Date) => date.getDay() === 0;

  // Calendar month calculations
  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDay = new Date(y, m, 1).getDay();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  function selectDate(day: number) {
    const d = new Date(y, m, day);
    d.setHours(0, 0, 0, 0);

    if (isPast(d) || isSunday(d)) return;

    setSelectedDate(d);
    setSelectedSlot(null);
    setSelectedSlotLabel("");
  }

  function changeMonth(dir: "next" | "prev") {
    const next = dir === "next" ? new Date(y, m + 1, 1) : new Date(y, m - 1, 1);
    if (next < minMonth || next > maxMonth) return;

    setCurrentMonth(next);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedSlotLabel("");
  }

  // Fetch slots for selected date
  useEffect(() => {
    if (!selectedDate || isCustomSlot) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const backendMode = slotMode === "In-person" ? "IN_PERSON" : "ONLINE";
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        const fetchedSlots = await getAvailableSlots(dateStr, backendMode);
        setSlots(fetchedSlots);
      } catch (error: any) {
        toast.error("Failed to load slots");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, slotMode, isCustomSlot]);

  // Reset selected time when mode changes
  useEffect(() => {
    setSelectedSlot(null);
    setSelectedSlotLabel("");
    setSlots([]);
  }, [slotMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-plan-dropdown]")) {
        setPlanDropdownOpen(false);
      }
    };

    if (planDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [planDropdownOpen]);

  // Handle patient creation (simplified for admin)
  const handleCreatePatient = async (patientData: any) => {
    setCreatingPatient(true);
    try {
      const response = await createPatientForUser(userId, patientData);
      if (response.success && response.patient?.id) {
        // Refresh patients list
        const updatedPatients = await getUserPatients(userId);
        setPatients(updatedPatients);
        setSelectedPatientId(response.patient.id);
        setShowPatientForm(false);
        toast.success("Patient created successfully!");
      } else {
        throw new Error(response.message || "Failed to create patient");
      }
    } catch (error: any) {
      // Check for validation errors array first
      const errorData = error?.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        // Display the first specific validation error message
        const firstError = errorData.errors[0];
        toast.error(firstError.message || "Validation failed");
      } else {
        // Fallback to generic error message
        toast.error(errorData?.message || "Failed to create patient");
      }
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    if (!userData) {
      toast.error("User data not loaded");
      return;
    }

    // Validate patient selection
    if (!selectedPatientId) {
      toast.error("Please select or create a patient");
      return;
    }

    // Validate slot selection
    let slotId: string | undefined;
    let startAt: string | undefined;
    let endAt: string | undefined;
    let finalAppointmentMode = appointmentMode;

    if (isCustomSlot) {
      // Validate custom slot
      if (!customDate || !customTime) {
        toast.error("Please provide both date and time for custom slot");
        return;
      }

      // Parse custom date and time
      const [hours, minutes] = customTime.split(":").map(Number);
      const slotDate = new Date(customDate);
      slotDate.setHours(hours, minutes, 0, 0);

      // Validate date is in the future
      const now = new Date();
      if (slotDate <= now) {
        toast.error("Appointment time must be in the future");
        return;
      }

      // Calculate end time (use plan duration or default 40 min)
      const durationMinutes =
        selectedPlan.duration === "40 min"
          ? 40
          : parseInt(selectedPlan.duration) || 40;
      const endTime = new Date(slotDate);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      startAt = slotDate.toISOString();
      endAt = endTime.toISOString();
      finalAppointmentMode = customMode;
    } else {
      // Use selected slot
      if (!selectedSlot) {
        toast.error("Please select a slot");
        return;
      }
      slotId = selectedSlot.id;
      // Use slot's startAt and endAt directly (they're ISO strings)
      startAt = selectedSlot.startAt;
      endAt = selectedSlot.endAt;
      finalAppointmentMode = selectedSlot.mode as "IN_PERSON" | "ONLINE";
    }

    setSubmitting(true);
    try {
      await createAppointmentByAdmin({
        userId: userData.id,
        patientId: selectedPatientId,
        slotId,
        planSlug: selectedPlan.slug,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price,
        planDuration: selectedPlan.duration || "40 min",
        planPackageName: selectedPlan.packageName,
        appointmentMode: finalAppointmentMode,
        startAt,
        endAt,
        paymentMode: "PAID", // Admin-created appointments are always PAID
      });

      toast.success("Appointment created successfully!");
      router.push("/admin/appointments");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create appointment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN" || !userData) {
    return null;
  }

  return (
    <main className="min-h-[70vh] px-6 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/users")}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Users</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Create Appointment
          </h1>
          <p className="text-slate-600">
            Create an appointment for {userData.name}
          </p>
        </div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            User Information
          </h3>
          <div className="space-y-2">
            <p className="text-slate-700">
              <strong>Name:</strong> {userData.name}
            </p>
            {userData.phone && (
              <p className="text-slate-700">
                <strong>Phone:</strong> {userData.phone}
              </p>
            )}
            {userData.email && (
              <p className="text-slate-700">
                <strong>Email:</strong> {userData.email}
              </p>
            )}
          </div>

          {/* Add Patient Button */}
          <div className="mt-6 pt-6 border-t border-emerald-200">
            <button
              type="button"
              onClick={() => {
                // Check if user has patients
                if (patients.length > 0) {
                  // If patients exist, show the patient selection section (toggle)
                  setShowPatientForm(false);
                } else {
                  // If no patients, show form directly
                  setShowPatientForm(true);
                }
              }}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Patient</span>
            </button>
          </div>
        </motion.div>

        {/* Patient Selection/Creation */}
        {showPatientForm ? (
          /* Show Patient Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Patient Details
              </h3>
              {patients.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPatientForm(false);
                    if (patients.length > 0) {
                      setSelectedPatientId(patients[0].id);
                    }
                  }}
                  className="text-sm text-slate-600 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
            {userData ? (
              <PatientCreationForm
                userData={userData}
                onPatientCreated={handleCreatePatient}
                onCancel={() => {
                  setShowPatientForm(false);
                  if (patients.length > 0) {
                    setSelectedPatientId(patients[0].id);
                  }
                }}
                creating={creatingPatient}
              />
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              </div>
            )}
          </motion.div>
        ) : patients.length > 0 ? (
          /* Show Patient List */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Select Patient
              </h3>
              <button
                type="button"
                onClick={() => setShowPatientForm(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New Patient</span>
              </button>
            </div>
            <div className="space-y-2">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedPatientId === patient.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{patient.name}</p>
                      <p className="text-sm text-slate-600">
                        {patient.phone} • {patient.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        {patient.gender} • Age: {patient.age}
                      </p>
                    </div>
                    {selectedPatientId === patient.id && (
                      <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}

        {/* Plan Selection - Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-6 mb-6 relative"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Select Plan</h3>
          <div className="relative" data-plan-dropdown>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPlanDropdownOpen(!planDropdownOpen);
              }}
              className="w-full text-left p-4 rounded-lg border-2 border-emerald-200 hover:border-emerald-300 transition-all flex items-center justify-between bg-white"
            >
              <div>
                {selectedPlan ? (
                  <>
                    <p className="font-bold text-slate-900">
                      {selectedPlan.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      ₹{selectedPlan.price}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500">Select a plan</p>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  planDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {planDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-emerald-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {plansList.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setPlanDropdownOpen(false);
                    }}
                    className={`w-full text-left p-4 hover:bg-emerald-50 transition-colors ${
                      selectedPlan?.id === plan.id ? "bg-emerald-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{plan.name}</p>
                        <p className="text-sm text-slate-600">₹{plan.price}</p>
                      </div>
                      {selectedPlan?.id === plan.id && (
                        <Check className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Slot Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-6 mb-6"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">Select Slot</h3>
          </div>

          {/* Mode Selector - Same as user booking */}
          <div className="flex rounded-xl overflow-hidden border mb-6">
            <button
              type="button"
              onClick={() => setSlotMode("In-person")}
              className={`flex-1 py-3 text-sm ${
                slotMode === "In-person"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <MapPin size={16} /> Clinic Visit
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSlotMode("Online")}
              className={`flex-1 py-3 text-sm ${
                slotMode === "Online"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Video size={16} /> Virtual Call
              </div>
            </button>
          </div>

          {/* Custom Slot Toggle */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setIsCustomSlot(!isCustomSlot);
                setSelectedSlot(null);
                setSelectedSlotLabel("");
                setSelectedDate(null);
              }}
              className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                isCustomSlot
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-emerald-300"
              }`}
            >
              <Plus className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-slate-900">
                Create Custom Slot
              </span>
              {isCustomSlot && (
                <Check className="w-5 h-5 text-emerald-600 ml-auto" />
              )}
            </button>
          </div>

          {isCustomSlot ? (
            /* Custom Slot Form */
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border-2 border-emerald-200">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Appointment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomMode("IN_PERSON")}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      customMode === "IN_PERSON"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-slate-600" />
                    <span className="font-semibold text-slate-900">
                      In-Person
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomMode("ONLINE")}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      customMode === "ONLINE"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    <Video className="w-5 h-5 text-slate-600" />
                    <span className="font-semibold text-slate-900">Online</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          ) : (
            /* User Booking Style Slot Selection */
            <>
              {/* Calendar */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <button
                    type="button"
                    disabled={currentMonth <= minMonth}
                    onClick={() => changeMonth("prev")}
                    className={currentMonth <= minMonth ? "opacity-30" : ""}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <h3 className="font-semibold">
                    {monthName} {y}
                  </h3>

                  <button
                    type="button"
                    disabled={currentMonth >= maxMonth}
                    onClick={() => changeMonth("next")}
                    className={currentMonth >= maxMonth ? "opacity-30" : ""}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div key={d}>{d}</div>
                    )
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-7 gap-2">
                  {Array(startDay === 0 ? 6 : startDay - 1)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}></div>
                    ))}

                  {Array.from({ length: daysInMonth }, (_, n) => n + 1).map(
                    (day) => {
                      const date = new Date(y, m, day);
                      date.setHours(0, 0, 0, 0);

                      const disabled = isPast(date) || isSunday(date);
                      const selected =
                        selectedDate?.toDateString() === date.toDateString();

                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={disabled}
                          onClick={() => selectDate(day)}
                          className={`py-2 rounded-lg text-sm border transition ${
                            disabled
                              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                              : selected
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white border-slate-300 hover:bg-emerald-50"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Time Slots */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                  <Clock size={18} /> Available Slots
                </h3>

                {!selectedDate ? (
                  <p className="text-slate-500 text-sm">Select a date first.</p>
                ) : loadingSlots ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-full px-4 py-4 rounded-lg border border-slate-300 bg-white animate-pulse"
                      >
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                          <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No available slots for this date. Please select another
                    date.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlot(slot);
                            setSelectedSlotLabel(slot.label);
                          }}
                          className={`w-full px-4 py-4 rounded-lg border text-sm flex justify-between transition ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-emerald-50"
                          }`}
                        >
                          {slot.label}
                          {!isSelected && (
                            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Payment Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-emerald-200/50 p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Payment Mode
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {(["CASH", "OFFLINE", "PAID"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMode === mode
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                <p className="font-semibold text-slate-900">{mode}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/admin/users")}
            className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !selectedPlan ||
              (!selectedSlot && !isCustomSlot) ||
              (isCustomSlot && (!customDate || !customTime))
            }
            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                <span>Create Appointment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
