"use client";

import { motion } from "framer-motion";
import { useRef, useState, useLayoutEffect } from "react";
import { Plan } from "@/lib/constants/plan";
import { useBookingForm } from "@/app/book/context/BookingFormContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import PatientSelectionModal from "@/components/doctor-notes/PatientSelectionModal";
import toast from "react-hot-toast";
import { createAppointment } from "@/lib/appointment";

export default function PlanCard({
  title,
  slug,
  description,
  howItWorks,
  packages,
  terms,
  note,
  image,
}: Plan) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  const { setForm, resetForm } = useBookingForm();
  const { user } = useAuth();
  const router = useRouter();

  // dynamic height refs
  const contentRef = useRef<HTMLParagraphElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLUListElement>(null);

  const [descHeight, setDescHeight] = useState(100);
  const [howHeight, setHowHeight] = useState(0);
  const [termsHeight, setTermsHeight] = useState(0);

  useLayoutEffect(() => {
    setDescHeight(isExpanded ? contentRef.current?.scrollHeight || 120 : 100);
  }, [isExpanded, description]);

  useLayoutEffect(() => {
    setHowHeight(howOpen ? howRef.current?.scrollHeight || 50 : 0);
  }, [howOpen, howItWorks]);

  useLayoutEffect(() => {
    setTermsHeight(termsOpen ? termsRef.current?.scrollHeight || 50 : 0);
  }, [termsOpen, terms]);

  /* -------------------------------------------------
      HANDLE BUY PLAN (Production Safe)
  --------------------------------------------------*/
  function handleBuyPlan(pkg: any) {
    // Check if user is authenticated
    if (!user) {
      toast.error("Please login to book an appointment");
      router.push("/login");
      return;
    }

    const priceRaw = Number(pkg.price.replace(/[₹, ]/g, "") || 0);

    // Store booking details
    const bookingData = {
      planSlug: slug,
      planName: title,
      planPackageName: pkg.name,
      planPackageDuration: pkg.duration || null,
      planPrice: pkg.price,
      planPriceRaw: priceRaw,
    };

    // Set form data immediately so it's available even if user clicks "Add Patient"
    setForm(bookingData);
    setPendingBooking(bookingData);
    setIsModalOpen(true);
  }

  /* -------------------------------------------------
      HANDLE PATIENT SELECTION
  --------------------------------------------------*/
  async function handlePatientSelected(patientId: string) {
    if (pendingBooking) {
      setIsModalOpen(false);

      // Set form data with patientId
      setForm({
        ...pendingBooking,
        patientId,
      });

      // Create appointment with PENDING status (similar to recall flow)
      try {
        const { createAppointment } = await import("@/lib/appointment");
        // Extract price from planPriceRaw if available, otherwise parse from planPrice string
        let planPrice: number;
        if (pendingBooking.planPriceRaw && pendingBooking.planPriceRaw > 0) {
          planPrice = pendingBooking.planPriceRaw;
        } else if (pendingBooking.planPrice) {
          // Parse price from string like "₹6,800 per session" or "₹3,000" or "₹1,000"
          const priceMatch = pendingBooking.planPrice.match(/₹?\s*([\d,]+)/);
          planPrice = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : 0;

          if (!planPrice || planPrice === 0) {
            console.error(
              `[PlanCard] Failed to parse price from: "${pendingBooking.planPrice}"`
            );
            toast.error("Invalid plan price. Please try again.");
            return;
          }
        } else {
          toast.error("Plan price is missing. Please try again.");
          return;
        }

        // planDuration is required - use "40 min" for general consultation if not provided
        const planDuration = pendingBooking.planPackageDuration || "40 min";

        const appointmentResponse = await createAppointment({
          patientId,
          planSlug: pendingBooking.planSlug,
          planName: pendingBooking.planName,
          planPrice: planPrice, // Correctly parsed from planPriceRaw or planPrice string
          planDuration: planDuration, // Always provide a duration (required field)
          planPackageName: pendingBooking.planPackageName || undefined,
          appointmentMode: "IN_PERSON", // Default, can be changed in slot page
        });

        // Store appointmentId in form context
        setForm({
          ...pendingBooking,
          patientId,
          appointmentId: appointmentResponse.data.id,
        });

        // For weight loss plan, redirect to user-details (has different measurement form)
        // For other plans, redirect to recall page since patient already exists
        if (pendingBooking.planSlug === "weight-loss") {
          router.push("/book/user-details");
        } else {
          router.push("/book/recall");
        }
      } catch (error: any) {
        console.error("Failed to create appointment:", error);
        toast.error(
          error?.response?.data?.message ||
            "Failed to create appointment. Please try again."
        );
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
        flex flex-col justify-between 
        bg-white 
        border border-[#dfe7dd] 
        rounded-3xl 
        border-1
        border-green-800
        p-6 sm:p-8 
        shadow-[0_3px_20px_rgba(30,80,60,0.08)] 
        hover:shadow-[0_4px_25px_rgba(30,80,60,0.12)]
        transition-all duration-500 
        hover:-translate-y-1 
        w-full 
        min-h-[480px] md:min-h-[520px]
      "
    >
      <div className="flex flex-col flex-grow">
        {/* Image Section */}
        {image && (
          <div className="relative w-full h-48 sm:h-56 md:h-64 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                // Fallback to a gradient background if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.className +=
                    " bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100";
                }
              }}
            />
            {/* Overlay gradient for better text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-2xl font-semibold text-slate-900 mb-3">{title}</h3>

        {/* Description */}
        <div className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          <motion.div
            style={{
              overflow: "hidden",
              pointerEvents: isExpanded ? "auto" : "none",
              height: isExpanded ? descHeight : 100,
              transition: "height 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <p ref={contentRef} className="whitespace-pre-line pb-2">
              {description}
            </p>
          </motion.div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#318a63] font-medium text-sm mt-2 hover:underline"
          >
            {isExpanded ? "Read less ▲" : "Read more ▼"}
          </button>
        </div>

        {/* Note */}
        {note && (
          <div className="bg-[#f1fbf4] border border-[#d5f0df] text-[#1b5131] text-xs sm:text-sm px-4 py-2 rounded-lg mb-6 leading-snug">
            {note}
          </div>
        )}

        {/* Packages */}
        {packages?.length > 0 && (
          <div className="space-y-4 mb-6">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="
                border border-[#e0ece5] 
                rounded-xl 
                p-5 
                flex flex-col sm:flex-row 
                sm:items-center 
                sm:justify-between 
                bg-[#fafdfa] 
                hover:bg-[#f5fbf8]
                transition-all
              "
              >
                <div className="flex-1">
                  <h4 className="text-[#1b5131] font-semibold text-base sm:text-lg">
                    {pkg.name}
                  </h4>
                  <p className="text-slate-600 text-sm mt-1">{pkg.details}</p>
                  {pkg.duration && (
                    <p className="text-slate-500 text-xs mt-0.5">
                      Duration: {pkg.duration}
                    </p>
                  )}
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-right">
                  <p className="text-[#318a63] font-bold text-base sm:text-lg">
                    {pkg.price}
                  </p>

                  <button
                    onClick={() => handleBuyPlan(pkg)}
                    className="
                      inline-block rounded-full 
                      bg-gradient-to-r from-[#7fb77e] via-[#6fbb9c] to-[#64a0c8] 
                      text-white px-6 py-2 mt-2 
                      text-sm sm:text-base 
                      font-semibold shadow-md 
                      hover:shadow-lg hover:scale-[1.03] 
                      active:scale-[0.97] 
                      transition-all duration-300 
                      w-full sm:w-auto
                    "
                  >
                    Buy Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        {howItWorks && (
          <div className="mt-4 border-t border-[#e0ece5] pt-4">
            <button
              onClick={() => setHowOpen(!howOpen)}
              className="flex items-center justify-between text-sm sm:text-base text-[#1b5131] font-semibold w-full"
            >
              How it works
              <span
                className={`transition-transform duration-300 ${
                  howOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <motion.div
              style={{
                overflow: "hidden",
                pointerEvents: howOpen ? "auto" : "none",
                height: howOpen ? howHeight : 0,
                transition: "height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div
                ref={howRef}
                className="text-slate-600 text-sm sm:text-base mt-2 whitespace-pre-line pb-2"
              >
                {howItWorks}
              </div>
            </motion.div>
          </div>
        )}

        {/* Terms */}
        {terms && terms.length > 0 && (
          <div className="mt-4 border-t border-[#e0ece5] pt-4">
            <button
              onClick={() => setTermsOpen(!termsOpen)}
              className="flex items-center justify-between text-sm sm:text-base text-[#1b5131] font-semibold w-full"
            >
              Terms & Conditions
              <span
                className={`transition-transform duration-300 ${
                  termsOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <motion.div
              style={{
                overflow: "hidden",
                pointerEvents: termsOpen ? "auto" : "none",
                height: termsOpen ? termsHeight : 0,
                transition: "height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <ul
                ref={termsRef}
                className="list-disc ml-5 mt-2 text-slate-600 text-sm sm:text-base space-y-1 pb-2"
              >
                {terms.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}
      </div>

      {/* Patient Selection Modal */}
      <PatientSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPatient={handlePatientSelected}
      />
    </motion.div>
  );
}
