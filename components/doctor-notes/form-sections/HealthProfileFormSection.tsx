"use client";

import React, { useState } from "react";
import { Loader2, Upload, FileText, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  getDoctorNotes,
  saveDoctorNotes,
  getDoctorNoteAttachmentViewUrl,
  deleteDoctorNoteAttachment,
} from "@/lib/doctor-notes-api";
import api from "@/lib/api";
import { Select, TextArea, Radio, SubSection } from "./FormUIComponents";

interface HealthProfileFormSectionProps {
  formData: any;
  updateFormData: any;
  getFormValue: any;
  appointmentId: string;
  attachments?: any[];
  onAttachmentDeleted?: () => void;
}

export default function HealthProfileFormSection({
  formData,
  updateFormData,
  getFormValue,
  appointmentId,
  attachments = [],
  onAttachmentDeleted,
}: HealthProfileFormSectionProps) {
  const healthProfile = getFormValue(["healthProfile"]) || {};
  const conditions = [
    "High B.P",
    "Diabetes",
    "High Cholesterol",
    "Obesity",
    "Cardiac Risk",
    "Heart Problem",
    "Back Pain",
    "Neck Pain",
    "Knee Pain",
    "Shoulder Pain",
    "Respiratory Problem (Asthma/Breathlessness)",
    "Post-Operative",
    "Hormonal Problem",
    "Thyroid",
    "PCOD",
    "PCOS",
    "Gynec Problem",
    "Gastric Problem",
    "Acidity",
    "Constipation",
    "Allergy",
    "Water Retention",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Select
        label="Physical Activity Level"
        options={["Sedentary", "Moderate", "Heavy"]}
        value={healthProfile.physicalActivityLevel || ""}
        onChange={(val) =>
          updateFormData(["healthProfile", "physicalActivityLevel"], val)
        }
      />
      <Select
        label="Sleep Quality"
        options={["Normal", "Inadequate", "Disturbed", "Insomnia"]}
        value={healthProfile.sleepQuality || ""}
        onChange={(val) =>
          updateFormData(["healthProfile", "sleepQuality"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="Insomnia/Pills Details"
          value={healthProfile.insomniaPillsDetails || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "insomniaPillsDetails"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Disturbance Due to Urine Break"
          value={healthProfile.disturbanceDueToUrineBreak || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "disturbanceDueToUrineBreak"], val)
          }
        />
      </div>
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conditions.map((condition) => (
          <Radio
            key={condition}
            label={condition}
            options={["Yes", "No"]}
            value={healthProfile.conditions?.[condition]?.hasCondition || ""}
            onChange={(val) => {
              const conditions = healthProfile.conditions || {};
              updateFormData(["healthProfile", "conditions", condition], {
                ...conditions[condition],
                name: condition,
                hasCondition: val,
              });
            }}
          />
        ))}
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Medication Name"
          value={healthProfile.medicationName || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "medicationName"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Medication Reason"
          value={healthProfile.medicationReason || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "medicationReason"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Medication Timing & Quantity"
          value={healthProfile.medicationTimingQuantity || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "medicationTimingQuantity"], val)
          }
        />
      </div>
      <Radio
        label="Pregnancy"
        options={["Yes", "No"]}
        value={healthProfile.pregnancy || ""}
        onChange={(val) => updateFormData(["healthProfile", "pregnancy"], val)}
      />
      <Radio
        label="Planning Pregnancy"
        options={["Yes", "No"]}
        value={healthProfile.planningPregnancy || ""}
        onChange={(val) =>
          updateFormData(["healthProfile", "planningPregnancy"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="If Yes, Planning When?"
          value={healthProfile.planningPregnancyWhen || ""}
          onChange={(val) =>
            updateFormData(["healthProfile", "planningPregnancyWhen"], val)
          }
        />
      </div>
      <SubSection title="Family History">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <TextArea
            label="Father"
            value={healthProfile.familyHistory?.father || ""}
            onChange={(val) =>
              updateFormData(["healthProfile", "familyHistory"], {
                ...healthProfile.familyHistory,
                father: val,
              })
            }
          />
          <TextArea
            label="Mother"
            value={healthProfile.familyHistory?.mother || ""}
            onChange={(val) =>
              updateFormData(["healthProfile", "familyHistory"], {
                ...healthProfile.familyHistory,
                mother: val,
              })
            }
          />
          <TextArea
            label="Sibling(s)"
            value={healthProfile.familyHistory?.siblings || ""}
            onChange={(val) =>
              updateFormData(["healthProfile", "familyHistory"], {
                ...healthProfile.familyHistory,
                siblings: val,
              })
            }
          />
        </div>
      </SubSection>

      {/* Medical Reports Upload Section */}
      <div className="md:col-span-2 mt-6 pt-6 border-t-2 border-emerald-200">
        <div className="input-group">
          <label className="block font-semibold mb-3 text-slate-700 text-sm sm:text-base">
            Upload Medical Reports
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Max 10 files · PDF, PNG, JPG, JPEG · 10MB per file
          </p>
          <MedicalReportsUpload
            appointmentId={appointmentId || ""}
            updateFormData={updateFormData}
            getFormValue={getFormValue}
            onReportsUploaded={async () => {
              // Refresh attachments after upload
              if (onAttachmentDeleted) {
                onAttachmentDeleted();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Medical Reports Upload Component
function MedicalReportsUpload({
  appointmentId,
  updateFormData,
  getFormValue,
  onReportsUploaded,
}: {
  appointmentId: string;
  updateFormData: any;
  getFormValue: any;
  onReportsUploaded?: () => void;
}) {
  const [reportFiles, setReportFiles] = React.useState<File[]>([]);
  const [uploadedReports, setUploadedReports] = React.useState<any[]>([]);
  const [fileErrors, setFileErrors] = React.useState<{
    [fileName: string]: string;
  }>({});
  const [dragActive, setDragActive] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [reportInputKey, setReportInputKey] = React.useState(0);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_REPORTS = 10;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Upload medical reports immediately after selection
  const uploadMedicalReports = async (files: File[]): Promise<void> => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Bootstrap: Ensure Doctor Notes record exists before uploading attachments
      let recordExists = false;
      try {
        const existingNotes = await getDoctorNotes(appointmentId);
        if (existingNotes.success && existingNotes.doctorNotes) {
          recordExists = true;
        }
      } catch (error: any) {
        recordExists = false;
      }

      // Create record if it doesn't exist
      if (!recordExists) {
        await saveDoctorNotes({
          appointmentId,
          formData: {},
          isDraft: true,
        });
      }

      // Create FormData for multipart upload
      const formData = new FormData();

      // Add files with correct field name
      files.forEach((file) => {
        formData.append("medicalReports", file);
      });

      // Add empty formData JSON (backend expects it)
      formData.append("formData", JSON.stringify({}));
      formData.append("isDraft", "true");

      // Upload via PATCH endpoint (same endpoint handles file uploads)
      const response = await api.patch<{ success: boolean; error?: string }>(
        `admin/doctor-notes/${appointmentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Refresh uploaded reports from backend
        const notesResponse = await getDoctorNotes(appointmentId);
        if (notesResponse.success && notesResponse.doctorNotes?.attachments) {
          const reports = notesResponse.doctorNotes.attachments.filter(
            (att: any) =>
              (att.fileCategory === "LAB_REPORT" ||
                att.fileCategory === "OTHER") &&
              att.section === "HealthProfile" &&
              !att.isArchived &&
              att.filePath?.includes("/reports/")
          );

          setUploadedReports(
            reports.map((report: any) => ({
              id: report.id,
              fileName: report.fileName,
              filePath: report.filePath,
              mimeType: report.mimeType,
              sizeInBytes: report.sizeInBytes,
            }))
          );

          // Notify parent to refresh attachments for preview
          if (onReportsUploaded) {
            onReportsUploaded();
          }
        }

        toast.success(
          `Successfully uploaded ${files.length} report(s)`,
          { duration: 3000 }
        );
      } else {
        throw new Error(response.data.error || "Upload failed");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to upload reports";
      toast.error(errorMessage, { duration: 5000 });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Load existing reports from attachments on mount
  React.useEffect(() => {
    const loadExistingReports = async () => {
      try {
        const response = await getDoctorNotes(appointmentId);
        if (response.success && response.doctorNotes?.attachments) {
          const reports = response.doctorNotes.attachments.filter(
            (att: any) =>
              (att.fileCategory === "LAB_REPORT" ||
                att.fileCategory === "OTHER") &&
              att.section === "HealthProfile" &&
              !att.isArchived &&
              att.filePath?.includes("/reports/")
          );

          setUploadedReports(
            reports.map((report: any) => ({
              id: report.id,
              fileName: report.fileName,
              filePath: report.filePath,
              mimeType: report.mimeType,
              sizeInBytes: report.sizeInBytes,
            }))
          );
        }
      } catch (error) {
        // Ignore errors - reports might not exist yet
      }
    };

    if (appointmentId) {
      loadExistingReports();
    }
  }, [appointmentId]);

  const validateAndAddReports = async (files: File[]) => {
    const errors: { [fileName: string]: string } = {};
    const validFiles: File[] = [];

    // Check total files limit
    const totalFiles =
      reportFiles.length + uploadedReports.length + files.length;
    if (totalFiles > MAX_REPORTS) {
      toast.error(
        `Cannot add ${files.length} file(s). Maximum ${MAX_REPORTS} reports allowed.`,
        { duration: 5000 }
      );
      return;
    }

    files.forEach((file) => {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      const fileType = file.type.toLowerCase();
      const extension = file.name.split(".").pop()?.toLowerCase() || "";

      if (
        !allowedTypes.includes(fileType) &&
        !["pdf", "png", "jpg", "jpeg"].includes(extension)
      ) {
        errors[file.name] = "Only PDF, PNG, JPG, and JPEG files are allowed";
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors[
          file.name
        ] = `File too large! Maximum allowed size is 10MB. (${formatFileSize(
          file.size
        )})`;
        return;
      }

      // Check if file already exists
      if (
        reportFiles.some((f) => f.name === file.name && f.size === file.size)
      ) {
        errors[file.name] = "This file is already added";
        return;
      }

      if (
        uploadedReports.some(
          (report) =>
            report.fileName === file.name && report.sizeInBytes === file.size
        )
      ) {
        errors[file.name] = "This file is already uploaded";
        return;
      }

      validFiles.push(file);
    });

    if (Object.keys(errors).length > 0) {
      setFileErrors((prev) => ({ ...prev, ...errors }));
      Object.entries(errors).forEach(([fileName, error]) => {
        toast.error(`${fileName}: ${error}`, { duration: 5000 });
      });
      return;
    }

    if (validFiles.length > 0) {
      // Upload files immediately
      try {
        await uploadMedicalReports(validFiles);
        // Files are now uploaded, don't add to local state
        // The uploaded reports state will be updated by uploadMedicalReports
        setFileErrors({});
        // Force remount file input to ensure onChange fires reliably
        setReportInputKey((prev) => prev + 1);
      } catch (error) {
        // Upload failed, add to local state for retry
        const updatedFiles = [...reportFiles, ...validFiles].slice(
          0,
          MAX_REPORTS
        );
        setReportFiles(updatedFiles);
        // Note: We don't store files in formData anymore - they upload immediately
        setFileErrors({});
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      validateAndAddReports(files);
    }
    e.target.value = ""; // Reset input
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndAddReports(files);
    }
  };

  const removeReport = (index: number) => {
    const updatedFiles = reportFiles.filter((_, i) => i !== index);
    setReportFiles(updatedFiles);
    updateFormData(["healthProfile", "medicalReports"], updatedFiles);
  };

  const removeUploadedReport = async (index: number) => {
    const reportToRemove = uploadedReports[index];
    try {
      await deleteDoctorNoteAttachment(reportToRemove.id);
      toast.success("Report removed successfully");
      setUploadedReports((prev) => prev.filter((_, i) => i !== index));
      // Notify parent to refresh attachments for preview
      if (onReportsUploaded) {
        onReportsUploaded();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to remove report. Please try again."
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (
            reportFiles.length + uploadedReports.length < MAX_REPORTS &&
            !isUploading
          ) {
            setDragActive(true);
          }
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`
          border-2 rounded-xl p-5 text-center transition-all cursor-pointer
          ${
            dragActive
              ? "border-emerald-600 bg-emerald-50"
              : "border-gray-300 bg-white hover:border-emerald-400"
          }
          ${
            reportFiles.length + uploadedReports.length >= MAX_REPORTS ||
            isUploading
              ? "opacity-50 pointer-events-none"
              : ""
          }
        `}
      >
        <label
          htmlFor="medical-reports-upload"
          className="flex flex-col items-center gap-2 cursor-pointer"
        >
          <span className="p-3 bg-emerald-50 rounded-full text-emerald-700">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </span>
          <div className="text-sm text-slate-600 font-medium">
            {isUploading
              ? "Uploading..."
              : reportFiles.length + uploadedReports.length >= MAX_REPORTS
              ? `Maximum ${MAX_REPORTS} files reached`
              : "Tap to upload or drag files here"}
          </div>
          <div className="text-xs text-slate-400">
            PDF, PNG, JPG, JPEG · Max 10MB per file
          </div>
          {reportFiles.length + uploadedReports.length > 0 && (
            <div className="text-xs text-slate-500 font-medium mt-1">
              {reportFiles.length + uploadedReports.length} / {MAX_REPORTS}{" "}
              files
            </div>
          )}

          <input
            key={`report-${reportInputKey}`}
            id="medical-reports-upload"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/jpeg,image/jpg,image/png"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={
              reportFiles.length + uploadedReports.length >= MAX_REPORTS ||
              isUploading
            }
          />
        </label>
      </div>

      {/* Local Files Preview */}
      {reportFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Selected Files ({reportFiles.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {reportFiles.map((file, index) => {
              const isImage =
                file.type.startsWith("image/") ||
                ["png", "jpg", "jpeg"].includes(
                  file.name.split(".").pop()?.toLowerCase() || ""
                );
              return (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border border-blue-200 bg-blue-50 p-4 transition-all"
                >
                  {isImage ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover mb-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 mb-2 bg-blue-100 rounded">
                      <FileText className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                  <p
                    className="text-xs text-slate-700 truncate mb-1"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeReport(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                    title="Remove file"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Uploaded Reports Preview */}
      {uploadedReports.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Uploaded Reports ({uploadedReports.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedReports.map((report, index) => (
              <MedicalReportThumbnail
                key={report.id || index}
                attachment={report}
                onRemove={() => removeUploadedReport(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Medical Report Thumbnail Component (fetches signed URL on demand)
function MedicalReportThumbnail({
  attachment,
  onRemove,
}: {
  attachment: any;
  onRemove: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isImage =
    attachment.mimeType?.startsWith("image/") ||
    ["png", "jpg", "jpeg"].includes(
      attachment.filePath?.split(".").pop()?.toLowerCase() || ""
    );

  React.useEffect(() => {
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
    if (!bytes) return "Unknown size";
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
      const response = await getDoctorNoteAttachmentViewUrl(attachment.id);
      if (response.success && response.signedUrl) {
        const link = document.createElement("a");
        link.href = response.signedUrl;
        link.download = attachment.fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error("Failed to download report");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to download report. Please try again."
      );
    }
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-emerald-200 bg-emerald-50 p-4 transition-all">
      {isImage ? (
        <>
          {loading ? (
            <div className="w-full h-32 flex items-center justify-center bg-emerald-100">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            </div>
          ) : error ? (
            <div className="w-full h-32 flex items-center justify-center bg-emerald-100">
              <span className="text-xs text-slate-400">Failed to load</span>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={attachment.fileName}
              className="w-full h-32 object-cover mb-2"
            />
          ) : null}
        </>
      ) : (
        <div className="flex items-center justify-center h-32 mb-2 bg-emerald-100 rounded">
          <FileText className="w-12 h-12 text-emerald-600" />
        </div>
      )}
      <p
        className="text-xs text-slate-700 truncate mb-1"
        title={attachment.fileName}
      >
        {attachment.fileName}
      </p>
      <p className="text-xs text-slate-500 mb-2">
        {formatFileSize(attachment.sizeInBytes)}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleView}
          className="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition-colors"
        >
          View
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 px-3 py-1.5 bg-slate-600 text-white text-xs font-semibold rounded hover:bg-slate-700 transition-colors"
        >
          Download
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
        title="Remove report"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
}
