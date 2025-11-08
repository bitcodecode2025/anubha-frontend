"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  slug: string;
  fee: string;
}

export default function ServiceCard({
  title,
  description,
  image,
  slug,
  fee,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
    >
      {/* Image */}
      <div className="flex justify-center items-center h-36 mb-5 bg-gray-50 dark:bg-neutral-800 rounded-lg overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
          {description}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Consultation Fee:{" "}
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {fee}
          </span>
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-auto">
        <Link
          href={`/book-appointment?service=${slug}`}
          className="flex-1 rounded-full bg-emerald-600 text-white py-2.5 text-sm font-medium text-center hover:opacity-90 transition"
        >
          Book Appointment
        </Link>
        <Link
          href={`/explore-plans/${slug}`}
          className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-2.5 text-sm font-medium text-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
        >
          Explore Plans
        </Link>
      </div>
    </motion.div>
  );
}
