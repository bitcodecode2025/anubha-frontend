import api from "./api";

export type BookingProgress = "USER_DETAILS" | "RECALL" | "SLOT" | "PAYMENT";

export interface PendingAppointment {
  id: string;
  status: "PENDING";
  bookingProgress: BookingProgress | null;
  patientId: string;
  slotId: string | null;
  startAt: string;
  endAt: string;
  planSlug: string;
  planName: string;
  planPrice: number;
  planDuration: string;
  planPackageName: string | null;
  mode: "IN_PERSON" | "ONLINE";
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  slot: {
    id: string;
    startAt: string;
    endAt: string;
    mode: "IN_PERSON" | "ONLINE";
  } | null;
}

export interface GetPendingAppointmentsResponse {
  success: boolean;
  appointments: PendingAppointment[];
}

export interface UpdateBookingProgressRequest {
  bookingProgress: BookingProgress;
}

export interface UpdateBookingProgressResponse {
  success: boolean;
  message: string;
  appointment: PendingAppointment;
}

/**
 * Get all pending appointments for the current user
 */
export async function getPendingAppointments(): Promise<GetPendingAppointmentsResponse> {
  try {
    console.log(
      "[API] Fetching pending appointments from: appointments/pending"
    );
    const res = await api.get<GetPendingAppointmentsResponse>(
      "appointments/pending"
    );
    console.log("[API] Pending appointments response:", {
      success: res.data.success,
      count: res.data.appointments?.length || 0,
      appointments: res.data.appointments,
    });
    return res.data;
  } catch (error: any) {
    console.error("[API] Error fetching pending appointments:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      url: error?.config?.url,
    });
    throw error;
  }
}

/**
 * Update booking progress for a pending appointment
 */
export async function updateBookingProgress(
  appointmentId: string,
  bookingProgress: BookingProgress
): Promise<UpdateBookingProgressResponse> {
  const res = await api.patch<UpdateBookingProgressResponse>(
    `appointments/${appointmentId}/progress`,
    { bookingProgress }
  );
  return res.data;
}

export interface DeleteAppointmentResponse {
  success: boolean;
  message: string;
}

/**
 * Delete a pending appointment
 */
export async function deletePendingAppointment(
  appointmentId: string
): Promise<DeleteAppointmentResponse> {
  try {
    const res = await api.delete<DeleteAppointmentResponse>(
      `appointments/${appointmentId}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Failed to delete appointment:", error);
    throw error;
  }
}

/**
 * Get the next step URL based on booking progress
 * Note: bookingProgress indicates the LAST completed step, so next step is one after that
 */
export function getNextStepUrl(
  bookingProgress: BookingProgress | null
): string {
  switch (bookingProgress) {
    case "USER_DETAILS":
      // User details completed, next is recall
      return "/book/recall";
    case "RECALL":
      // Recall completed, next is slot selection
      return "/book/slot";
    case "SLOT":
      // Slot selected, next is payment
      return "/book/payment";
    case "PAYMENT":
      // At payment step, stay on payment
      return "/book/payment";
    case null:
    default:
      // No progress tracked, start from beginning (user details)
      // But if appointment exists, they might have completed user details
      // So we'll default to recall (safer assumption)
      return "/book/recall";
  }
}

/**
 * Get step label for display
 */
export function getStepLabel(bookingProgress: BookingProgress | null): string {
  switch (bookingProgress) {
    case "USER_DETAILS":
      return "User Details";
    case "RECALL":
      return "Recall";
    case "SLOT":
      return "Slot Selection";
    case "PAYMENT":
      return "Payment";
    default:
      return "Start Booking";
  }
}
