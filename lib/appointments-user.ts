import api from "./api";

export interface UserAppointment {
  id: string;
  startAt: string;
  endAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  mode: "IN_PERSON" | "ONLINE";
  planName: string;
  planSlug: string;
  planPrice: number;
  planDuration: string;
  planPackageName?: string;
  paymentStatus: string;
  amount?: number;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  slot?: {
    id: string;
    startAt: string;
    endAt: string;
    mode: string;
  };
}

export interface UserAppointmentDetails {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  mode: string;
  planName: string;
  planSlug: string;
  planPrice: number;
  planDuration: string;
  planPackageName?: string;
  paymentStatus: string;
  amount?: number;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    address: string;
    weight: number;
    height: number;
    medicalHistory?: string;
    appointmentConcerns?: string;
    files: Array<{
      id: string;
      url: string;
      fileName: string;
      mimeType: string;
    }>;
    recalls: Array<{
      id: string;
      notes?: string;
      createdAt: string;
      entries: Array<{
        id: string;
        mealType: string;
        time: string;
        foodItem: string;
        quantity: string;
        notes?: string;
      }>;
    }>;
  };
  slot?: {
    id: string;
    startAt: string;
    endAt: string;
    mode: string;
  };
}

export interface GetMyAppointmentsResponse {
  success: boolean;
  appointments: UserAppointment[];
}

export interface GetUserAppointmentDetailsResponse {
  success: boolean;
  appointment: UserAppointmentDetails;
}

export async function getMyAppointments(): Promise<GetMyAppointmentsResponse> {
  try {
    const res = await api.get<GetMyAppointmentsResponse>("appointments/my");
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch appointments:", error);
    throw error;
  }
}

export async function getUserAppointmentDetails(
  appointmentId: string
): Promise<GetUserAppointmentDetailsResponse> {
  try {
    const res = await api.get<GetUserAppointmentDetailsResponse>(
      `appointments/my/${appointmentId}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch appointment details:", error);
    throw error;
  }
}

export interface GetAppointmentsByPatientResponse {
  success: boolean;
  appointments: UserAppointment[];
}

export async function getAppointmentsByPatient(
  patientId: string
): Promise<GetAppointmentsByPatientResponse> {
  try {
    const res = await api.get<GetAppointmentsByPatientResponse>(
      `appointments/patient/${patientId}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch patient appointments:", error);
    throw error;
  }
}
