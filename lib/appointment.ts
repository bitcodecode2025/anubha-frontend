import api from "./api";

export interface CreateAppointmentRequest {
  patientId: string;
  slotId?: string; // Optional - can be set later
  planSlug: string;
  planName: string;
  planPrice: number;
  planDuration: string; // Required - use "40 min" for general consultation if not provided
  planPackageName?: string;
  appointmentMode: "IN_PERSON" | "ONLINE";
  startAt?: string; // ISO string - required if no slotId
  endAt?: string; // ISO string - required if no slotId
  bookingProgress?: "USER_DETAILS" | "RECALL" | "SLOT" | "PAYMENT"; // Track where user is in booking flow
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    patientId: string;
    slotId: string | null;
    status: string;
    startAt: string;
    endAt: string;
  };
}

export async function createAppointment(
  data: CreateAppointmentRequest
): Promise<CreateAppointmentResponse> {
  console.log(
    "[API] Creating appointment - Request URL:",
    `${process.env.NEXT_PUBLIC_API_URL}/appointments/create`
  );
  console.log("[API] Creating appointment - Request data:", {
    patientId: data.patientId,
    planSlug: data.planSlug,
    planName: data.planName,
    planPrice: data.planPrice,
    planDuration: data.planDuration,
    appointmentMode: data.appointmentMode,
    hasSlotId: !!data.slotId,
  });

  // Validate required fields before sending
  if (!data.patientId) {
    throw new Error("patientId is required");
  }
  if (!data.planSlug || !data.planName || !data.planPrice) {
    throw new Error(
      "Plan details (planSlug, planName, planPrice) are required"
    );
  }
  if (!data.planDuration) {
    throw new Error(
      "planDuration is required. Use '40 min' for general consultation if not provided."
    );
  }
  if (
    !data.appointmentMode ||
    !["IN_PERSON", "ONLINE"].includes(data.appointmentMode)
  ) {
    throw new Error("appointmentMode must be 'IN_PERSON' or 'ONLINE'");
  }

  try {
    const res = await api.post<CreateAppointmentResponse>(
      "appointments/create",
      data
    );
    console.log("[API] Appointment creation response status:", res.status);
    console.log("[API] Appointment creation response data:", res.data);
    return res.data;
  } catch (error: any) {
    console.log("[API] Appointment creation error:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      config: {
        url: error?.config?.url,
        method: error?.config?.method,
      },
    });
    throw error;
  }
}

export interface UpdateAppointmentSlotRequest {
  slotId: string;
  bookingProgress?: "USER_DETAILS" | "RECALL" | "SLOT" | "PAYMENT"; // Optional: update progress when slot is selected
}

export interface UpdateAppointmentSlotResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    slotId: string | null;
    startAt: string;
    endAt: string;
  };
}

export async function updateAppointmentSlot(
  appointmentId: string,
  data: UpdateAppointmentSlotRequest
): Promise<UpdateAppointmentSlotResponse> {
  try {
    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }
    if (!data.slotId) {
      throw new Error("Slot ID is required");
    }
    const res = await api.patch<UpdateAppointmentSlotResponse>(
      `appointments/${appointmentId}/slot`,
      data
    );
    return res.data;
  } catch (error: any) {
    console.error("[API] Update appointment slot error:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
}
