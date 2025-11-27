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
  const res = await api.get<GetSlotsResponse>("slots/available", {
    params: { date, mode },
  });
  return res.data.data;
}

