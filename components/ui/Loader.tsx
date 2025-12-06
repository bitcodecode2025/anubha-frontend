"use client";

import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-[#f7f9f5] via-[#fdf7f2] to-[#eef6ff]">
      <motion.div
        className="w-12 h-12 border-4 border-[#7fb77e] border-t-transparent rounded-full shadow-lg"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "linear",
        }}
      />
    </div>
  );
}
