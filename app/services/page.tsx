"use client";

import { motion } from "framer-motion";
import { services } from "./data";
import ServiceCard from "@/components/ServiceCard";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Services
        </motion.h1>

        <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg">
          Explore our core consultation services designed to guide your journey
          towards balanced nutrition and wellness.
        </p>

        {/* Consultation Base Fee Section */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Consultation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Standard base fee for a personalized nutrition consultation.
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 text-xl font-bold mt-3">
            ₹1000
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.slug} {...service} />
          ))}
        </div>
      </div>
    </main>
  );
}
