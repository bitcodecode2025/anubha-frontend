"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  X,
  Loader2,
  CalendarDays,
  CalendarX,
} from "lucide-react";
import {
  createSlots,
  addDayOff,
  removeDayOff,
  getDayOffs,
  getExistingSlots,
  previewSlots,
  getSlotDateRange,
  DayOff,
  AdminSlot,
} from "@/lib/slots-admin";
import SuccessNotification from "@/components/ui/SuccessNotification";
import toast from "react-hot-toast";

export default function EditSlotsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modes, setModes] = useState<("IN_PERSON" | "ONLINE")[]>([
    "IN_PERSON",
    "ONLINE",
  ]);
  const [creatingSlots, setCreatingSlots] = useState(false);

  const [dayOffDate, setDayOffDate] = useState("");
  const [dayOffReason, setDayOffReason] = useState("");
  const [addingDayOff, setAddingDayOff] = useState(false);
  const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
  const [loadingDayOffs, setLoadingDayOffs] = useState(false);
  const [removingDayOffId, setRemovingDayOffId] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingSlots, setExistingSlots] = useState<AdminSlot[]>([]);
  const [loadingExistingSlots, setLoadingExistingSlots] = useState(false);
  const [slotPreview, setSlotPreview] = useState<{
    totalSlots: number;
    inPersonSlots: number;
    onlineSlots: number;
    inPersonErrors: string[];
    onlineErrors: string[];
    existingSlotWarnings: string[];
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [dayOffError, setDayOffError] = useState<string | null>(null);
  const [slotDateRange, setSlotDateRange] = useState<{
    hasSlots: boolean;
    earliestDate: string | null;
    latestDate: string | null;
  } | null>(null);
  const [loadingDateRange, setLoadingDateRange] = useState(false);

  // Auth check
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") {
      router.replace("/admin");
    }
  }, [user, authLoading, router]);

  // Load day offs and slot date range on mount
  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadDayOffs();
      loadSlotDateRange();
    }
  }, [user]);

  // Reload slot date range after creating slots
  const loadSlotDateRange = async () => {
    try {
      setLoadingDateRange(true);
      const data = await getSlotDateRange();
      setSlotDateRange(data);
    } catch (error: any) {
      console.error("Failed to load slot date range:", error);
      // Don't show toast for this, just log it
      setSlotDateRange({
        hasSlots: false,
        earliestDate: null,
        latestDate: null,
      });
    } finally {
      setLoadingDateRange(false);
    }
  };

  // Load preview when date range or modes change
  useEffect(() => {
    if (user?.role === "ADMIN" && startDate && endDate && modes.length > 0) {
      loadSlotPreview();
    } else {
      setSlotPreview(null);
      setExistingSlots([]);
    }
  }, [user, startDate, endDate, modes]);

  const loadDayOffs = async () => {
    try {
      setLoadingDayOffs(true);
      const data = await getDayOffs();
      setDayOffs(data);
    } catch (error: any) {
      console.error("Failed to load day offs:", error);
      toast.error(error?.response?.data?.message || "Failed to load day offs");
    } finally {
      setLoadingDayOffs(false);
    }
  };

  const loadExistingSlots = async () => {
    if (!startDate || !endDate) return;
    try {
      setLoadingExistingSlots(true);
      const data = await getExistingSlots(startDate, endDate);
      setExistingSlots(data);
    } catch (error: any) {
      console.error("Failed to load existing slots:", error);
      // Don't show toast for this, just log it
    } finally {
      setLoadingExistingSlots(false);
    }
  };

  const loadSlotPreview = async () => {
    if (!startDate || !endDate || modes.length === 0) return;
    try {
      setLoadingPreview(true);
      const preview = await previewSlots(startDate, endDate, modes);
      setSlotPreview({
        totalSlots: preview.totalSlots,
        inPersonSlots: preview.inPersonSlots,
        onlineSlots: preview.onlineSlots,
        inPersonErrors: preview.inPersonErrors,
        onlineErrors: preview.onlineErrors,
        existingSlotWarnings: preview.existingSlotWarnings,
      });
    } catch (error: any) {
      console.error("Failed to load slot preview:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load slot preview"
      );
      setSlotPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCreateSlots = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (end < start) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (start < today) {
      toast.error("Start date cannot be in the past");
      return;
    }

    // Check date range (max 3 months)
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (end > maxDate) {
      toast.error("Cannot create slots more than 3 months in advance");
      return;
    }

    if (modes.length === 0) {
      toast.error("Please select at least one appointment mode");
      return;
    }

    // Check for existing slots
    if (slotPreview && slotPreview.existingSlotWarnings.length > 0) {
      const datesWithSlots = slotPreview.existingSlotWarnings
        .map((w) => w.split(":")[0])
        .join(", ");
      const confirmed = window.confirm(
        `Slots already exist for some dates: ${datesWithSlots}\n\nDuplicate slots will be skipped. Do you want to continue?`
      );
      if (!confirmed) return;
    }

    try {
      setCreatingSlots(true);
      const result = await createSlots({
        startDate,
        endDate,
        modes,
      });

      if (result.createdCount === 0) {
        toast.error(
          "No slots were created. This may be because all dates in the range are Sundays, day offs, or slots already exist."
        );
        return;
      }

      setSuccessMessage(
        `Successfully created ${result.createdCount} slot(s) for ${modes.join(
          " and "
        )} mode(s)`
      );
      setShowSuccess(true);

      // Reset form
      setStartDate("");
      setEndDate("");

      // Reload slot date range to reflect new slots
      await loadSlotDateRange();
    } catch (error: any) {
      console.error("Failed to create slots:", error);
      const errorMsg =
        error?.response?.data?.message || "Failed to create slots";
      toast.error(errorMsg);
    } finally {
      setCreatingSlots(false);
    }
  };

  const handleAddDayOff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dayOffDate) {
      toast.error("Please select a date");
      return;
    }

    const selectedDate = new Date(dayOffDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already a day off
    const existing = dayOffs.find((d) => {
      const doDate =
        typeof d.date === "string"
          ? d.date.includes("T")
            ? d.date.split("T")[0]
            : d.date
          : new Date(d.date).toISOString().split("T")[0];
      return doDate === dayOffDate;
    });
    if (existing) {
      toast.error("This date is already marked as a day off");
      return;
    }

    // Warn if date is in the past (but allow it)
    if (selectedDate < today) {
      const confirmed = window.confirm(
        "This date is in the past. Are you sure you want to mark it as a day off?"
      );
      if (!confirmed) return;
    }

    try {
      setAddingDayOff(true);
      setDayOffError(null);
      const res = await addDayOff({
        date: dayOffDate,
        reason: dayOffReason || undefined,
      });

      if (!res.success) {
        const reason = res.message || "Failed to mark this day off.";
        setDayOffError(reason);
        toast.error(`Failed to mark this day off: ${reason}`);
        return;
      }

      setSuccessMessage(
        `Day off added successfully${dayOffReason ? `: ${dayOffReason}` : ""}`
      );
      setShowSuccess(true);

      // Reset form and reload
      setDayOffDate("");
      setDayOffReason("");
      await loadDayOffs();
    } catch (error: any) {
      console.error("Failed to add day off:", error);
      const reason = error?.response?.data?.message || error?.message;
      const errorMsg = reason
        ? `Failed to mark this day off: ${reason}`
        : "Failed to mark this day off.";
      setDayOffError(reason || "Failed to mark this day off.");
      toast.error(errorMsg);
    } finally {
      setAddingDayOff(false);
    }
  };

  const handleRemoveDayOff = async (id: string) => {
    try {
      setRemovingDayOffId(id);
      await removeDayOff(id);

      setSuccessMessage("Day off removed successfully (marked as day in)");
      setShowSuccess(true);

      await loadDayOffs();
    } catch (error: any) {
      console.error("Failed to remove day off:", error);
      toast.error(error?.response?.data?.message || "Failed to remove day off");
    } finally {
      setRemovingDayOffId(null);
    }
  };

  const toggleMode = (mode: "IN_PERSON" | "ONLINE") => {
    setModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const formatDate = (dateInput: string | Date) => {
    // Handle both ISO string, YYYY-MM-DD format, and Date objects
    const date =
      typeof dateInput === "string"
        ? dateInput.includes("T")
          ? new Date(dateInput)
          : new Date(dateInput + "T00:00:00Z")
        : dateInput;
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isSunday = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00Z");
    return date.getDay() === 0;
  };

  const getDateRangeInfo = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Count Sundays in range
    let sundayCount = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      if (cursor.getDay() === 0) sundayCount++;
      cursor.setDate(cursor.getDate() + 1);
    }

    // Count day offs in range
    const dayOffCount = dayOffs.filter((d) => {
      const doDate =
        typeof d.date === "string"
          ? d.date.includes("T")
            ? d.date.split("T")[0]
            : d.date
          : new Date(d.date).toISOString().split("T")[0];
      return doDate >= startDate && doDate <= endDate;
    }).length;

    return { days, sundayCount, dayOffCount };
  };

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] px-6 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="text-emerald-600 hover:text-emerald-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Edit Slots
          </h1>
          <p className="text-slate-600">
            Create appointment slots and manage day offs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Slots Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Create Slots
              </h2>
            </div>

            <form onSubmit={handleCreateSlots} className="space-y-6">
              {/* Date Range */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Appointment Modes
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => toggleMode("IN_PERSON")}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                      modes.includes("IN_PERSON")
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                        : "bg-white border-slate-300 text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMode("ONLINE")}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                      modes.includes("ONLINE")
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                        : "bg-white border-slate-300 text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    Online
                  </button>
                </div>
                {modes.length === 0 && (
                  <p className="text-red-500 text-xs mt-2">
                    Select at least one mode
                  </p>
                )}
              </div>

              {/* Date Range Info */}
              {startDate && endDate && getDateRangeInfo() && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                  <p className="text-blue-900 font-medium mb-2">
                    Date Range Summary:
                  </p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Total days: {getDateRangeInfo()?.days}</li>
                    <li>
                      • Sundays (skipped): {getDateRangeInfo()?.sundayCount}
                    </li>
                    <li>
                      • Day offs (skipped): {getDateRangeInfo()?.dayOffCount}
                    </li>
                    <li className="text-blue-600">
                      • Working days:{" "}
                      {(getDateRangeInfo()?.days || 0) -
                        (getDateRangeInfo()?.sundayCount || 0) -
                        (getDateRangeInfo()?.dayOffCount || 0)}
                    </li>
                  </ul>
                </div>
              )}

              {/* Slot Preview */}
              {loadingPreview && startDate && endDate && modes.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Calculating slot preview...</span>
                  </div>
                </div>
              )}
              {!loadingPreview && slotPreview && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-emerald-900 font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Slot Preview
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-800">
                        Total slots to be created:
                      </span>
                      <span className="font-bold text-emerald-900 text-lg">
                        {slotPreview.totalSlots}
                      </span>
                    </div>
                    {modes.includes("IN_PERSON") && (
                      <div className="text-emerald-700">
                        • IN_PERSON: {slotPreview.inPersonSlots} slots
                      </div>
                    )}
                    {modes.includes("ONLINE") && (
                      <div className="text-emerald-700">
                        • ONLINE: {slotPreview.onlineSlots} slots
                      </div>
                    )}
                  </div>

                  {/* Errors/Warnings */}
                  {slotPreview.inPersonErrors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-300">
                      <p className="text-red-700 font-medium mb-2 text-xs">
                        ⚠️ IN_PERSON Slot Warnings:
                      </p>
                      <ul className="space-y-1">
                        {slotPreview.inPersonErrors.map((err, idx) => (
                          <li key={idx} className="text-red-600 text-xs">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {slotPreview.onlineErrors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-300">
                      <p className="text-red-700 font-medium mb-2 text-xs">
                        ⚠️ ONLINE Slot Warnings:
                      </p>
                      <ul className="space-y-1">
                        {slotPreview.onlineErrors.map((err, idx) => (
                          <li key={idx} className="text-red-600 text-xs">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {slotPreview.existingSlotWarnings.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-amber-300">
                      <p className="text-amber-700 font-medium mb-2 text-xs">
                        ⚠️ Existing Slots Warning:
                      </p>
                      <ul className="space-y-1">
                        {slotPreview.existingSlotWarnings.map((err, idx) => (
                          <li key={idx} className="text-amber-600 text-xs">
                            {err}
                          </li>
                        ))}
                      </ul>
                      <p className="text-amber-600 text-xs mt-2 italic">
                        Note: Duplicate slots will be skipped (backend uses
                        skipDuplicates)
                      </p>
                    </div>
                  )}

                  {slotPreview.totalSlots === 0 && (
                    <div className="mt-4 pt-4 border-t border-red-300">
                      <p className="text-red-700 font-medium text-xs">
                        ⚠️ No slots will be created. Check date range, modes,
                        and time constraints.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creatingSlots || modes.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingSlots ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Slots...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Slots
                  </>
                )}
              </button>
            </form>

            {/* Slot Date Range Info */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                Created Slots Range
              </h3>
              {loadingDateRange ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : slotDateRange?.hasSlots ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-800 font-medium">
                        Starting Date:
                      </span>
                      <span className="text-emerald-900 font-semibold">
                        {slotDateRange.earliestDate
                          ? formatDate(slotDateRange.earliestDate)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-800 font-medium">
                        Ending Date:
                      </span>
                      <span className="text-emerald-900 font-semibold">
                        {slotDateRange.latestDate
                          ? formatDate(slotDateRange.latestDate)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-300">
                      <p className="text-emerald-700 text-xs">
                        Slots have been created from the starting date up to the
                        ending date.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <CalendarX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 font-medium">
                    No slots created yet
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    Use the form above to create slots for a date range
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Day Off Management Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <CalendarX className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Day Off Management
              </h2>
            </div>

            {/* Add Day Off Form */}
            <form onSubmit={handleAddDayOff} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={dayOffDate}
                  onChange={(e) => setDayOffDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
                {dayOffDate && isSunday(dayOffDate) && (
                  <p className="text-amber-600 text-xs mt-1">
                    ⚠️ This is a Sunday (slots are not created on Sundays)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={dayOffReason}
                  onChange={(e) => setDayOffReason(e.target.value)}
                  placeholder="e.g., Holiday, Personal leave"
                  maxLength={255}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={addingDayOff}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingDayOff ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CalendarX className="w-5 h-5" />
                    Mark as Day Off
                  </>
                )}
              </button>
            </form>

            {/* Day Offs List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Day Offs ({dayOffs.length})
              </h3>

              {dayOffError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Failed to mark this day off: {dayOffError}
                </div>
              )}

              {loadingDayOffs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : dayOffs.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  No day offs scheduled
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dayOffs.map((dayOff) => (
                    <motion.div
                      key={dayOff.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {formatDate(dayOff.date)}
                        </p>
                        {dayOff.reason && (
                          <p className="text-sm text-slate-600">
                            {dayOff.reason}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveDayOff(dayOff.id)}
                        disabled={removingDayOffId === dayOff.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Mark as Day In (Remove Day Off)"
                      >
                        {removingDayOffId === dayOff.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Notification */}
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}
