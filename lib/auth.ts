import api from "./api";

interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  role: string;
  user: User;
  owner?: User; // only if API sometimes returns owner
}

interface SignupCompleteResponse {
  success: boolean;
  message: string;
  user: User;
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

    if (!response.user && response.owner) {
      response.user = response.owner;
    }
    return response;
  } catch (error: any) {
    throw error;
  }
}

export async function getMe() {
  try {
    const response = await api.get("auth/me");
    return response.data;
  } catch (error: any) {
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
    const response = await api.post("auth/link-phone/send-email-otp", data, {
      timeout: 30000, // 30 seconds for OTP requests
    });
    return response.data;
  } catch (error: any) {
    // Handle timeout specifically
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      throw new Error(
        "Request timed out. This may take longer due to external service delays. Please try again."
      );
    }
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
    throw error;
  }
}

export async function sendAddEmailOtp(data: { email: string }) {
  try {
    if (!data || !data.email) {
      throw new Error("Email is required");
    }
    const response = await api.post("auth/add-email/send-otp", data, {
      timeout: 30000, // 30 seconds for OTP requests
    });
    return response.data;
  } catch (error: any) {
    // Handle timeout specifically
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      throw new Error(
        "Request timed out. This may take longer due to external service delays. Please try again."
      );
    }
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
    throw error;
  }
}

/* ---------------- UNIFIED AUTH (NEW) ---------------- */
export async function signupInitiate(data: {
  name: string;
  phone: string;
  email: string;
}) {
  try {
    if (!data || !data.name || !data.phone || !data.email) {
      throw new Error("All fields are required");
    }
    const response = await api.post("auth/signup/initiate", data, {
      timeout: 30000, // 30 seconds for OTP requests
    });
    return response.data;
  } catch (error: any) {
    // Handle timeout specifically
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      throw new Error(
        "Request timed out. This may take longer due to external service delays. Please try again."
      );
    }
    throw error;
  }
}

export async function signupComplete(data: {
  name: string;
  phone: string;
  email: string;
  password: string;
  otp: string;
}): Promise<SignupCompleteResponse> {
  try {
    if (
      !data ||
      !data.name ||
      !data.phone ||
      !data.email ||
      !data.password ||
      !data.otp
    ) {
      throw new Error("All fields are required");
    }
    const response = await api.post<SignupCompleteResponse>(
      "auth/signup/complete",
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function loginInitiate(data: { phone: string; email: string }) {
  if (!data || !data.phone || !data.email) {
    throw new Error("Phone and email are required");
  }

  try {
    const response = await api.post("auth/login/initiate", data, {
      timeout: 30000, // 30 seconds for OTP requests
    });
    return response.data;
  } catch (error: any) {
    // Handle timeout specifically
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      throw new Error(
        "Request timed out. This may take longer due to external service delays. Please try again."
      );
    }

    // Network error - backend not reachable (only for actual connection failures)
    if (!error.response) {
      throw new Error("Something went wrong. Please reload the page.");
    }

    // Let the error handler process validation errors from backend
    throw error;
  }
}

export async function loginComplete(data: {
  phone: string;
  email: string;
  otp: string;
}) {
  try {
    if (!data || !data.phone || !data.email || !data.otp) {
      throw new Error("All fields are required");
    }
    const response = await api.post("auth/login/complete", data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

/* ---------------- PASSWORD-BASED AUTH ---------------- */
export async function loginWithPassword(data: {
  identifier: string;
  password: string;
}) {
  try {
    if (!data || !data.identifier || !data.password) {
      throw new Error("Email/phone and password are required");
    }
    const response = await api.post("auth/login", data);
    return response.data;
  } catch (error: any) {
    // Network/connection errors - no response from server
    if (!error.response) {
      throw new Error("Something went wrong. Please reload the page.");
    }
    // Let the error handler process the response
    throw error;
  }
}

export async function forgotPassword(email: string) {
  try {
    if (!email || !email.trim()) {
      throw new Error("Email is required");
    }
    const response = await api.post(
      "auth/forgot-password",
      { email },
      {
        timeout: 30000, // 30 seconds for email sending
      }
    );
    return response.data;
  } catch (error: any) {
    // Handle timeout specifically
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      throw new Error(
        "Request timed out. This may take longer due to external service delays. Please try again."
      );
    }
    if (!error.response) {
      throw new Error("Something went wrong. Please reload the page.");
    }
    // Show user-friendly error message
    const backendMessage = error.response?.data?.message || "";
    let userMessage = "Failed to send reset email. Please try again.";

    if (backendMessage.toLowerCase().includes("not found")) {
      userMessage = "No account found with this email.";
    }

    throw new Error(userMessage);
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    if (!token || !password) {
      throw new Error("Token and password are required");
    }
    const response = await api.post("auth/reset-password", { token, password });
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      throw new Error("Something went wrong. Please reload the page.");
    }
    // Show user-friendly error message
    const backendMessage = error.response?.data?.message || "";
    let userMessage = "Failed to reset password. Please try again.";

    if (
      backendMessage.toLowerCase().includes("expired") ||
      backendMessage.toLowerCase().includes("invalid")
    ) {
      userMessage =
        "Reset link is invalid or expired. Please request a new one.";
    }

    throw new Error(userMessage);
  }
}
