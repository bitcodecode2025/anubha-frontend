import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services – Anubha Nutrition",
  description:
    "Explore our comprehensive nutrition services including weight loss plans, medical nutrition management, kids nutrition, and specialized wellness programs.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
