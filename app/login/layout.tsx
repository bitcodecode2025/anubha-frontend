import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login – Anubha Nutrition",
  description:
    "Sign in to your Anubha Nutrition account to manage your appointments, diet plans, and wellness journey.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
