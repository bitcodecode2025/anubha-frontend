import api from "./api";

interface User {
  id: string;
  name: string;
  phone: string;
  role: "USER" | "ADMIN";
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  role: string;
  user: User;
  owner?: User; // only if API sometimes returns owner
}

export async function sendRegisterOtp(data: { name: string; phone: string }) {
  // Validate input before making request
  if (!data || !data.name || !data.phone) {
    throw new Error("Name and phone are required");
  }
  return (await api.post("auth/register/send-otp", data)).data;
}

export async function verifyRegisterOtp(data: {
  name: string;
  phone: string;
  otp: string;
}) {
  // Validate input before making request
  if (!data || !data.name || !data.phone || !data.otp) {
    throw new Error("Name, phone, and OTP are required");
  }
  return (await api.post("auth/register/verify-otp", data)).data;
}

export async function sendLoginOtp(data: { phone: string }) {
  // Validate input before making request
  if (!data || !data.phone) {
    throw new Error("Phone number is required");
  }
  return (await api.post("auth/login/send-otp", data)).data;
}

export async function verifyLoginOtp(data: { phone: string; otp: string }) {
  // Validate input before making request
  if (!data || !data.phone || !data.otp) {
    throw new Error("Phone and OTP are required");
  }
  const response = (
    await api.post<VerifyOtpResponse>("auth/login/verify-otp", data)
  ).data;
  console.log("OTP verify response:", response);

  if (!response.user && response.owner) {
    response.user = response.owner;
  }
  return response;
}

export async function getMe() {
  return (await api.get("auth/me")).data;
}
