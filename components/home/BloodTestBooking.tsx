"use client";

import { motion } from "framer-motion";
import { FlaskConical, CheckCircle2, ExternalLink } from "lucide-react";

export default function BloodTestBooking() {
  const handleBookNow = () => {
    window.open(
      "https://microdsa.thyrocare.com/user/dashboard?dsaId=97KBD85S8A",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section
      className="w-full py-12 sm:py-16 md:py-20 px-6 sm:px-8 lg:px-16 bg-linear-to-b from-[#E8F5E9] via-[#F1F8E9] to-white"
      aria-label="Book Lab Test with Anubha's Nutrition Clinic"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="
            bg-white 
            border-2 border-[#D4C4B0] 
            rounded-3xl 
            p-6 sm:p-8 md:p-10 
            shadow-[0_4px_20px_rgba(30,80,60,0.08)] 
            hover:shadow-[0_6px_30px_rgba(30,80,60,0.12)]
            transition-all duration-500
          "
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg"
            >
              <FlaskConical className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-800 mb-3">
              Book your lab test with Anubha's Nutrition Clinic
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Blood tests powered by the trusted brand{" "}
              <span className="font-semibold text-emerald-700">Thyrocare</span>
            </p>
          </div>

          {/* Steps Section */}
          <div className="mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-6 text-center">
              Steps to Book:
            </h3>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#f1fbf4] border border-[#d5f0df]"
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium">
                    Tap the "Book Now" button to open the test booking page.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#f1fbf4] border border-[#d5f0df]"
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium">
                    Select your desired test package.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#f1fbf4] border border-[#d5f0df]"
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-medium">
                    Apply the{" "}
                    <span className="font-semibold text-emerald-700">
                      20% discount code
                    </span>{" "}
                    at checkout.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Exclusive Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mb-8 p-4 rounded-xl bg-[#fff8e1] border-2 border-[#ffd54f] text-center"
          >
            <p className="text-slate-800 font-medium text-sm sm:text-base">
              ⭐ This booking link is exclusively for Anubha's Nutrition Clinic
              clients.
            </p>
          </motion.div>

          {/* Book Now Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <motion.button
              onClick={handleBookNow}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                inline-flex items-center gap-3
                rounded-full 
                bg-gradient-to-r from-[#7fb77e] via-[#6fbb9c] to-[#64a0c8] 
                text-white 
                px-8 sm:px-10 md:px-12 
                py-4 sm:py-5 
                text-base sm:text-lg md:text-xl 
                font-semibold 
                shadow-lg 
                hover:shadow-xl 
                hover:brightness-105 
                transition-all duration-300
              "
              aria-label="Book your lab test with Thyrocare"
            >
              <span>Book Now</span>
              <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
