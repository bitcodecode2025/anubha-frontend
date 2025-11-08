"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What do you expect in Anubha’s Nutrition Clinic?",
    a: "Anubha’s Nutrition Clinic is a healthcare facility where dietitians provide personalized nutrition counseling and guidance to individuals, groups, or communities.",
  },
  {
    q: "What services does Anubha’s Nutrition Clinic offer?",
    a: "Anubha’s Nutrition Clinic offers a range of services including nutrition assessment, personalized meal planning, weight loss programs, medical management, food allergy management, wedding glow plans, baby & toddler food guidance, and child & old age nutrition plans.",
  },
  {
    q: "Who can benefit from visiting a dietitian clinic?",
    a: "Anyone! Whether managing a chronic condition, looking to lose weight, or simply aiming to improve overall health, everyone can benefit from professional nutrition guidance.",
  },
  {
    q: "What can I expect during my first visit?",
    a: "Your first visit includes a detailed discussion of your dietary habits, health status, and lifestyle. The dietitian will create a personalized plan aligned with your health goals.",
  },
  {
    q: "How long does a typical dietitian appointment last?",
    a: "Appointments usually last around 30–40 minutes, depending on the nature of the consultation.",
  },
  {
    q: "How often should I visit a dietitian clinic?",
    a: "The frequency of visits depends on your health goals. Some clients prefer monthly check-ins, while others come once every few months for follow-ups.",
  },
  {
    q: "Can I get a personalized meal plan?",
    a: "Yes, personalized meal plans are crafted to your unique needs, preferences, and medical conditions.",
  },
  {
    q: "How will the consultation process work if I don’t live in Pune?",
    a: "Consultations are available both in-person and online via phone, Skype, FaceTime, or email — making it convenient for clients anywhere in the world.",
  },
  {
    q: "What happens once I make the payment?",
    a: "Once payment is made, an appointment schedule and a ‘Getting to Know You’ form will be shared. No tests are required unless you wish to share existing medical reports.",
  },
  {
    q: "I travel a lot. How would that be accommodated?",
    a: "Your plan will be designed keeping your travel lifestyle in mind, with guidance on eating smart while on the move or abroad.",
  },
  {
    q: "I work in different shifts. Will the plan account for that?",
    a: "Yes. The diet plan will be customized for your day/night shifts, ensuring nutritional needs are met regardless of timing or food availability.",
  },
  {
    q: "Will exercise advice also be included in the package?",
    a: "Yes. Based on your fitness levels, an appropriate exercise plan will be suggested — whether gym, yoga, or daily movement routines.",
  },
  {
    q: "What kind of exercise is recommended?",
    a: "Any enjoyable activity — strength training, yoga, swimming, cycling, or dancing — is encouraged. You’ll also learn exercise fundamentals for long-term fitness.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="w-full bg-neutral-50 dark:bg-neutral-950 py-20 px-6 md:px-10 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm"
            >
              <button
                className="w-full flex justify-between items-center text-left px-6 py-4 font-medium text-gray-800 dark:text-gray-100"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
