"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  DoctorNoteAttachment,
  getDoctorNoteAttachmentViewUrl,
  deleteDoctorNoteAttachment,
} from "@/lib/doctor-notes-api";

interface PrePostImageCardProps {
  attachment: DoctorNoteAttachment;
  onAttachmentDeleted?: () => void;
}

const PrePostImageCard = ({
  attachment,
  onAttachmentDeleted,
}: PrePostImageCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!attachment.filePath) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getDoctorNoteAttachmentViewUrl(attachment.id);
        if (response.success && response.signedUrl) {
          setImageUrl(response.signedUrl);
        } else {
          setError(true);
        }
      } catch (err: any) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [attachment.id, attachment.filePath]);

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const result = await deleteDoctorNoteAttachment(attachment.id);
      if (result.success) {
        toast.success("Image deleted successfully");
        if (onAttachmentDeleted) {
          onAttachmentDeleted();
        }
      } else {
        throw new Error(result.error || "Failed to delete image");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to delete image"
      );
    }
  };

  return (
    <>
      <div className="relative group rounded-lg overflow-hidden border border-emerald-200 bg-white shadow-sm hover:shadow-md transition-all">
        {loading ? (
          <div className="w-full h-32 flex items-center justify-center bg-emerald-100">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="w-full h-32 flex items-center justify-center bg-red-50 text-red-700 text-xs p-2 text-center">
            Failed to load
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={attachment.fileName}
            className="w-full h-32 object-cover"
          />
        ) : null}
        <div className="p-2">
          <p
            className="text-xs text-slate-700 truncate mb-1"
            title={attachment.fileName}
          >
            {attachment.fileName}
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (imageUrl) {
                  window.open(imageUrl, "_blank", "noopener,noreferrer");
                }
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
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
                  Delete image?
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

export default React.memo(PrePostImageCard);
