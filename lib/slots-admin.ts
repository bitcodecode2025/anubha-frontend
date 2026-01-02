import api from "./api";

export interface CreateSlotsRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  modes: ("IN_PERSON" | "ONLINE")[];
}

export interface CreateSlotsResponse {
  success: boolean;
  message: string;
  createdCount: number;
}

export interface DayOff {
  id: string;
  date: string | Date; // Backend returns Date, serialized as ISO string
  reason?: string | null;
}

export interface AddDayOffRequest {
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface AddDayOffResponse {
  success: boolean;
  message: string;
  data?: DayOff;
}

export interface RemoveDayOffResponse {
  success: boolean;
  message: string;
}

export interface DayOffListResponse {
  success: boolean;
  data: DayOff[];
}

export interface AdminSlot {
  id: string;
  startAt: string | Date;
  endAt: string | Date;
  mode: "IN_PERSON" | "ONLINE";
  isBooked: boolean;
  appointment: {
    id: string;
    patientName: string;
    patientId: string;
  } | null;
}

export interface AdminSlotsResponse {
  success: boolean;
  data: AdminSlot[];
}

// Create slots for a date range
export async function createSlots(
  data: CreateSlotsRequest
): Promise<CreateSlotsResponse> {
  const res = await api.post<CreateSlotsResponse>("slots/admin/generate", data);
  return res.data;
}

// Add a day off
export async function addDayOff(
  data: AddDayOffRequest
): Promise<AddDayOffResponse> {
  try {
    const res = await api.post<AddDayOffResponse>("slots/admin/day-off", data);
    return res.data;
  } catch (err: any) {
    // Normalize server error message for UI to display
    const serverMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to add day off";
    return {
      success: false,
      message: serverMessage,
    };
  }
}

// Remove a day off (mark as day in)
export async function removeDayOff(
  dayOffId: string
): Promise<RemoveDayOffResponse> {
  const res = await api.delete<RemoveDayOffResponse>(
    `slots/admin/day-off/${dayOffId}`
  );
  return res.data;
}

// Get all day offs
export async function getDayOffs(): Promise<DayOff[]> {
  const res = await api.get<DayOffListResponse>("slots/admin/day-off");
  return res.data.data;
}

// Get existing slots for a date range
export async function getExistingSlots(
  startDate: string,
  endDate: string
): Promise<AdminSlot[]> {
  const res = await api.get<AdminSlotsResponse>("slots/admin/list", {
    params: { startDate, endDate },
  });
  return res.data.data;
}

export interface SlotPreviewResponse {
  success: boolean;
  data: {
    totalSlots: number;
    inPersonSlots: number;
    onlineSlots: number;
    inPersonErrors: string[];
    onlineErrors: string[];
    existingSlotWarnings: string[];
    dateDetails: Array<{
      date: string;
      isSunday: boolean;
      isDayOff: boolean;
      hasExistingSlots: string[];
      inPersonCount: number;
      onlineCount: number;
      inPersonReasons: string[];
      onlineReasons: string[];
    }>;
  };
}

// Preview slots before creating
export async function previewSlots(
  startDate: string,
  endDate: string,
  modes: ("IN_PERSON" | "ONLINE")[]
): Promise<SlotPreviewResponse["data"]> {
  const res = await api.get<SlotPreviewResponse>("slots/admin/preview", {
    params: {
      startDate,
      endDate,
      modes: modes.join(","),
    },
  });
  return res.data.data;
}

export interface SlotDateRangeResponse {
  success: boolean;
  data: {
    hasSlots: boolean;
    earliestDate: string | null;
    latestDate: string | null;
  };
}

// Get slot date range (earliest and latest slot dates)
export async function getSlotDateRange(): Promise<
  SlotDateRangeResponse["data"]
> {
  try {
    const res = await api.get<SlotDateRangeResponse>("slots/admin/date-range");
    return res.data.data;
  } catch (error: any) {
    // Return default if error
    return {
      hasSlots: false,
      earliestDate: null,
      latestDate: null,
    };
  }
}
