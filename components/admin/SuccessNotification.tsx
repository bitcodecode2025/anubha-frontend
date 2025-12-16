"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface SuccessNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  duration?: number;
}

export default function SuccessNotification({
  isOpen,
  onClose,
  message = "Operation completed successfully!",
  duration = 3000,
}: SuccessNotificationProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-4 right-4 z-[10000] p-4">
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="bg-white rounded-xl shadow-2xl border border-emerald-200 p-4 min-w-[320px] max-w-md"
          >
            <div className="flex items-start gap-3">
              {/* Success Icon */}
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{message}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
