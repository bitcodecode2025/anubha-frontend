"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ExternalLink, Download, Trash2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  DoctorNoteAttachment,
  getDoctorNoteAttachmentViewUrl,
  deleteDoctorNoteAttachment,
} from "@/lib/doctor-notes-api";

interface MedicalReportCardProps {
  attachment: DoctorNoteAttachment;
  onAttachmentDeleted?: () => void;
}

const MedicalReportCard = ({
  attachment,
  onAttachmentDeleted,
}: MedicalReportCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isImage =
    attachment.mimeType?.startsWith("image/") ||
    ["png", "jpg", "jpeg"].includes(
      attachment.filePath?.split(".").pop()?.toLowerCase() || ""
    );

  useEffect(() => {
    if (!isImage) {
      setLoading(false);
      return;
    }

    const fetchSignedUrl = async () => {
      try {
        const response = await getDoctorNoteAttachmentViewUrl(attachment.id);
        if (response.success && response.signedUrl) {
          setImageUrl(response.signedUrl);
        } else {
          setError(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [attachment.id, isImage]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleView = async () => {
    try {
      const response = await getDoctorNoteAttachmentViewUrl(attachment.id);
      if (response.success && response.signedUrl) {
        window.open(response.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Failed to open report");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to open report. Please try again."
      );
    }
  };

  const handleDownload = async () => {
    try {
      toast.loading("Starting download...", { id: "download-toast" });
      const base =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
      const downloadUrl = `${base}/admin/doctor-notes/attachment/${attachment.id}/download`;
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      toast.success("Download started", { id: "download-toast" });
    } catch (error: any) {
      console.error("[DOWNLOAD] Error:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.statusText ||
        error?.message ||
        "Failed to download report. Please try again.";
      toast.error(errorMessage, { id: "download-toast" });
    }
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const result = await deleteDoctorNoteAttachment(attachment.id);
      if (result.success) {
        toast.success("Report deleted successfully");
        if (onAttachmentDeleted) {
          onAttachmentDeleted();
        }
      } else {
        throw new Error(result.error || "Failed to delete report");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to delete report"
      );
    }
  };

  return (
    <>
      <div className="relative group rounded-xl border-2 border-emerald-200 bg-white hover:bg-emerald-50 p-4 transition-all shadow-sm hover:shadow-md">
        {isImage ? (
          <>
            {loading ? (
              <div className="w-full h-40 flex items-center justify-center bg-emerald-100 rounded-lg mb-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : error ? (
              <div className="w-full h-40 flex items-center justify-center bg-emerald-100 rounded-lg mb-3">
                <span className="text-xs text-slate-400">Failed to load</span>
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={attachment.fileName}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            ) : null}
          </>
        ) : (
          <div className="flex items-center justify-center h-40 mb-3 bg-emerald-100 rounded-lg">
            <FileText className="w-16 h-16 text-emerald-600" />
          </div>
        )}
        <p
          className="text-sm font-semibold text-slate-700 truncate mb-1"
          title={attachment.fileName}
        >
          {attachment.fileName}
        </p>
        {attachment.sizeInBytes && (
          <p className="text-xs text-slate-500 mb-3">
            {formatFileSize(attachment.sizeInBytes)}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleView}
            className="w-full sm:flex-1 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View
          </button>
          <button
            onClick={handleDownload}
            className="w-full sm:flex-1 px-3 py-2 bg-slate-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
            title="Delete report"
          >
            <Trash2 className="w-3 h-3" />
            <span className="sm:hidden">Delete</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-sm rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Delete report?
                </h3>
                <p className="text-xs text-slate-600 mt-1 break-words">
                  This will permanently delete{" "}
                  <span className="font-semibold">"{attachment.fileName}"</span>.
                </p>
              </div>
              <div className="px-4 pb-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full sm:flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(MedicalReportCard);
