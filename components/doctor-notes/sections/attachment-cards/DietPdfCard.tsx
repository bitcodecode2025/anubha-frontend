"use client";

import React from "react";
import toast from "react-hot-toast";
import {
  DoctorNoteAttachment,
  getDoctorNoteAttachmentViewUrl,
} from "@/lib/doctor-notes-api";

interface DietPdfCardProps {
  attachment: DoctorNoteAttachment;
}

const DietPdfCard = ({ attachment }: DietPdfCardProps) => {
  const handleView = async () => {
    try {
      const response = await getDoctorNoteAttachmentViewUrl(attachment.id);
      if (response.success && response.signedUrl) {
        window.open(response.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Failed to open PDF");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to open PDF. Please try again."
      );
    }
  };

  const handleDownload = async () => {
    try {
      toast.loading("Starting download...", { id: "download-toast" });
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
      const downloadUrl = `${base}/admin/doctor-notes/attachment/${attachment.id}/download`;
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      toast.success("Download started", { id: "download-toast" });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to download PDF. Please try again.",
        { id: "download-toast" }
      );
    }
  };

  return (
    <div className="relative group rounded-xl border-2 border-emerald-200 bg-white hover:bg-emerald-50 p-5 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              fill="#10b981"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              fill="#fff"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="12"
              y="16"
              fontSize="5"
              fontWeight="bold"
              fill="#fff"
              textAnchor="middle"
            >
              PDF
            </text>
          </svg>
        </div>

        <p
          className="text-sm text-slate-700 truncate w-full mb-2"
          title={attachment.fileName}
        >
          {attachment.fileName}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button
            type="button"
            onClick={handleView}
            className="w-full sm:flex-1 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            View
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:flex-1 px-3 py-2 bg-slate-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DietPdfCard);
