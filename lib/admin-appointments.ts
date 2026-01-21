import api from "./api";

export interface RecallEntry {
  mealType: string;
  time: string;
  foodItem: string;
  quantity: string;
  notes?: string;
}

export interface CreateAppointmentRequest {
  userId: string;
  patientId: string;
  slotId?: string;
  planSlug: string;
  planName: string;
  planPrice: number;
  planDuration: string;
  planPackageName?: string;
  appointmentMode: "IN_PERSON" | "ONLINE";
  startAt?: string; // ISO string
  endAt?: string; // ISO string
  paymentMode: "CASH" | "OFFLINE" | "PAID";
  recallEntries?: RecallEntry[];
  recallNotes?: string;
}

interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  appointment: any;
}

/**
 * Create appointment by admin for a user
 */
export async function createAppointmentByAdmin(
  data: CreateAppointmentRequest
): Promise<any> {
  try {
    const response = await api.post<CreateAppointmentResponse>(
      "/admin/appointments/create",
      data
    );
    if (response.data.success) {
      return response.data.appointment;
    }
    throw new Error(response.data.message || "Failed to create appointment");
  } catch (error: any) {
    throw error;
  }
}
