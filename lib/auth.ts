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
    console.error(
      "[API] Signup Initiate Error:",
      error?.response?.data || error?.message
    );
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
    console.error(
      "[API] Signup Complete Error:",
      error?.response?.data || error?.message
    );
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

    // Network error - backend not reachable
    if (!error.response) {
      throw new Error(
        "Cannot connect to server. Please check if backend is running."
      );
    }

    // API returned error
    const message = error.response?.data?.message || "Failed to send OTP";
    throw new Error(message);
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
    console.error(
      "[API] Login Complete Error:",
      error?.response?.data || error?.message
    );
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
    if (!error.response) {
      throw new Error(
        "Cannot connect to server. Please check if backend is running."
      );
    }
    const message = error.response?.data?.message || "Login failed";
    throw new Error(message);
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
      throw new Error(
        "Cannot connect to server. Please check if backend is running."
      );
    }
    const message =
      error.response?.data?.message || "Failed to send reset email";
    throw new Error(message);
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
      throw new Error(
        "Cannot connect to server. Please check if backend is running."
      );
    }
    const message = error.response?.data?.message || "Failed to reset password";
    throw new Error(message);
  }
}
