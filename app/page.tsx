import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Home – Anubha Nutrition",
  description:
    "Welcome to Anubha Nutrition. Get personalized diet plans, nutrition consultations, and expert guidance for your wellness journey.",
};

export default function HomePage() {
  return <HomePageClient />;
}
