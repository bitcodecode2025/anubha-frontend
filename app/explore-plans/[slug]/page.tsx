"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { plans } from "@/app/explore-plans/data";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ExplorePlanPage() {
  const { slug } = useParams();
  const plan = plans.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!plan) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Plan Not Found
        </h1>
        <Link
          href="/services"
          className="mt-3 text-emerald-600 hover:underline font-medium"
        >
          ← Back to Services
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {plan.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg whitespace-pre-line">
            {plan.longDescription.trim()}
          </p>
        </motion.div>

        {/* If plan has multiple packages */}
        {plan.packages && plan.packages.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {plan.packages.map((pkg) => (
              <motion.div
                key={pkg.slug}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                    {pkg.name}
                  </h2>
                  {pkg.duration && (
                    <p className="text-sm text-gray-500 mb-3">{pkg.duration}</p>
                  )}
                  <p className="text-emerald-600 dark:text-emerald-400 text-xl font-bold mb-4">
                    {pkg.price}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-5">
                    {pkg.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/book-appointment?plan=${pkg.slug}`}
                  className="rounded-full bg-emerald-600 text-white py-2.5 text-sm font-medium text-center hover:opacity-90 transition mt-auto"
                >
                  Buy Plan
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          // Single plan (no packages)
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-8 text-center"
          >
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-3">
              {plan.name}
            </h2>
            {plan.price && (
              <p className="text-emerald-600 dark:text-emerald-400 text-2xl font-bold mb-6">
                {plan.price}
              </p>
            )}
            {plan.features && (
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm mb-8 max-w-md mx-auto text-left">
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
            <Link
              href={`/book-appointment?plan=${plan.slug}`}
              className="inline-block rounded-full bg-emerald-600 text-white px-8 py-3 text-base font-medium hover:opacity-90 transition"
            >
              Buy Plan
            </Link>
          </motion.div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="text-emerald-600 hover:underline font-medium"
          >
            ← Back to Services
          </Link>
        </div>
      </div>
    </main>
  );
}
