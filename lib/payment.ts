import api from "./api";

export interface CreateOrderResponse {
  success: boolean;
  order?: {
    id: string;
    amount: number; // Amount in paise
    currency: string;
    receipt: string;
    status: string;
  };
  appointmentId?: string;
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  alreadyConfirmed?: boolean;
  error?: string;
  timeout?: boolean; // Indicates if error was due to timeout (webhook may still process payment)
}

export interface GetExistingOrderResponse {
  success: boolean;
  order?: {
    id: string;
    amount: number; // Amount in paise
    currency: string;
    receipt: string;
    status: string;
  };
  appointmentId?: string;
  error?: string;
  shouldCreateNew?: boolean; // Backend signals: create new order (expired/invalid)
  expired?: boolean; // Backend signals: order expired
}

/**
 * Create a Razorpay order for an existing appointment
 */
export async function createOrder(data: {
  appointmentId: string; // Required: appointment ID from booking flow
}): Promise<CreateOrderResponse> {
  try {
    if (!data.appointmentId) {
      return {
        success: false,
        error: "Appointment ID is required",
      };
    }

    console.log(
      "[API] Creating payment order for appointment:",
      data.appointmentId
    );

    const res = await api.post<CreateOrderResponse>("payment/order", {
      appointmentId: data.appointmentId,
    });

    if (!res.data.success || !res.data.order) {
      return {
        success: false,
        error: res.data.error || "Failed to create payment order",
      };
    }

    console.log("[API] Order created successfully:", {
      orderId: res.data.order.id,
      amount: res.data.order.amount,
    });

    return res.data;
  } catch (error: any) {
    console.error("[API] Order creation error:", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    // Extract error message from response
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create payment order. Please try again.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get existing payment order for an appointment
 * Used to resume payment if order already exists
 */
export async function getExistingOrder(
  appointmentId: string
): Promise<GetExistingOrderResponse> {
  try {
    if (!appointmentId) {
      return {
        success: false,
        error: "Appointment ID is required",
      };
    }

    console.log("[API] Getting existing order for appointment:", appointmentId);

    const res = await api.get<GetExistingOrderResponse>(
      `payment/existing-order/${appointmentId}`
    );

    if (!res.data.success || !res.data.order) {
      return {
        success: false,
        error: res.data.error || "No existing order found",
      };
    }

    console.log("[API] Existing order found:", {
      orderId: res.data.order.id,
      amount: res.data.order.amount,
    });

    return res.data;
  } catch (error: any) {
    console.error("[API] Get existing order error:", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    // Check if backend says we should create new order (expired/invalid order)
    const shouldCreateNew = error?.response?.data?.shouldCreateNew === true;
    const expired = error?.response?.data?.expired === true;

    // Extract error message from response
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to get existing order";

    return {
      success: false,
      error: errorMessage,
      shouldCreateNew, // Pass this flag to frontend
      expired, // Pass this flag to frontend
    };
  }
}

/**
 * Verify Razorpay payment signature and confirm appointment
 */
export async function verifyPayment(data: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<VerifyPaymentResponse> {
  try {
    if (!data.orderId || !data.paymentId || !data.signature) {
      return {
        success: false,
        error: "Missing payment verification data",
      };
    }

    console.log("[API] Verifying payment:", {
      orderId: data.orderId,
      paymentId: data.paymentId,
      hasSignature: !!data.signature,
    });

    const res = await api.post<VerifyPaymentResponse>("payment/verify", {
      orderId: data.orderId,
      paymentId: data.paymentId,
      signature: data.signature,
    });

    if (!res.data.success) {
      return {
        success: false,
        error: res.data.error || "Payment verification failed",
      };
    }

    console.log("[API] Payment verified successfully");

    return res.data;
  } catch (error: any) {
    console.error("[API] Payment verification error:", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      code: error?.code,
    });

    // CRITICAL: Detect timeout errors specifically
    // Timeout means verification is pending - webhook may still process it
    const isTimeout =
      error?.code === "ECONNABORTED" ||
      error?.message?.includes("timeout") ||
      error?.message?.includes("TIMEOUT") ||
      error?.response?.status === 503;

    if (isTimeout) {
      // Timeout is not a failure - webhook may still process payment
      return {
        success: false,
        error: "VERIFICATION_TIMEOUT", // Special error code for timeout
        timeout: true,
      };
    }

    // Extract error message from response
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Payment verification failed. Please contact support.";

    return {
      success: false,
      error: errorMessage,
      timeout: false,
    };
  }
}
