"use client";

import React, { useMemo, useState } from "react";
import { Mail } from "lucide-react";
import type { DoctorNotesFormData, DoctorNoteAttachment } from "@/lib/doctor-notes-api";
import { FieldDisplay } from "./shared-helpers";
import DietPdfCard from "./attachment-cards/DietPdfCard";
import SendEmailModal from "./SendEmailModal";

interface DietPrescribedSectionProps {
  formData: Pick<DoctorNotesFormData, "dietPrescribed">;
  attachments?: DoctorNoteAttachment[];
  appointmentId?: string;
  patientEmail?: string | null;
  onPDFsUploaded?: () => Promise<void>;
}

const DietPrescribedSection = ({
  formData,
  attachments = [],
  appointmentId,
  patientEmail,
}: DietPrescribedSectionProps) => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Memoize check for whether section has data
  const hasData = useMemo(() => {
    return !!(
      formData.dietPrescribed &&
      Object.keys(formData.dietPrescribed).length > 0
    );
  }, [formData.dietPrescribed]);

  // Memoize attachments filtering
  const apiAttachments = useMemo(
    () => (Array.isArray(attachments) ? attachments : []),
    [attachments]
  );

  const attachmentsToShow = useMemo(() => {
    const dietChartAttachments = apiAttachments.filter(
      (att) =>
        att.section === "DietPrescribed" &&
        att.fileCategory === "DIET_CHART"
    );

    const filtered = (
      dietChartAttachments.length > 0 ? dietChartAttachments : apiAttachments
    ).filter((att) => {
      const isR2 = att.provider === "S3";
      if (!isR2) return false;
      const isPdfByMime = att.mimeType === "application/pdf";
      const isPdfByPath = att.filePath?.includes("/pdf/");
      return isPdfByMime && isPdfByPath;
    });

    return filtered;
  }, [apiAttachments]);

  const pdfCount = useMemo(
    () =>
      apiAttachments.filter((att) => att.mimeType === "application/pdf")
        .length,
    [apiAttachments]
  );

  if (!hasData) return null;

  return (
    <>
      <div className="mb-6 pb-6 border-b border-slate-200">
        <h4 className="text-lg font-semibold text-emerald-700 mb-4">
          Section 7 — Diet Prescribed
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldDisplay
            label="Joining Date"
            value={formData.dietPrescribed?.joiningDate}
          />
          <FieldDisplay
            label="Expiry Date"
            value={formData.dietPrescribed?.expiryDate}
          />
          <FieldDisplay
            label="Diet Prescription Date"
            value={formData.dietPrescribed?.dietPrescriptionDate}
          />
          <FieldDisplay
            label="Duration of Diet"
            value={formData.dietPrescribed?.durationOfDiet}
          />
          <FieldDisplay
            label="Diet Chart"
            value={formData.dietPrescribed?.dietChart}
          />
          <FieldDisplay
            label="Code"
            value={formData.dietPrescribed?.code}
          />

          {/* Uploaded PDFs (R2-only) */}
          {apiAttachments.length > 0 && (
            <div className="md:col-span-2 mt-4">
              <div className="bg-white border-2 border-emerald-200 rounded-lg p-4 shadow-sm">
                {attachmentsToShow.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    No PDF files uploaded
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Uploaded PDFs ({attachmentsToShow.length}/15)
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      Use View / Download (secure R2 access)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {attachmentsToShow.map((pdf, index) => (
                        <DietPdfCard key={pdf.id || index} attachment={pdf} />
                      ))}
                    </div>

                    {/* Send Email Button */}
                    {appointmentId &&
                      attachmentsToShow.length > 0 &&
                      pdfCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-emerald-200">
                          <button
                            onClick={() => setShowEmailModal(true)}
                            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <Mail className="w-5 h-5" />
                            <span>Send PDFs via Email</span>
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Email Modal */}
      {appointmentId && (
        <SendEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          appointmentId={appointmentId}
          patientEmail={patientEmail}
          pdfCount={pdfCount}
        />
      )}
    </>
  );
};

export default React.memo(DietPrescribedSection);