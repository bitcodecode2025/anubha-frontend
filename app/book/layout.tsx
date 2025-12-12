import type { Metadata } from "next";
import BookLayoutClient from "./BookLayoutClient";

export const metadata: Metadata = {
  title: "Book Appointment – Anubha Nutrition",
  description:
    "Book your personalized nutrition consultation. Complete your booking by providing details, selecting a time slot, and confirming your appointment.",
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BookLayoutClient>{children}</BookLayoutClient>;
}
