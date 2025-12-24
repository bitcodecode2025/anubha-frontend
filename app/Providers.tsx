"use client";

import { BookingFormProvider } from "./book/context/BookingFormContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BookingFormProvider>
      {children}
      {/* Toast notifications - must be rendered for toasts to work */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#1e293b",
            borderRadius: "8px",
            padding: "12px 16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontSize: "14px",
            maxWidth: "500px",
          },
          error: {
            duration: 8000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            },
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              background: "#d1fae5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
            },
          },
        }}
      />
    </BookingFormProvider>
  );
}
