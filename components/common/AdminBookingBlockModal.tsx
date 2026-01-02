"use client";

import { X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminBookingBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminBookingBlockModal({
  isOpen,
  onClose,
}: AdminBookingBlockModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Admin Cannot Book Appointments
                </h2>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  Administrators are not allowed to book appointments. Please
                  use a regular user account to proceed with booking.
                </p>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
