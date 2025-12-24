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
  try {
    // Validate input before making request
    if (!data || !data.name || !data.phone) {
      throw new Error("Name and phone are required");
    }
    const response = await api.post("auth/register/send-otp", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Send register OTP error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function verifyRegisterOtp(data: {
  name: string;
  phone: string;
  otp: string;
}) {
  try {
    // Validate input before making request
    if (!data || !data.name || !data.phone || !data.otp) {
      throw new Error("Name, phone, and OTP are required");
    }
    const response = await api.post("auth/register/verify-otp", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Verify register OTP error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function sendLoginOtp(data: { phone: string }) {
  try {
    // Validate input before making request
    if (!data || !data.phone) {
      throw new Error("Phone number is required");
    }
    const response = await api.post("auth/login/send-otp", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Send login OTP error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function verifyLoginOtp(data: { phone: string; otp: string }) {
  try {
    // Validate input before making request
    if (!data || !data.phone || !data.otp) {
      throw new Error("Phone and OTP are required");
    }
    const response = (
      await api.post<VerifyOtpResponse>("auth/login/verify-otp", data)
    ).data;

    if (process.env.NODE_ENV === "development") {
      console.log("OTP verify response:", response);
    }

    if (!response.user && response.owner) {
      response.user = response.owner;
    }
    return response;
  } catch (error: any) {
    console.error(
      "[API] Verify login OTP error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function getMe() {
  try {
    const response = await api.get("auth/me");
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Get me error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function sendLinkPhoneEmailOtp(data: {
  email: string;
  phone: string;
}) {
  try {
    if (!data || !data.email || !data.phone) {
      throw new Error("Email and phone are required");
    }
    const response = await api.post("auth/link-phone/send-email-otp", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Send link phone email OTP error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function verifyLinkPhoneEmailOtp(data: {
  email: string;
  phone: string;
  otp: string;
}) {
  try {
    if (!data || !data.email || !data.phone || !data.otp) {
      throw new Error("Email, phone, and OTP are required");
    }
    const response = await api.post("auth/link-phone/verify-email-otp", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Verify link phone email OTP error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function sendAddEmailOtp(data: { email: string }) {
  try {
    if (!data || !data.email) {
      throw new Error("Email is required");
    }
    const response = await api.post("auth/add-email/send-otp", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Send add email OTP error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function verifyAddEmailOtp(data: { email: string; otp: string }) {
  try {
    if (!data || !data.email || !data.otp) {
      throw new Error("Email and OTP are required");
    }
    const response = await api.post("auth/add-email/verify-otp", data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Verify add email OTP error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}
