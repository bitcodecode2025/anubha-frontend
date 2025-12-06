import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Testimonials from "@/components/home/Testimonials";
import HowItWorks from "@/components/home/HowItWorks";
import OnlineProgram from "@/components/home/OnlineProgram";
import BloodTestBooking from "@/components/home/BloodTestBooking";
import FAQSection from "@/components/home/FAQSection";

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
