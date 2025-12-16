import api from "./api";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  gender: string;
  createdAt: string;
}

export async function getMyPatients(): Promise<Patient[]> {
  try {
    const res = await api.get<{ success: boolean; patients: Patient[] }>(
      "patients/me"
    );
    return res.data.patients || [];
  } catch (error: any) {
    console.error(
      "[API] Get my patients error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export interface PatientDetails {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  address: string;
  weight: number;
  height: number;
  medicalHistory?: string;
  appointmentConcerns?: string;
  createdAt: string;
  [key: string]: any;
}

export interface GetPatientDetailsResponse {
  success: boolean;
  patient: PatientDetails;
}

export async function getPatientDetails(
  patientId: string
): Promise<GetPatientDetailsResponse> {
  try {
    const res = await api.get<GetPatientDetailsResponse>(
      `patients/me/${patientId}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch patient details:", error);
    throw error;
  }
}

export interface CreatePatientResponse {
  success: boolean;
  message: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
    [key: string]: any;
  };
}

export async function createPatient(data: any): Promise<CreatePatientResponse> {
  console.log(
    "[API] Creating patient - Request URL:",
    `${process.env.NEXT_PUBLIC_API_URL}/patients/`
  );
  console.log("[API] Creating patient - Request data keys:", Object.keys(data));

  try {
    const res = await api.post<CreatePatientResponse>("patients/", data);
    console.log("[API] Patient creation response status:", res.status);
    console.log("[API] Patient creation response data:", res.data);
    return res.data;
  } catch (error: any) {
    console.log("[API] Patient creation error:", {
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
