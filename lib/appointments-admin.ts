import api from "./api";

export interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  mode: "IN_PERSON" | "ONLINE";
  planName: string;
  planSlug: string;
  planPackageName?: string;
  paymentStatus: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

export interface AppointmentDetails {
  id: string;
  startAt: string;
  endAt: string;
  createdAt: string;
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
  DoctorFormSession?: Array<{
    id: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    values: Array<{
      id: string;
      fieldId: string;
      stringValue: string | null;
      numberValue: number | null;
      booleanValue: boolean | null;
      dateValue: string | null;
      timeValue: string | null;
      jsonValue: any;
      notes: string | null;
      field: {
        id: string;
        key: string;
        label: string;
        type: string;
        options: Array<{
          id: string;
          value: string;
          label: string;
        }>;
      };
    }>;
  }>;
}

export interface GetAppointmentsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  appointments: Appointment[];
}

export interface GetAppointmentDetailsResponse {
  success: boolean;
  appointment: AppointmentDetails;
}

export interface UpdateStatusResponse {
  success: boolean;
  appointment: Appointment;
}

export async function getAdminAppointments(params: {
  page?: number;
  limit?: number;
  status?: string;
  mode?: string;
  date?: string;
  q?: string;
}): Promise<GetAppointmentsResponse> {
  try {
    const res = await api.get<GetAppointmentsResponse>("admin/appointments", {
      params,
    });
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch appointments:", error);
    throw error;
  }
}

export async function getAppointmentDetails(
  appointmentId: string
): Promise<GetAppointmentDetailsResponse> {
  try {
    const res = await api.get<GetAppointmentDetailsResponse>(
      `admin/appointments/${appointmentId}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch appointment details:", error);
    throw error;
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
): Promise<UpdateStatusResponse> {
  try {
    const res = await api.patch<UpdateStatusResponse>(
      `admin/appointments/${appointmentId}/status`,
      { status }
    );
    return res.data;
  } catch (error: any) {
    console.error("Failed to update appointment status:", error);
    throw error;
  }
}

export interface DeleteAppointmentResponse {
  success: boolean;
  message: string;
  scope?: "admin" | "global";
}

export interface DeleteAppointmentRequest {
  reason?: string;
  scope?: "admin" | "global";
}

/**
 * Delete appointment from admin view (admin-only soft delete)
 * By default, this only removes the appointment from admin dashboard.
 * User will still be able to see their appointment.
 *
 * To archive globally (remove from both admin and user views), set scope: "global"
 */
export async function deleteAppointment(
  appointmentId: string,
  options?: DeleteAppointmentRequest
): Promise<DeleteAppointmentResponse> {
  try {
    // Use PATCH endpoint for admin-delete (supports body with reason/scope)
    // Falls back to DELETE for backward compatibility if no options provided
    if (options && (options.reason || options.scope)) {
      const res = await api.patch<DeleteAppointmentResponse>(
        `admin/appointments/${appointmentId}/admin-delete`,
        options
      );
      return res.data;
    } else {
      // Default: admin-only delete (backward compatible)
      const res = await api.delete<DeleteAppointmentResponse>(
        `admin/appointments/${appointmentId}`
      );
      return res.data;
    }
  } catch (error: any) {
    console.error("Failed to delete appointment:", error);
    throw error;
  }
}
