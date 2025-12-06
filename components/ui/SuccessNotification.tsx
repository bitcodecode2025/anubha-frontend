"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface SuccessNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function SuccessNotification({
  message,
  isVisible,
  onClose,
  duration = 4000,
}: SuccessNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-20 right-6 z-[10000] pointer-events-none">
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="pointer-events-auto bg-white rounded-xl shadow-2xl border-2 border-emerald-200 p-4 min-w-[320px] max-w-md"
          >
            <div className="flex items-start gap-3">
              {/* Success Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              {/* Message */}
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Success!
                </p>
                <p className="text-sm text-slate-600">{message}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="mt-3 h-1 bg-emerald-500 rounded-full"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
