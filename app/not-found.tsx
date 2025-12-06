"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF6F0] via-[#F5F1EB] to-[#E8E0D5] px-4 py-12">
      <div className="max-w-5xl w-full text-center">
        {/* Image Container */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative w-full max-w-3xl h-[400px] sm:h-[500px] md:h-[600px]">
            <Image
              src="/images/fruits/not_found_page.png"
              alt="404 Page Not Found - Construction worker looking confused"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#3a6a39] mb-4">
            404 - Page Not Found
          </h1>
          <p className="text-lg sm:text-xl text-[#5a5a5a] max-w-2xl mx-auto leading-relaxed">
            Oops! The page you're looking for seems to have wandered off. Don't
            worry, let's get you back on track to your wellness journey!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="px-8 py-4 bg-gradient-to-r from-[#47d644] via-[#62d6a4] to-[#3a6a39] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                🏠 Go to Home Page
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/services"
                className="px-8 py-4 bg-[#E8E0D5] border-2 border-[#3a6a39] text-[#3a6a39] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-[#F5F1EB] text-lg"
              >
                📋 Browse Services
              </Link>
            </motion.div>
          </div>

          {/* Additional Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-[#d4c4b0]/60"
          >
            <p className="text-sm sm:text-base text-[#7a7a7a]">
              If you believe this is an error, please{" "}
              <Link
                href="/#contact"
                className="text-[#3a6a39] hover:text-[#47d644] underline font-medium transition-colors"
              >
                contact us
              </Link>
              .
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
