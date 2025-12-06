"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutAnimation() {
  const { loggingOut } = useAuth();

  return (
    <AnimatePresence>
      {loggingOut && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-[9999] flex items-center justify-center"
          >
            {/* Animation Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              {/* Icon with rotation */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg"
              >
                <LogOut className="w-8 h-8 text-white" />
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Logging out...
                </h3>
                <p className="text-slate-600 text-sm">See you soon! 👋</p>
              </motion.div>

              {/* Loading dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-emerald-600"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
