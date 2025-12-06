"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Plus, Loader2, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { getMyPatients, Patient } from "@/lib/patient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PatientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patientId: string) => void;
}

export default function PatientSelectionModal({
  isOpen,
  onClose,
  onSelectPatient,
}: PatientSelectionModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getMyPatients();
      setPatients(data);
    } catch (error: any) {
      console.error("Failed to fetch patients:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load patients"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    onSelectPatient(patientId);
    onClose();
  };

  const handleAddPatient = () => {
    onClose();
    router.push("/book/user-details");
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.replace(/(\d{5})(\d{0,5})/, "$1 $2").trim();
  };

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                  Select Patient
                </h2>
                <p className="text-slate-600 text-sm">
                  Choose a patient for this appointment
                </p>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Patients List */}
                  <div className="flex-1 overflow-y-auto mb-4 pr-2">
                    {patients.length === 0 ? (
                      <div className="text-center py-12">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-slate-600 text-lg mb-2">
                          No patients found
                        </p>
                        <p className="text-slate-500 text-sm">
                          Add a patient to get started
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {patients.map((patient) => (
                          <motion.button
                            key={patient.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectPatient(patient.id)}
                            className={`
                              w-full p-4 rounded-xl border-2 transition-all text-left
                              ${
                                selectedPatientId === patient.id
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                              }
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 text-lg truncate">
                                  {patient.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Phone className="w-4 h-4 text-slate-500" />
                                  <p className="text-slate-600 text-sm">
                                    +91 {formatPhone(patient.phone)}
                                  </p>
                                </div>
                                <p className="text-slate-500 text-xs mt-1 capitalize">
                                  {patient.gender.toLowerCase()}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Patient Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddPatient}
                    className="
                      w-full p-4 rounded-xl 
                      bg-gradient-to-r from-emerald-500 to-emerald-600 
                      text-white font-semibold 
                      shadow-lg hover:shadow-xl 
                      transition-all 
                      flex items-center justify-center gap-2
                      mt-4
                    "
                  >
                    <Plus className="w-5 h-5" />
                    Add New Patient
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

