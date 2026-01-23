"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { sendDoctorNotesEmail } from "@/lib/doctor-notes-api";

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientEmail?: string | null;
  pdfCount: number;
}

const SendEmailModal = ({
  isOpen,
  onClose,
  appointmentId,
  patientEmail,
  pdfCount,
}: SendEmailModalProps) => {
  const [emailType, setEmailType] = useState<"patient" | "custom">("patient");
  const [customEmail, setCustomEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSend = async () => {
    if (
      emailType === "custom" &&
      (!customEmail || !customEmail.trim())
    ) {
      toast.error("Please enter an email address");
      return;
    }

    setSendingEmail(true);
    try {
      const result = await sendDoctorNotesEmail(appointmentId, {
        usePatientEmail: emailType === "patient",
        customEmail: emailType === "custom" ? customEmail : undefined,
      });

      if (result.success) {
        toast.success(result.message || "Email sent successfully!");
        onClose();
        setCustomEmail("");
        setEmailType("patient");
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to send email. Please try again."
      );
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-[1000]"
          onClick={() => !sendingEmail && onClose()}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Send PDFs via Email
              </h3>
              <button
                onClick={onClose}
                disabled={sendingEmail}
                className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Send to
                </label>
                <select
                  value={emailType}
                  onChange={(e) =>
                    setEmailType(e.target.value as "patient" | "custom")
                  }
                  disabled={sendingEmail}
                  className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                >
                  {patientEmail ? (
                    <option value="patient">
                      Patient Email ({patientEmail})
                    </option>
                  ) : (
                    <option value="patient" disabled>
                      Patient Email (Not Available)
                    </option>
                  )}
                  <option value="custom">Custom Email</option>
                </select>
              </div>

              {emailType === "custom" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Enter email address"
                    disabled={sendingEmail}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  <strong>{pdfCount}</strong> PDF file(s) will be sent via
                  email.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={sendingEmail}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    sendingEmail ||
                    (emailType === "custom" && !customEmail.trim()) ||
                    (emailType === "patient" && !patientEmail)
                  }
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SendEmailModal);
