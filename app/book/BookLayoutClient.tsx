"use client";

import React from "react";
import MasterStepper from "./components/MasterStepper";
import { BookingFormProvider } from "./context/BookingFormContext";

export default function BookLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingFormProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#f9fcfa] to-[#f6fbf9] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <MasterStepper />
          <div>{children}</div>
        </div>
      </div>
    </BookingFormProvider>
  );
}
