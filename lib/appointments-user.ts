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
  files?: Array<{
    id: string;
    url: string;
    fileName: string;
    mimeType: string;
  }>;
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
  total: number;
  page: number;
  limit: number;
}

export interface GetUserAppointmentDetailsResponse {
  success: boolean;
  appointment: UserAppointmentDetails;
}

export async function getMyAppointments(
  params?: { page?: number; limit?: number; includePending?: boolean; sort?: "latest" | "oldest" }
): Promise<GetMyAppointmentsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.includePending) queryParams.set("includePending", "true");
    if (params?.sort) queryParams.set("sort", params.sort);

    const queryString = queryParams.toString();
    const url = queryString
      ? `appointments/my?${queryString}`
      : "appointments/my";
    const res = await api.get<GetMyAppointmentsResponse>(url);
    return res.data;
  } catch (error: any) {
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
    throw error;
  }
}
