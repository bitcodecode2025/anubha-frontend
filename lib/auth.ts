import api from "./api";

export async function sendRegisterOtp(data: { name: string; phone: string }) {
  return (await api.post("auth/register/send-otp", data)).data;
}

export async function verifyRegisterOtp(data: {
  name: string;
  phone: string;
  otp: string;
}) {
  return (await api.post("auth/register/verify-otp", data)).data;
}

export async function sendLoginOtp(data: { phone: string }) {
  return (await api.post("auth/login/send-otp", data)).data;
}

export async function verifyLoginOtp(data: { phone: string; otp: string }) {
  return (await api.post("auth/login/verify-otp", data)).data;
}

export async function getMe() {
  return (await api.get("auth/me")).data;
}
