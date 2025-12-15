import api from "./api";

export interface Slot {
  id: string;
  startAt: string;
  endAt: string;
  label: string;
  mode: "IN_PERSON" | "ONLINE";
}

export interface GetSlotsResponse {
  success: boolean;
  data: Slot[];
}

export async function getAvailableSlots(
  date: string, // YYYY-MM-DD format
  mode: "IN_PERSON" | "ONLINE"
): Promise<Slot[]> {
  try {
    if (!date || !mode) {
      throw new Error("Date and mode are required");
    }
    const res = await api.get<GetSlotsResponse>("slots/available", {
      params: { date, mode },
    });
    return res.data.data || [];
  } catch (error: any) {
    console.error("[API] Get available slots error:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
}
