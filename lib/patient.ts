import api from "./api";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  gender: string;
  createdAt: string;
}

export async function getMyPatients(): Promise<Patient[]> {
  const res = await api.get<{ success: boolean; patients: Patient[] }>(
    "patients/me"
  );
  return res.data.patients;
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

export async function createPatient(
  data: any
): Promise<CreatePatientResponse> {
  const res = await api.post<CreatePatientResponse>("patients/", data);
  return res.data;
}

