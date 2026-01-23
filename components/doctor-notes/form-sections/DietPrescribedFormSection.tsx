"use client";

import React, { useState } from "react";
import { Loader2, Upload, FileText, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  getDoctorNotes,
  saveDoctorNotes,
  deleteDoctorNoteAttachment,
} from "@/lib/doctor-notes-api";
import api from "@/lib/api";
import { Input, DateInput, TextArea } from "./FormUIComponents";

interface DietPrescribedFormSectionProps {
  formData: any;
  updateFormData: any;
  getFormValue: any;
  appointmentId: string;
  attachments?: any[];
  onPDFsUploaded?: () => void;
}

export default function DietPrescribedFormSection({
  formData,
  updateFormData,
  getFormValue,
  appointmentId,
  attachments = [],
  onPDFsUploaded,
}: DietPrescribedFormSectionProps) {
  const dietPrescribed = getFormValue(["dietPrescribed"]) || {};
  const [dietChartFiles, setDietChartFiles] = React.useState<File[]>([]);
  const [uploadedPDFs, setUploadedPDFs] = React.useState<any[]>([]);
  const [fileErrors, setFileErrors] = React.useState<{
    [fileName: string]: string;
  }>({});
  const [dragActive, setDragActive] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [pdfInputKey, setPdfInputKey] = React.useState(0);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Load existing PDFs from attachments on mount
  React.useEffect(() => {
    const loadExistingPDFs = async () => {
      try {
        const response = await getDoctorNotes(appointmentId);
        if (response.success && response.doctorNotes?.attachments) {
          const pdfs = response.doctorNotes.attachments.filter(
            (att: any) =>
              att.fileCategory === "DIET_CHART" &&
              att.section === "DietPrescribed" &&
              !att.isArchived &&
              att.filePath?.includes("/pdf/")
          );

          setUploadedPDFs(
            pdfs.map((pdf: any) => ({
              id: pdf.id,
              fileName: pdf.fileName,
              filePath: pdf.filePath,
              mimeType: pdf.mimeType,
              sizeInBytes: pdf.sizeInBytes,
            }))
          );
        }
      } catch (error) {
        // Ignore errors - PDFs might not exist yet
      }
    };

    if (appointmentId) {
      loadExistingPDFs();
    }
  }, [appointmentId]);

  // Upload diet chart PDFs immediately after selection
  const uploadDietChartPDFs = async (files: File[]): Promise<void> => {
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

      // Add files with correct field name (backend expects "dietCharts")
      files.forEach((file) => {
        formData.append("dietCharts", file);
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
        // Refresh uploaded PDFs from backend
        const notesResponse = await getDoctorNotes(appointmentId);
        if (notesResponse.success && notesResponse.doctorNotes?.attachments) {
          const pdfs = notesResponse.doctorNotes.attachments.filter(
            (att: any) =>
              att.fileCategory === "DIET_CHART" &&
              att.section === "DietPrescribed" &&
              !att.isArchived &&
              att.filePath?.includes("/pdf/")
          );

          setUploadedPDFs(
            pdfs.map((pdf: any) => ({
              id: pdf.id,
              fileName: pdf.fileName,
              filePath: pdf.filePath,
              mimeType: pdf.mimeType,
              sizeInBytes: pdf.sizeInBytes,
            }))
          );

          // Notify parent to refresh attachments for preview
          if (onPDFsUploaded) {
            onPDFsUploaded();
          }
        }

        toast.success(
          `Successfully uploaded ${files.length} PDF(s)`,
          { duration: 3000 }
        );
      } else {
        throw new Error(response.data.error || "Upload failed");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to upload PDFs";
      toast.error(errorMessage, { duration: 5000 });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const validateAndAddFiles = async (files: File[]) => {
    const errors: { [fileName: string]: string } = {};
    const validFiles: File[] = [];

    // Check total files limit (includes uploaded PDFs)
    const totalFiles = uploadedPDFs.length + files.length;
    if (totalFiles > 15) {
      toast.error(
        `Cannot add ${files.length} file(s). Maximum 15 files allowed in total.`,
        {
          duration: 5000,
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            maxWidth: "500px",
          },
        }
      );
      return;
    }

    files.forEach((file) => {
      // Check if PDF
      if (file.type !== "application/pdf") {
        errors[file.name] = "Only PDF files are allowed";
        return;
      }

      // Check file size (10MB limit)
      if (file.size > MAX_FILE_SIZE) {
        errors[
          file.name
        ] = `File too large! Maximum allowed size is 10MB. (${formatFileSize(
          file.size
        )})`;
        return;
      }

      // Check if file already exists in local files
      if (
        dietChartFiles.some((f) => f.name === file.name && f.size === file.size)
      ) {
        errors[file.name] = "This file is already added";
        return;
      }

      // Check if file already exists in uploaded PDFs
      if (
        uploadedPDFs.some(
          (pdf) => pdf.fileName === file.name && pdf.sizeInBytes === file.size
        )
      ) {
        errors[file.name] = "This file is already uploaded";
        return;
      }

      validFiles.push(file);
    });

    // Show errors for invalid files
    if (Object.keys(errors).length > 0) {
      setFileErrors((prev) => ({ ...prev, ...errors }));
      // Show toast for errors
      Object.entries(errors).forEach(([fileName, error]) => {
        toast.error(`${fileName}: ${error}`, {
          duration: 5000,
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            maxWidth: "500px",
          },
        });
      });
    }

    // Upload files immediately
    if (validFiles.length > 0) {
      try {
        await uploadDietChartPDFs(validFiles);
        // Files are now uploaded, don't add to local state
        // The uploaded PDFs state will be updated by uploadDietChartPDFs
        setFileErrors({});
        // Force remount file input to ensure onChange fires reliably
        setPdfInputKey((prev) => prev + 1);
      } catch (error) {
        // Upload failed, add to local state for retry
        const updatedFiles = [...dietChartFiles, ...validFiles].slice(0, 15);
        setDietChartFiles(updatedFiles);
        // Note: We don't store files in formData anymore - they upload immediately
        setFileErrors({});
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      toast.error("No files selected. Please select at least one PDF file.", {
        duration: 3000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "500px",
        },
      });
      return;
    }
    validateAndAddFiles(files);
    e.target.value = ""; // Clear input after processing
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = dietChartFiles[index];
    const updatedFiles = dietChartFiles.filter((_, i) => i !== index);
    setDietChartFiles(updatedFiles);
    // Note: Files are not stored in formData anymore - they upload immediately
    // Only local files (failed uploads) are in dietChartFiles state

    // Clear error for removed file
    if (fileToRemove && fileErrors[fileToRemove.name]) {
      const newErrors = { ...fileErrors };
      delete newErrors[fileToRemove.name];
      setFileErrors(newErrors);
    }

    toast.success("File removed", { duration: 2000 });
  };

  const removeUploadedPDF = async (index: number) => {
    const pdfToRemove = uploadedPDFs[index];
    try {
      await deleteDoctorNoteAttachment(pdfToRemove.id);
      toast.success("PDF removed successfully");
      setUploadedPDFs((prev) => prev.filter((_, i) => i !== index));
      // Notify parent to refresh attachments for preview
      if (onPDFsUploaded) {
        onPDFsUploaded();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to remove PDF. Please try again."
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DateInput
        label="Joining Date"
        value={dietPrescribed.joiningDate || ""}
        onChange={(val) =>
          updateFormData(["dietPrescribed", "joiningDate"], val)
        }
      />
      <DateInput
        label="Expiry Date"
        value={dietPrescribed.expiryDate || ""}
        onChange={(val) =>
          updateFormData(["dietPrescribed", "expiryDate"], val)
        }
      />
      <DateInput
        label="Diet Prescription Date"
        value={dietPrescribed.dietPrescriptionDate || ""}
        onChange={(val) =>
          updateFormData(["dietPrescribed", "dietPrescriptionDate"], val)
        }
      />
      <div className="md:col-span-2">
        <TextArea
          label="Duration of Diet"
          value={dietPrescribed.durationOfDiet || ""}
          onChange={(val) =>
            updateFormData(["dietPrescribed", "durationOfDiet"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <TextArea
          label="Diet Chart"
          value={dietPrescribed.dietChart || ""}
          onChange={(val) =>
            updateFormData(["dietPrescribed", "dietChart"], val)
          }
        />
      </div>
      <div className="md:col-span-2">
        <div className="input-group">
          <label className="block font-semibold mb-3 text-slate-700 text-sm sm:text-base">
            Upload Diet Charts (PDF)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Max 15 files · 10MB per file
          </p>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              const totalFiles = uploadedPDFs.length;
              if (totalFiles < 15 && !isUploading) {
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
                uploadedPDFs.length >= 15 || isUploading
                  ? "opacity-50 pointer-events-none"
                  : ""
              }
            `}
          >
            <label
              htmlFor="pdf-upload"
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
                  : uploadedPDFs.length >= 15
                  ? "Maximum 15 files reached"
                  : "Tap to upload or drag PDF files here"}
              </div>
              <div className="text-xs text-slate-400">
                PDF only · Max 10MB per file · Uploads immediately to R2
              </div>
              {uploadedPDFs.length > 0 && (
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {uploadedPDFs.length} / 15 files
                </div>
              )}

              <input
                key={`pdf-${pdfInputKey}`}
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadedPDFs.length >= 15 || isUploading}
              />
            </label>
          </div>

          {/* Local Files Preview (Failed Uploads Only) */}
          {dietChartFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">
                {`Failed Uploads (${dietChartFiles.length}) - Click to retry`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dietChartFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-orange-200 bg-orange-50 p-4 transition-all"
                  >
                    {/* PDF Icon */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 flex-shrink-0">
                        <FileText className="w-6 h-6 text-orange-600" />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-slate-800 truncate mb-1"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-orange-600 font-medium">
                          Upload failed - will retry on next selection
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition"
                        title="Remove file"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded PDFs Preview */}
          {uploadedPDFs.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">
                Uploaded PDFs ({uploadedPDFs.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {uploadedPDFs.map((pdf, index) => (
                  <div
                    key={pdf.id || index}
                    className="relative group rounded-lg overflow-hidden border border-emerald-200 bg-emerald-50 p-4 transition-all"
                  >
                    {/* PDF Icon */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 flex-shrink-0">
                        <FileText className="w-6 h-6 text-emerald-600" />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-slate-800 truncate mb-1"
                          title={pdf.fileName}
                        >
                          {pdf.fileName}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          {formatFileSize(pdf.sizeInBytes)}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium">
                          Uploaded to R2
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeUploadedPDF(index)}
                        className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition opacity-0 group-hover:opacity-100"
                        title="Remove PDF"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 mt-4">
            Uploaded diet chart PDFs will appear in the Doctor Notes preview after you Save.
          </p>
        </div>
      </div>
      <Input
        label="Code"
        value={dietPrescribed.code || ""}
        onChange={(val) => updateFormData(["dietPrescribed", "code"], val)}
      />
    </div>
  );
}
