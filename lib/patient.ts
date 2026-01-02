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
  try {
    const res = await api.post<CreatePatientResponse>("patients/", data);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}
