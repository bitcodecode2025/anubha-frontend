"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useBookingForm } from "../context/BookingFormContext";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Video, MapPin, Clock, Loader2 } from "lucide-react";
import { getAvailableSlots, Slot } from "@/lib/slots";
import toast from "react-hot-toast";

export default function SlotPage() {
  const { form, setForm } = useBookingForm();
  const router = useRouter();

  /* -------------------------------------------------
      BLOCK DIRECT ACCESS
  -------------------------------------------------- */
  useEffect(() => {
    if (!form.planSlug) router.replace("/services");
  }, [form.planSlug]);

  /* -------------------------------------------------
      SLOT STATE
  -------------------------------------------------- */
  const [mode, setMode] = useState<"In-person" | "Online">("In-person");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (form.appointmentMode)
      setMode(form.appointmentMode as "In-person" | "Online");
  }, [form.appointmentMode]);

  // Reset selected time when mode changes
  useEffect(() => {
    setSelectedTime("");
  }, [mode]);

  /* -------------------------------------------------
      FETCH SLOTS FROM BACKEND
  -------------------------------------------------- */
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        // Convert mode to backend format
        const backendMode = mode === "In-person" ? "IN_PERSON" : "ONLINE";
        
        // Format date as YYYY-MM-DD
        const dateStr = selectedDate.toISOString().split("T")[0];
        
        const fetchedSlots = await getAvailableSlots(dateStr, backendMode);
        setSlots(fetchedSlots);
      } catch (error: any) {
        console.error("Failed to fetch slots:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load available slots"
        );
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, mode]);

  /* -------------------------------------------------
      CALENDAR SETUP
  -------------------------------------------------- */
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState<Date>(today);

  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDay = new Date(y, m, 1).getDay();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);

  const isPast = (date: Date) => date < today;
  const isSunday = (date: Date) => date.getDay() === 0;

  function selectDate(day: number) {
    const d = new Date(y, m, day);
    d.setHours(0, 0, 0, 0);

    if (isPast(d) || isSunday(d)) return;

    setSelectedDate(d);
    setSelectedTime("");
  }

  function changeMonth(dir: "next" | "prev") {
    const next = dir === "next" ? new Date(y, m + 1, 1) : new Date(y, m - 1, 1);
    if (next < minMonth || next > maxMonth) return;

    setCurrentMonth(next);
    setSelectedDate(null);
    setSelectedTime("");
  }

  /* -------------------------------------------------
      TIME SLOT: Check if slot is selected
  -------------------------------------------------- */
  function isSlotSelected(slot: Slot) {
    return selectedTime === slot.label;
  }

  /* -------------------------------------------------
      CONTINUE HANDLER
  -------------------------------------------------- */
  function onNext() {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time.");
      return;
    }

    // Find the selected slot to get its ID
    const selectedSlot = slots.find((s) => s.label === selectedTime);

    if (!selectedSlot) {
      toast.error("Selected slot not found. Please try again.");
      return;
    }

    setForm({
      appointmentMode: mode,
      appointmentDate: selectedDate.toISOString(),
      appointmentTime: selectedTime,
      slotId: selectedSlot.id,
    });

    router.push("/book/payment");
  }

  /* -------------------------------------------------
      UI RENDER
  -------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f9fcfa] to-[#f1f7f3] py-10 px-4 flex justify-center">
      <div className="max-w-lg w-full bg-white rounded-2xl p-5 shadow-md">
        {/* PLAN BANNER */}
        {form.planName && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
            <p className="font-semibold text-emerald-900">
              Booking: {form.planName}
              {form.planPackageName ? ` — ${form.planPackageName}` : ""}
            </p>
            <p className="text-emerald-700">Price: {form.planPrice}</p>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Pick a Date & Time
        </h2>

        {/* MODE SELECTOR */}
        <div className="flex rounded-xl overflow-hidden border mb-6">
          <button
            onClick={() => setMode("In-person")}
            className={`flex-1 py-3 text-sm ${
              mode === "In-person"
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <MapPin size={16} /> Clinic Visit
            </div>
          </button>

          <button
            onClick={() => setMode("Online")}
            className={`flex-1 py-3 text-sm ${
              mode === "Online"
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Video size={16} /> Virtual Call
            </div>
          </button>
        </div>

        {/* CALENDAR */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <button
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
              disabled={currentMonth >= maxMonth}
              onClick={() => changeMonth("next")}
              className={currentMonth >= maxMonth ? "opacity-30" : ""}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* WEEK DAYS */}
          <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* DATES */}
          <div className="grid grid-cols-7 gap-2">
            {Array(startDay === 0 ? 6 : startDay - 1)
              .fill(0)
              .map((_, i) => (
                <div key={i}></div>
              ))}

            {Array.from({ length: daysInMonth }, (_, n) => n + 1).map((day) => {
              const date = new Date(y, m, day);
              date.setHours(0, 0, 0, 0);

              const disabled = isPast(date) || isSunday(date);
              const selected =
                selectedDate?.toDateString() === date.toDateString();

              return (
                <button
                  key={day}
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
            })}
          </div>
        </div>

        {/* TIME SLOTS */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Clock size={18} /> Available Slots
          </h3>

          {!selectedDate ? (
            <p className="text-slate-500 text-sm">Select a date first.</p>
          ) : loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No available slots for this date. Please select another date.
            </p>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => {
                const isSelected = isSlotSelected(slot);

                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedTime(slot.label);
                      setForm({
                        appointmentMode: mode,
                        appointmentDate: selectedDate.toISOString(),
                        appointmentTime: slot.label,
                        slotId: slot.id,
                      });
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

        {/* NAVIGATION */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.push("/book/recall")}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            ← Back
          </button>

          <button
            onClick={onNext}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm"
          >
            Continue →
          </button>
        </div>
      </div>
    </main>
  );
}
