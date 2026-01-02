import api from "./api";

export interface RecallEntry {
  mealType: string;
  time: string;
  foodItem: string;
  quantity: string;
  notes?: string;
}

export interface CreateRecallRequest {
  patientId: string;
  notes?: string;
  entries: RecallEntry[];
  appointmentId?: string; // Optional - link recall to appointment
}

export interface CreateRecallResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    patientId: string;
    notes: string | null;
    entries: Array<{
      id: string;
      mealType: string;
      time: string;
      foodItem: string;
      quantity: string;
      notes: string | null;
    }>;
  };
}

export async function createRecall(
  data: CreateRecallRequest
): Promise<CreateRecallResponse> {
  try {
    const res = await api.post<CreateRecallResponse>("patients/recall", data);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}
