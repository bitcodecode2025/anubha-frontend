import Hero from "@/components/Hero";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import OnlineProgram from "@/components/OnlineProgram";
import FAQSection from "@/components/FAQSection";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 pb-1">
      <Hero />
      <section id="about" className="px-6 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto w-full">
          <About />
        </div>
      </section>
      <Testimonials />
      <HowItWorks />
      <OnlineProgram />
      <FAQSection />
    </div>
  );
}
