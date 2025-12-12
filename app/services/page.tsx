"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import PlanCard from "@/components/home/PlanCard";
import { plans } from "@/lib/constants/plan";
import { useBookingForm } from "@/app/book/context/BookingFormContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import PatientSelectionModal from "@/components/doctor-notes/PatientSelectionModal";
import toast from "react-hot-toast";

const GENERAL_CONSULTATION = {
  title: "General Consultation",
  description:
    "A complete one-on-one session to assess your goals, habits, and lifestyle. Get personalized nutrition advice and a roadmap to start your wellness journey.",
  price: 1000,
  image: "/images/services/general-consult.webp",
};

const TYPING_INTERVAL_MS = 25;

export default function ServicesPage() {
  const [typedText, setTypedText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const prefersReducedMotion = useReducedMotion();
  const { setForm, resetForm } = useBookingForm();
  const { user, loading } = useAuth();
  const router = useRouter();

  const fullText =
    "Explore our core consultation service designed to guide your journey towards balanced nutrition and wellness.";

  /* -----------------------------------------
        TYPEWRITER EFFECT
  -----------------------------------------*/
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedText(fullText);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedText(fullText.slice(0, index));

      if (index >= fullText.length) clearInterval(interval);
    }, TYPING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fullText, prefersReducedMotion]);

  /* -----------------------------------------
        FIXED: General Consultation Handler
  -----------------------------------------*/
  function handleGeneralConsultation() {
    // Check if user is authenticated
    if (!user) {
      toast.error("Please login to book an appointment");
      router.push("/login");
      return;
    }

    // Store booking details
    const bookingData = {
      planSlug: "general-consultation",
      planName: "General Consultation",
      planPrice: "₹1,000",
      planPriceRaw: 1000,
      planPackageName: null,
      planPackageDuration: null,
    };

    // Set form data immediately so it's available even if user clicks "Add Patient"
    setForm(bookingData);
    setPendingBooking(bookingData);
    setIsModalOpen(true);
  }

  /* -----------------------------------------
        Handle Patient Selection
  -----------------------------------------*/
  function handlePatientSelected(patientId: string) {
    if (pendingBooking) {
      setIsModalOpen(false);
      // Set form data with patientId (don't reset to avoid redirect issues)
      setForm({
        ...pendingBooking,
        patientId,
      });
      // For weight loss plan, redirect to user-details (has different measurement form)
      // For other plans, redirect to recall page since patient already exists
      if (pendingBooking.planSlug === "weight-loss") {
        router.push("/book/user-details");
      } else {
        router.push("/book/recall");
      }
    }
  }

  /* -----------------------------------------
        UI
  -----------------------------------------*/
  return (
    <main
      className="
        relative 
        min-h-screen 
        py-24 
        px-5 sm:px-8 lg:px-16 
        overflow-x-hidden 
        overflow-y-visible 
        bg-linear-to-b from-[#f9fcfa] via-[#f8fdfb] to-[#f6fbf9]
      "
    >
      {/* Background Glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-[#dff3e6]/60 blur-3xl" />
        <div className="absolute top-[45%] left-0 h-72 w-72 rounded-full bg-[#e2efff]/60 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-56 w-56 rounded-full bg-[#fef3e6]/60 blur-3xl" />
      </motion.div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 text-center md:text-left"
        >
          Services
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-slate-600 mb-14 text-base sm:text-lg max-w-3xl mx-auto md:mx-0 text-center md:text-left font-medium"
        >
          {typedText}
          {!prefersReducedMotion && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[6px] h-[20px] bg-[#7fb77e] ml-1 align-middle"
            />
          )}
        </motion.p>

        {/* General Consultation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="
            bg-white/95 
            border border-[#dfe7dd] 
            rounded-3xl 
            p-0
            mb-20 
            shadow-[0_3px_25px_rgba(30,80,60,0.08)] 
            backdrop-blur-sm 
            w-full 
            max-w-3xl 
            mx-auto 
            overflow-hidden
            hover:shadow-[0_4px_30px_rgba(30,80,60,0.12)] 
            transition-all duration-500
          "
        >
          {/* Image Section */}
          {GENERAL_CONSULTATION.image && (
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-linear-to-br from-emerald-50 to-teal-50">
              <img
                src={GENERAL_CONSULTATION.image}
                alt={GENERAL_CONSULTATION.title}
                className="w-full h-full object-cover  md:object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  // Fallback to a gradient background if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.parentElement) {
                    target.parentElement.className +=
                      " bg-linear-to-br from-emerald-100 via-teal-100 to-cyan-100";
                  }
                }}
              />
              {/* Overlay gradient for better text readability if needed */}
              <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Content Section */}
          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-slate-900">
                {GENERAL_CONSULTATION.title}
              </h2>

              <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
                {GENERAL_CONSULTATION.description}
              </p>

              <p className="text-[#318a63] text-lg sm:text-xl font-bold mt-4">
                ₹{GENERAL_CONSULTATION.price.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-5 md:mt-0 flex justify-center md:justify-end">
              <button
                onClick={handleGeneralConsultation}
                aria-label="Book general consultation appointment"
                className="
                  inline-block 
                  rounded-full 
            bg-linear-to-r 
                  from-[#7fb77e] via-[#6fbb9c] to-[#64a0c8] 
                  text-white 
                  px-8 py-3 
                  text-sm sm:text-base 
                  font-semibold 
                  shadow-md 
                  hover:shadow-lg 
                  hover:scale-[1.03] 
                  active:scale-95 
                  transition-all duration-300
                "
              >
                Book Appointment
              </button>
            </div>
          </div>
        </motion.div>

        {/* Plans Section */}
        <section className="mt-10 sm:mt-16 relative z-1000">
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-semibold text-center text-slate-900 mb-14"
          >
            Our Nutrition & Wellness Plans
          </motion.h2>

          {plans.length === 0 ? (
            <p className="text-center text-slate-500">
              Plans are currently unavailable. Please check back soon.
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="
                grid 
                grid-cols-1 
                md:grid-cols-2 
                gap-10 
                justify-items-center
                items-start
              "
            >
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-full max-w-lg"
                >
                  <PlanCard {...plan} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>

      {/* Patient Selection Modal */}
      <PatientSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPatient={handlePatientSelected}
      />
    </main>
  );
}
