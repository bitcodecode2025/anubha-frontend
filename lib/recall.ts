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
  appointmentId: string; // ✅ Required - removed optional
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

export interface GetRecallByAppointmentResponse {
  success: boolean;
  data: {
    id: string;
    patientId: string;
    appointmentId: string;
    notes: string | null;
    entries: Array<{
      id: string;
      mealType: string;
      time: string;
      foodItem: string;
      quantity: string;
      notes: string | null;
    }>;
  } | null;
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

export async function getRecallByAppointment(
  appointmentId: string
): Promise<GetRecallByAppointmentResponse> {
  try {
    const res = await api.get<GetRecallByAppointmentResponse>(
      `patients/recall/appointment/${appointmentId}`
    );
    return res.data;
  } catch (error: any) {
    throw error;
  }
}
