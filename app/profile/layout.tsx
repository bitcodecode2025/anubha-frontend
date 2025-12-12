import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile – Anubha Nutrition",
  description:
    "Manage your profile, view appointments, track your nutrition journey, and access your personalized diet plans.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
