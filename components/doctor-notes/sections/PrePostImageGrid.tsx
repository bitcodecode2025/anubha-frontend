"use client";

import React, { useMemo } from "react";
import type { DoctorNoteAttachment } from "@/lib/doctor-notes-api";
import PrePostImageCard from "./attachment-cards/PrePostImageCard";

interface PrePostImageGridProps {
  attachments?: DoctorNoteAttachment[];
  onAttachmentDeleted?: () => void;
}

const PrePostImageGrid = ({
  attachments = [],
  onAttachmentDeleted,
}: PrePostImageGridProps) => {
  // Memoize filtering of pre/post consultation images
  const { preImages, postImages } = useMemo(() => {
    const apiAttachments = Array.isArray(attachments) ? attachments : [];
    const prePostImages = apiAttachments.filter(
      (att) =>
        att.fileCategory === "IMAGE" &&
        att.section === "PrePostConsultation" &&
        (att.filePath?.includes("/pre/") || att.filePath?.includes("/post/"))
    );

    const pre = prePostImages.filter((att) =>
      att.filePath?.includes("/pre/")
    );
    const post = prePostImages.filter((att) =>
      att.filePath?.includes("/post/")
    );

    return { preImages: pre, postImages: post };
  }, [attachments]);

  if (preImages.length === 0 && postImages.length === 0) return null;

  return (
    <div className="mb-6 pb-6 border-b border-slate-200 last:border-b-0">
      <h4 className="text-lg font-semibold text-emerald-700 mb-4">
        Section 9 — Pre & Post Consultation Images
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pre-Consultation Images */}
        <div>
          <h5 className="text-md font-semibold text-slate-700 mb-3">
            Pre-Consultation Images (Before)
          </h5>
          {preImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {preImages.map((image, index) => (
                <PrePostImageCard
                  key={image.id || index}
                  attachment={image}
                  onAttachmentDeleted={onAttachmentDeleted}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No pre-consultation images
            </p>
          )}
        </div>

        {/* Post-Consultation Images */}
        <div>
          <h5 className="text-md font-semibold text-slate-700 mb-3">
            Post-Consultation Images (After)
          </h5>
          {postImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {postImages.map((image, index) => (
                <PrePostImageCard
                  key={image.id || index}
                  attachment={image}
                  onAttachmentDeleted={onAttachmentDeleted}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No post-consultation images
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PrePostImageGrid);
