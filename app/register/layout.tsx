import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register – Anubha Nutrition",
  description:
    "Create your Anubha Nutrition account to start your personalized nutrition and wellness journey.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
