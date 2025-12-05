import Hero from "@/components/Hero";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import OnlineProgram from "@/components/OnlineProgram";
import BloodTestBooking from "@/components/BloodTestBooking";
import FAQSection from "@/components/FAQSection";

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
      <FAQSection />
    </div>
  );
}
