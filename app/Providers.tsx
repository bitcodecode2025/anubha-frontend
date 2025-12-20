"use client";

import { SessionProvider } from "next-auth/react";
import { BookingFormProvider } from "./book/context/BookingFormContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BookingFormProvider>{children}</BookingFormProvider>
    </SessionProvider>
  );
}
