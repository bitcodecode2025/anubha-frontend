import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Testimonials from "@/components/home/Testimonials";
import HowItWorks from "@/components/home/HowItWorks";
import OnlineProgram from "@/components/home/OnlineProgram";
import BloodTestBooking from "@/components/home/BloodTestBooking";
import FAQSection from "@/components/home/FAQSection";
import NGOGallery from "@/components/NGOGallery";

export const metadata: Metadata = {
  title: "Home – Anubha Nutrition",
  description:
    "Welcome to Anubha Nutrition. Get personalized diet plans, nutrition consultations, and expert guidance for your wellness journey.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 pb-1">
      <Hero />
      <section
        id="about"
        className="px-6 sm:px-8 lg:px-16 py-12 bg-gradient-to-b from-white to-[#FAF6F0]/30"
      >
        <div className="max-w-4xl mx-auto w-full">
          <About />
        </div>
      </section>
      <Testimonials />
      <HowItWorks />
      <OnlineProgram />
      <BloodTestBooking />
      <section
        id="ngo-work"
        className="px-6 sm:px-8 lg:px-16 py-20 bg-gradient-to-b from-white to-emerald-50/30"
      >
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 text-center mb-4">
            Community & NGO Work
          </h2>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12 text-lg">
            A glimpse of the impact Dt. Anubha has created through dedicated
            community service, nutrition awareness programs, and social
            initiatives.
          </p>
          <NGOGallery />
        </div>
      </section>
      <FAQSection />
    </div>
  );
}
