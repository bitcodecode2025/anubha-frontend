"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBookingForm } from "../context/BookingFormContext";
import { createOrder, verifyPayment, getExistingOrder } from "@/lib/payment";
import {
  Loader2,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import PendingAppointments from "@/components/payment/PendingAppointments";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Safe toast wrapper that handles cross-origin frame errors
 * Defer toast calls to ensure they run in the main window context
 */
function safeToast(
  type: "success" | "error" | "loading",
  message: string,
  delay: number = 0
) {
  try {
    // Defer to next event loop to ensure we're in main window context
    setTimeout(() => {
      try {
        if (typeof window !== "undefined" && window.document) {
          if (type === "success") {
            toast.success(message);
          } else if (type === "error") {
            toast.error(message);
          } else {
            toast.loading(message);
          }
        }
      } catch (err) {
        console.error("[PAYMENT] Toast error (safe):", err);
        // Fallback: log to console if toast fails
        console.log(`[PAYMENT] ${type.toUpperCase()}: ${message}`);
      }
    }, delay);
  } catch (err) {
    console.error("[PAYMENT] Safe toast wrapper error:", err);
    console.log(`[PAYMENT] ${type.toUpperCase()}: ${message}`);
  }
}

export default function PaymentPage() {
  const { form, setForm, resetForm } = useBookingForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumingPayment, setResumingPayment] = useState(false);
  const [showPendingAppointments, setShowPendingAppointments] = useState(true); // Show by default
  const [errorType, setErrorType] = useState<
    "payment" | "network" | "validation" | "session" | "unknown"
  >("unknown");
  const razorpayLoaded = useRef(false);
  const paymentInitiatedRef = useRef(false); // Prevent double payment initiation
  const [paymentResponse, setPaymentResponse] = useState<any>(null); // Store payment response for verification

  /* -------------------------------------------------
      BLOCK DIRECT ACCESS & CHECK FOR PENDING APPOINTMENTS
  -------------------------------------------------- */
  useEffect(() => {
    if (!form.appointmentId || !form.slotId || !form.planSlug) {
      // If no current booking, show pending appointments
      setShowPendingAppointments(true);
      safeToast(
        "error",
        "Please complete the booking process first or continue with a pending appointment"
      );
      // Don't redirect immediately - let user see pending appointments
      return;
    }
  }, [form.appointmentId, form.slotId, form.planSlug, router]);

  /* -------------------------------------------------
      LOAD RAZORPAY SCRIPT
  -------------------------------------------------- */
  useEffect(() => {
    if (razorpayLoaded.current) return;

    // Check if document is available
    if (typeof window === "undefined" || !window.document) {
      console.error("[PAYMENT] Window or document not available");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("[PAYMENT] Razorpay script loaded successfully");
      razorpayLoaded.current = true;
      setIsRazorpayReady(true);
    };
    script.onerror = () => {
      console.error("[PAYMENT] Failed to load Razorpay script");
      safeToast(
        "error",
        "Failed to load payment gateway. Please refresh the page."
      );
      setIsRazorpayReady(false);
      setError("Payment gateway failed to load. Please refresh the page.");
      setErrorType("network");
      setShowPendingAppointments(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (err) {
        console.error("[PAYMENT] Script cleanup error:", err);
      }
    };
  }, []);

  /* -------------------------------------------------
      PROCESS PAYMENT VERIFICATION
      This runs in the main window context after payment
  -------------------------------------------------- */
  useEffect(() => {
    if (!paymentResponse) return;

    const processPayment = async () => {
      const response = paymentResponse;
      setPaymentResponse(null); // Clear state

      setProcessing(true);
      setError(null);

      try {
        console.log("[PAYMENT] Processing payment verification:", {
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          hasSignature: !!response.razorpay_signature,
        });

        // Verify payment on backend
        const verifyResponse = await verifyPayment({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });

        if (verifyResponse.success) {
          console.log("[PAYMENT] Payment verified successfully");

          if (verifyResponse.alreadyConfirmed) {
            safeToast(
              "success",
              "Payment already confirmed. Your appointment is confirmed."
            );
          } else {
            safeToast(
              "success",
              "Payment successful! Your appointment is confirmed."
            );
          }

          // Reset form and redirect to home after a short delay
          resetForm();
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          throw new Error(
            verifyResponse.error || "Payment verification failed"
          );
        }
      } catch (error: any) {
        console.error("[PAYMENT] Payment verification error:", error);
        const errorMsg =
          error?.response?.data?.error ||
          error?.message ||
          "Payment verification failed. Please contact support with your payment ID.";
        safeToast("error", errorMsg);
        setError(errorMsg);
        setErrorType("payment");
        setProcessing(false);
        paymentInitiatedRef.current = false; // Allow retry
        setShowPendingAppointments(true); // Show pending appointments on verification failure
      }
    };

    processPayment();
  }, [paymentResponse, router, resetForm]);

  /* -------------------------------------------------
      INITIALIZE RAZORPAY CHECKOUT
      Reusable function to start Razorpay payment
  -------------------------------------------------- */
  function startRazorpayPayment(order: {
    id: string;
    amount: number;
    currency: string;
  }) {
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      throw new Error("Payment gateway not configured");
    }

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded. Please refresh the page.");
    }

    // Initialize Razorpay checkout
    const options = {
      key: razorpayKeyId,
      amount: order.amount, // Already in paise from Razorpay
      currency: order.currency || "INR",
      name: "Nutriwell",
      description: form.planName || "Appointment Booking",
      order_id: order.id,
      handler: function (response: any) {
        // Store response in state instead of processing immediately
        // This avoids cross-origin frame access issues
        console.log("[PAYMENT] Payment success response received:", {
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          hasSignature: !!response.razorpay_signature,
        });

        // Defer state update to ensure we're back in main window context
        // This will trigger the useEffect that processes the payment
        setTimeout(() => {
          try {
            if (typeof window !== "undefined" && window.document) {
              setPaymentResponse(response);
            }
          } catch (err) {
            console.error("[PAYMENT] Handler state update error:", err);
          }
        }, 100);
      },
      prefill: {
        name: form.fullName || "",
        email: form.email || "",
        contact: form.mobile?.replace(/\D/g, "") || "",
      },
      theme: {
        color: "#10b981", // emerald-600
      },
      modal: {
        ondismiss: function () {
          console.log("[PAYMENT] Payment modal dismissed by user");
          // Defer state updates to main window context
          setTimeout(() => {
            try {
              if (typeof window !== "undefined" && window.document) {
                if (!processing) {
                  safeToast("error", "Payment cancelled", 0);
                }
                setProcessing(false);
                paymentInitiatedRef.current = false; // Allow retry
                setShowPendingAppointments(true); // Show pending appointments when cancelled
              }
            } catch (err) {
              console.error("[PAYMENT] Ondismiss error:", err);
            }
          }, 0);
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response: any) {
      console.error("[PAYMENT] Payment failed:", response);
      const errorDescription =
        response.error?.description ||
        response.error?.reason ||
        "Payment failed. Please try again.";

      // Defer toast and state updates to main window context
      setTimeout(() => {
        try {
          if (typeof window !== "undefined" && window.document) {
            safeToast("error", errorDescription, 0);
            setError(errorDescription);
            setErrorType("payment");
            setProcessing(false);
            paymentInitiatedRef.current = false; // Allow retry
            setShowPendingAppointments(true); // Show pending appointments on failure
          }
        } catch (err) {
          console.error("[PAYMENT] Payment failed handler error:", err);
        }
      }, 0);
    });

    // Open Razorpay checkout
    razorpay.open();
  }

  /* -------------------------------------------------
      CREATE ORDER AND INITIATE PAYMENT
  -------------------------------------------------- */
  async function initiatePayment() {
    // Prevent double-click/double-initiation
    if (paymentInitiatedRef.current || loading || processing) {
      return;
    }

    if (!form.appointmentId || !form.slotId || !form.planSlug) {
      const errorMsg =
        "Missing booking information. Please go back and try again.";
      safeToast("error", errorMsg);
      setError(errorMsg);
      return;
    }

    if (!isRazorpayReady) {
      const errorMsg =
        "Payment gateway is loading. Please wait a moment and try again.";
      safeToast("error", errorMsg);
      setError(errorMsg);
      return;
    }

    // Check for Razorpay key
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      const errorMsg =
        "Payment gateway not configured. Please contact support.";
      console.error("[PAYMENT] Razorpay key ID missing");
      safeToast("error", errorMsg);
      setError(errorMsg);
      return;
    }

    paymentInitiatedRef.current = true;
    setLoading(true);
    setError(null);
    setResumingPayment(false);

    try {
      console.log(
        "[PAYMENT] Creating order for appointment:",
        form.appointmentId
      );

      // Create order using existing appointment
      const orderResponse = await createOrder({
        appointmentId: form.appointmentId,
      });

      // Check if order already exists error
      if (
        !orderResponse.success &&
        orderResponse.error ===
          "Payment order already exists for this appointment."
      ) {
        console.log(
          "[PAYMENT] Order already exists, fetching existing order..."
        );
        setResumingPayment(true);
        safeToast("loading", "Resuming your previous payment attempt...", 0);

        // Fetch existing order
        const existingOrderResponse = await getExistingOrder(
          form.appointmentId
        );

        if (existingOrderResponse.success && existingOrderResponse.order) {
          console.log(
            "[PAYMENT] Existing order found:",
            existingOrderResponse.order.id
          );
          setOrderCreated(true);
          setLoading(false);
          setResumingPayment(false);

          // Resume payment with existing order
          startRazorpayPayment(existingOrderResponse.order);
          return;
        } else {
          // If we can't get existing order, show error
          throw new Error(
            existingOrderResponse.error ||
              "Failed to resume payment. Please try again."
          );
        }
      }

      // If order creation failed for other reasons
      if (!orderResponse.success || !orderResponse.order) {
        throw new Error(
          orderResponse.error || "Failed to create payment order"
        );
      }

      // Order created successfully
      const { order } = orderResponse;
      console.log("[PAYMENT] Order created:", {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });

      setOrderCreated(true);
      setLoading(false);

      // Start Razorpay payment
      startRazorpayPayment(order);
    } catch (error: any) {
      console.error("[PAYMENT] Payment initiation error:", error);

      // Determine error type
      let errorType:
        | "payment"
        | "network"
        | "validation"
        | "session"
        | "unknown" = "unknown";
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        errorType = "session";
      } else if (
        error?.response?.status === 400 ||
        error?.response?.status === 422
      ) {
        errorType = "validation";
      } else if (!error?.response || error?.code === "NETWORK_ERROR") {
        errorType = "network";
      } else {
        errorType = "payment";
      }

      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to initiate payment. Please try again.";
      safeToast("error", errorMsg);
      setError(errorMsg);
      setErrorType(errorType);
      paymentInitiatedRef.current = false; // Allow retry
      setLoading(false);
      setResumingPayment(false);
      setShowPendingAppointments(true); // Show pending appointments on error
    }
  }

  /* -------------------------------------------------
      HANDLE RESUME PAYMENT FROM PENDING APPOINTMENTS
  -------------------------------------------------- */
  const handleResumePayment = (appointmentId: string, orderId: string) => {
    // Update form context with the appointment ID
    setForm({
      ...form,
      appointmentId,
    });

    // Fetch order details and start payment
    getExistingOrder(appointmentId)
      .then((orderResponse) => {
        if (orderResponse.success && orderResponse.order) {
          setOrderCreated(true);
          setError(null);
          setShowPendingAppointments(false);
          startRazorpayPayment(orderResponse.order);
        } else {
          throw new Error(
            orderResponse.error || "Failed to fetch payment order"
          );
        }
      })
      .catch((error: any) => {
        console.error("[PAYMENT] Failed to resume payment:", error);
        safeToast(
          "error",
          error?.message || "Failed to resume payment. Please try again."
        );
        setError(error?.message || "Failed to resume payment");
      });
  };

  /* -------------------------------------------------
      UI RENDER
  -------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f9fcfa] to-[#f1f7f3] py-10 px-4 flex justify-center">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <CreditCard className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Complete Payment
          </h1>
          <p className="text-slate-600 text-sm">
            Secure payment powered by Razorpay
          </p>
        </div>

        {/* Booking Summary */}
        {form.planName && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-emerald-900 mb-2">
              Booking Summary
            </h3>
            <div className="space-y-1 text-sm text-emerald-700">
              <p>
                <span className="font-medium">Plan:</span> {form.planName}
              </p>
              {form.planPackageName && (
                <p>
                  <span className="font-medium">Package:</span>{" "}
                  {form.planPackageName}
                </p>
              )}
              <p>
                <span className="font-medium">Amount:</span> {form.planPrice}
              </p>
              {form.appointmentDate && (
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(form.appointmentDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
              {form.appointmentTime && (
                <p>
                  <span className="font-medium">Time:</span>{" "}
                  {form.appointmentTime}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resuming Payment Message */}
        {resumingPayment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm">
                Resuming your previous payment attempt...
              </p>
            </div>
          </div>
        )}

        {/* Error Message with Fallback Actions */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">
                  {errorType === "session" && "Session Expired"}
                  {errorType === "network" && "Network Error"}
                  {errorType === "validation" && "Validation Error"}
                  {errorType === "payment" && "Payment Failed"}
                  {errorType === "unknown" && "Error Occurred"}
                </p>
                <p className="text-sm text-red-700 mb-3">{error}</p>

                {/* Fallback Actions Based on Error Type */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {errorType === "session" && (
                    <button
                      onClick={() => {
                        router.push("/login");
                      }}
                      className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Login Again
                    </button>
                  )}
                  {errorType === "network" && (
                    <button
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Refresh Page
                    </button>
                  )}
                  {(errorType === "payment" || errorType === "unknown") && (
                    <>
                      <button
                        onClick={() => {
                          setError(null);
                          initiatePayment();
                        }}
                        className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry Payment
                      </button>
                      <button
                        onClick={() => {
                          router.push("/book/slot");
                        }}
                        className="text-xs px-3 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                      >
                        Change Slot
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setError(null);
                      setShowPendingAppointments(true);
                    }}
                    className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                  >
                    View Pending Appointments
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Appointments Section */}
        {showPendingAppointments && (
          <PendingAppointments onResumePayment={handleResumePayment} />
        )}

        {/* Payment Button */}
        <div className="space-y-4">
          <button
            onClick={initiatePayment}
            disabled={
              loading || processing || !isRazorpayReady || resumingPayment
            }
            className="w-full py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Payment...
              </>
            ) : loading || resumingPayment ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {resumingPayment
                  ? "Resuming Payment..."
                  : "Preparing Payment..."}
              </>
            ) : error ? (
              <>
                <RefreshCw className="w-5 h-5" />
                Retry Payment
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay {form.planPrice}
              </>
            )}
          </button>

          <button
            onClick={() => router.push("/book/slot")}
            disabled={processing || resumingPayment}
            className="w-full py-2 text-slate-600 hover:text-slate-800 text-sm disabled:opacity-50"
          >
            ← Back to Slot Selection
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            🔒 Your payment is secured by Razorpay. We do not store your card
            details.
          </p>
        </div>
      </div>
    </main>
  );
}
