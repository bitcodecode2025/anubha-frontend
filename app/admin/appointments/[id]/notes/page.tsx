"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getAppointmentDetails } from "@/lib/appointments-admin";
import { Loader2, ChevronLeft } from "lucide-react";
import DoctorNotesForm from "@/components/DoctorNotesForm";

export default function DoctorNotesPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const appointmentId = params.id as string;

  const [patientName, setPatientName] = useState<string>("");
  const [planName, setPlanName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "ADMIN" && appointmentId) {
      loadAppointmentData();
    }
  }, [appointmentId, user]);

  async function loadAppointmentData() {
    setLoading(true);
    try {
      const response = await getAppointmentDetails(appointmentId);
      setPatientName(response.appointment.patient.name);
      setPlanName(response.appointment.planName);
    } catch (error: any) {
      console.error("Failed to load appointment data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    // Refresh appointment data after save
    loadAppointmentData();
    // Optionally navigate back
    // router.push(`/admin/appointments/${appointmentId}`);
  }

  function handleCancel() {
    router.push(`/admin/appointments/${appointmentId}`);
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button Skeleton */}
          <div className="h-6 bg-slate-200 rounded w-48 mb-4 animate-pulse"></div>
          {/* Form Skeleton - matches DoctorNotesForm structure */}
          <div className="min-h-screen py-2 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
              {/* Header Skeleton */}
              <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg w-3/4 mx-auto mb-2 animate-pulse"></div>
                <div className="h-5 sm:h-6 bg-slate-200 rounded-lg w-1/2 mx-auto animate-pulse"></div>
              </div>
              {/* Section Skeletons */}
              {[1, 2, 3].map((section) => (
                <div
                  key={section}
                  className="bg-white/90 backdrop-blur-sm border-2 border-emerald-200 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg overflow-hidden mt-1"
                >
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                    <div className="h-6 sm:h-7 md:h-8 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Appointment Details
        </button>

        {/* Form Component */}
        <DoctorNotesForm
          appointmentId={appointmentId}
          patientName={patientName}
          planName={planName}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </main>
  );
}
