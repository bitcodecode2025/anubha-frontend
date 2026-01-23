"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Upload, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  getDoctorNotes,
  saveDoctorNotes,
  getDoctorNoteAttachmentViewUrl,
  deleteDoctorNoteAttachment,
} from "@/lib/doctor-notes-api";
import api from "@/lib/api";

interface PrePostImagesSectionProps {
  formData: any;
  updateFormData: any;
  getFormValue: any;
  appointmentId: string;
}

export default function PrePostImagesSection({
  formData,
  updateFormData,
  getFormValue,
  appointmentId,
}: PrePostImagesSectionProps) {
  const prePostConsultationImages =
    getFormValue(["prePostConsultationImages"]) || {};

  const [preImages, setPreImages] = useState<File[]>([]);
  const [postImages, setPostImages] = useState<File[]>([]);
  const [uploadedPreImages, setUploadedPreImages] = useState<any[]>(
    prePostConsultationImages.uploadedPreImages || []
  );
  const [uploadedPostImages, setUploadedPostImages] = useState<any[]>(
    prePostConsultationImages.uploadedPostImages || []
  );

  const [preImageErrors, setPreImageErrors] = useState<{
    [fileName: string]: string;
  }>({});
  const [postImageErrors, setPostImageErrors] = useState<{
    [fileName: string]: string;
  }>({});

  const [dragActivePre, setDragActivePre] = useState(false);
  const [dragActivePost, setDragActivePost] = useState(false);
  const [isUploadingPre, setIsUploadingPre] = useState(false);
  const [isUploadingPost, setIsUploadingPost] = useState(false);
  
  // Key-based remount for file inputs to ensure onChange fires reliably
  const [preInputKey, setPreInputKey] = useState(0);
  const [postInputKey, setPostInputKey] = useState(0);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const MAX_IMAGES_PER_CATEGORY = 10;

  // Note: Pre/post consultation images are uploaded immediately on selection
  // They are NOT stored in formData. Preview reads from uploaded images state (backend attachments).
  // Local files (preImages/postImages) are only used for failed uploads that need retry.

  useEffect(() => {
    // Initialize uploaded images from formData when it loads
    const loadExistingImages = async () => {
      try {
        const response = await getDoctorNotes(appointmentId);
        if (response.success && response.doctorNotes?.attachments) {
          const preImages = response.doctorNotes.attachments.filter(
            (att: any) =>
              att.fileCategory === "IMAGE" &&
              att.section === "PrePostConsultation" &&
              !att.isArchived &&
              att.filePath?.includes("/pre/")
          );
          const postImages = response.doctorNotes.attachments.filter(
            (att: any) =>
              att.fileCategory === "IMAGE" &&
              att.section === "PrePostConsultation" &&
              !att.isArchived &&
              att.filePath?.includes("/post/")
          );

          setUploadedPreImages(
            preImages.map((img: any) => ({
              id: img.id,
              fileName: img.fileName,
              filePath: img.filePath,
              mimeType: img.mimeType,
              sizeInBytes: img.sizeInBytes,
            }))
          );
          setUploadedPostImages(
            postImages.map((img: any) => ({
              id: img.id,
              fileName: img.fileName,
              filePath: img.filePath,
              mimeType: img.mimeType,
              sizeInBytes: img.sizeInBytes,
            }))
          );
        }
      } catch (error) {
        // Ignore errors - images might not exist yet
      }
    };

    if (appointmentId) {
      loadExistingImages();
    }
  }, [appointmentId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Upload pre/post consultation images immediately after selection
  const uploadConsultationImages = async (
    files: File[],
    isPre: boolean
  ): Promise<void> => {
    if (files.length === 0) return;

    const setLoadingState = isPre ? setIsUploadingPre : setIsUploadingPost;
    setLoadingState(true);

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
      const fieldName = isPre ? "preConsultationImages" : "postConsultationImages";
      files.forEach((file) => {
        formData.append(fieldName, file);
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
        // Refresh uploaded images from backend
        const notesResponse = await getDoctorNotes(appointmentId);
        if (notesResponse.success && notesResponse.doctorNotes?.attachments) {
          const category = isPre ? "pre" : "post";
          const uploaded = notesResponse.doctorNotes.attachments.filter(
            (att: any) =>
              att.fileCategory === "IMAGE" &&
              att.section === "PrePostConsultation" &&
              !att.isArchived &&
              att.filePath?.includes(`/${category}/`)
          );

          if (isPre) {
            setUploadedPreImages(
              uploaded.map((img: any) => ({
                id: img.id,
                fileName: img.fileName,
                filePath: img.filePath,
                mimeType: img.mimeType,
                sizeInBytes: img.sizeInBytes,
              }))
            );
          } else {
            setUploadedPostImages(
              uploaded.map((img: any) => ({
                id: img.id,
                fileName: img.fileName,
                filePath: img.filePath,
                mimeType: img.mimeType,
                sizeInBytes: img.sizeInBytes,
              }))
            );
          }
        }

        toast.success(
          `Successfully uploaded ${files.length} image(s)`,
          { duration: 3000 }
        );
      } else {
        throw new Error(response.data.error || "Upload failed");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to upload images";
      toast.error(errorMessage, { duration: 5000 });
      throw error;
    } finally {
      setLoadingState(false);
    }
  };

  const validateAndAddImages = async (
    files: File[],
    currentImages: File[],
    uploadedImages: any[],
    setImageState: React.Dispatch<React.SetStateAction<File[]>>,
    setImageErrors: React.Dispatch<
      React.SetStateAction<{ [fileName: string]: string }>
    >,
    isPre: boolean
  ) => {
    const errors: { [fileName: string]: string } = {};
    const validFiles: File[] = [];

    const totalFiles =
      currentImages.length + uploadedImages.length + files.length;
    if (totalFiles > MAX_IMAGES_PER_CATEGORY) {
      toast.error(
        `Cannot add ${files.length} image(s). Maximum ${MAX_IMAGES_PER_CATEGORY} images allowed in total.`,
        {
          duration: 5000,
        }
      );
      return;
    }

    files.forEach((file) => {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        errors[file.name] = "Only PNG, JPG, JPEG images are allowed";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors[
          file.name
        ] = `File too large! Max size is 10MB. (${formatFileSize(file.size)})`;
        return;
      }

      if (
        currentImages.some((f) => f.name === file.name && f.size === file.size)
      ) {
        errors[file.name] = "This image is already added";
        return;
      }

      if (
        uploadedImages.some(
          (img) => img.fileName === file.name && img.sizeInBytes === file.size
        )
      ) {
        errors[file.name] = "This image is already uploaded";
        return;
      }

      validFiles.push(file);
    });

    if (Object.keys(errors).length > 0) {
      setImageErrors((prev) => ({ ...prev, ...errors }));
      Object.entries(errors).forEach(([fileName, error]) => {
        toast.error(`${fileName}: ${error}`, { duration: 5000 });
      });
    }

    if (validFiles.length > 0) {
      // Upload files immediately
      try {
        await uploadConsultationImages(validFiles, isPre);
        // Files are now uploaded, don't add to local state
        // The uploaded images state will be updated by uploadConsultationImages
        setImageErrors({});
      } catch (error) {
        // Upload failed, add to local state for retry
        setImageState((prev) =>
          [...prev, ...validFiles].slice(0, MAX_IMAGES_PER_CATEGORY)
        );
      }
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isPre: boolean
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (isPre) {
        validateAndAddImages(
          filesArray,
          preImages,
          uploadedPreImages,
          setPreImages,
          setPreImageErrors,
          true
        );
        // Force remount by updating key to ensure onChange fires on next selection
        setPreInputKey((prev) => prev + 1);
      } else {
        validateAndAddImages(
          filesArray,
          postImages,
          uploadedPostImages,
          setPostImages,
          setPostImageErrors,
          false
        );
        // Force remount by updating key to ensure onChange fires on next selection
        setPostInputKey((prev) => prev + 1);
      }
      // Reset input value (additional safety measure)
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, isPre: boolean) => {
    e.preventDefault();
    setDragActivePre(false);
    setDragActivePost(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      if (isPre) {
        validateAndAddImages(
          filesArray,
          preImages,
          uploadedPreImages,
          setPreImages,
          setPreImageErrors,
          true
        );
      } else {
        validateAndAddImages(
          filesArray,
          postImages,
          uploadedPostImages,
          setPostImages,
          setPostImageErrors,
          false
        );
      }
    }
  };

  const removeLocalImage = (index: number, isPre: boolean) => {
    if (isPre) {
      setPreImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPostImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const removeUploadedImage = async (
    attachmentId: string,
    fileName: string,
    isPre: boolean
  ) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    const setLoadingState = isPre ? setIsUploadingPre : setIsUploadingPost;
    setLoadingState(true);
    try {
      const result = await deleteDoctorNoteAttachment(attachmentId);
      if (result.success) {
        toast.success("Image deleted successfully", { duration: 3000 });
        if (isPre) {
          setUploadedPreImages((prev) =>
            prev.filter((img) => img.id !== attachmentId)
          );
        } else {
          setUploadedPostImages((prev) =>
            prev.filter((img) => img.id !== attachmentId)
          );
        }
      } else {
        throw new Error(result.error || "Failed to delete image");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to delete image",
        {
          duration: 5000,
        }
      );
    } finally {
      setLoadingState(false);
    }
  };

  // Thumbnail component for uploaded images (fetches signed URL on demand)
  const PrePostImageThumbnail = ({
    image,
    onRemove,
  }: {
    image: any;
    onRemove: () => void;
  }) => {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loadingUrl, setLoadingUrl] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchSignedUrl = async () => {
        if (!image.filePath) {
          setError("Image path missing.");
          setLoadingUrl(false);
          return;
        }
        try {
          setLoadingUrl(true);
          const result = await getDoctorNoteAttachmentViewUrl(image.id);
          if (result.success && result.signedUrl) {
            setSignedUrl(result.signedUrl);
          } else {
            setError(result.error || "Failed to load image.");
          }
        } catch (err: any) {
          setError(err?.response?.data?.error || "Failed to load image.");
        } finally {
          setLoadingUrl(false);
        }
      };
      fetchSignedUrl();
    }, [image.id, image.filePath]);

    return (
      <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
        {loadingUrl ? (
          <div className="flex items-center justify-center h-32 bg-slate-100">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 bg-red-50 text-red-700 text-xs p-2 text-center">
            Error: {error}
          </div>
        ) : signedUrl ? (
          <img
            src={signedUrl}
            alt={image.fileName}
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-32 bg-slate-100 text-slate-500 text-xs p-2 text-center">
            No preview
          </div>
        )}
        <div
          className="p-2 text-xs text-slate-600 truncate"
          title={image.fileName}
        >
          {image.fileName}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
          title="Remove image"
        >
          <XIcon className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const ImageUploadArea = ({
    title,
    files,
    uploadedFiles,
    isPre,
    dragActive,
    isUploading,
    handleFileChange,
    handleDrop,
    removeLocalImage,
    removeUploadedImage,
  }: {
    title: string;
    files: File[];
    uploadedFiles: any[];
    isPre: boolean;
    dragActive: boolean;
    isUploading: boolean;
    handleFileChange: (
      e: React.ChangeEvent<HTMLInputElement>,
      isPre: boolean
    ) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, isPre: boolean) => void;
    removeLocalImage: (index: number, isPre: boolean) => void;
    removeUploadedImage: (
      attachmentId: string,
      fileName: string,
      isPre: boolean
    ) => Promise<void>;
  }) => (
    <div className="flex-1 min-w-0">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">{title}</h4>
      <div className="input-group">
        <p className="text-xs text-slate-500 mb-3">
          Max {MAX_IMAGES_PER_CATEGORY} files · 10MB per file · JPG, JPEG, PNG
          only
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            const totalFiles = files.length + uploadedFiles.length;
            if (totalFiles < MAX_IMAGES_PER_CATEGORY && !isUploading) {
              if (isPre) setDragActivePre(true);
              else setDragActivePost(true);
            }
          }}
          onDragLeave={() => {
            if (isPre) setDragActivePre(false);
            else setDragActivePost(false);
          }}
          onDrop={(e) => handleDrop(e, isPre)}
          className={`
            border-2 rounded-xl p-5 text-center transition-all cursor-pointer
            ${
              dragActive
                ? "border-emerald-600 bg-emerald-50"
                : "border-gray-300 bg-white hover:border-emerald-400"
            }
            ${
              files.length + uploadedFiles.length >= MAX_IMAGES_PER_CATEGORY ||
              isUploading
                ? "opacity-50 pointer-events-none"
                : ""
            }
          `}
        >
          <label
            htmlFor={`image-upload-${isPre ? "pre" : "post"}`}
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
                : files.length + uploadedFiles.length >= MAX_IMAGES_PER_CATEGORY
                ? `Maximum ${MAX_IMAGES_PER_CATEGORY} files reached`
                : "Tap to upload or drag images here"}
            </div>
            <div className="text-xs text-slate-400">
              JPG, JPEG, PNG only · Max 10MB per file
            </div>
            {files.length + uploadedFiles.length > 0 && (
              <div className="text-xs text-slate-500 font-medium mt-1">
                {files.length + uploadedFiles.length} /{" "}
                {MAX_IMAGES_PER_CATEGORY} files
              </div>
            )}
            <input
              key={isPre ? `pre-${preInputKey}` : `post-${postInputKey}`}
              id={`image-upload-${isPre ? "pre" : "post"}`}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              multiple
              className="hidden"
              onChange={(e) => handleFileChange(e, isPre)}
              disabled={
                files.length + uploadedFiles.length >=
                  MAX_IMAGES_PER_CATEGORY || isUploading
              }
            />
          </label>
        </div>

        {/* Local Files Preview */}
        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              {isUploading
                ? "Uploading Files..."
                : `Selected Files (${files.length})`}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border border-blue-200 bg-blue-50 shadow-sm"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-24 object-cover"
                  />
                  <div
                    className="p-2 text-xs text-blue-700 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLocalImage(index, isPre)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
                    title="Remove image"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Uploaded Images ({uploadedFiles.length})
            </p>
            <div className="grid grid-cols-2 gap-3">
              {uploadedFiles.map((image) => (
                <PrePostImageThumbnail
                  key={image.id}
                  image={image}
                  onRemove={() =>
                    removeUploadedImage(image.id, image.fileName, isPre)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <ImageUploadArea
          title="Pre-Consultation Images (Before)"
          files={preImages}
          uploadedFiles={uploadedPreImages.filter((img: any) =>
            img.filePath?.includes("/pre/")
          )}
          isPre={true}
          dragActive={dragActivePre}
          isUploading={isUploadingPre}
          handleFileChange={handleFileChange}
          handleDrop={handleDrop}
          removeLocalImage={removeLocalImage}
          removeUploadedImage={removeUploadedImage}
        />
        <ImageUploadArea
          title="Post-Consultation Images (After)"
          files={postImages}
          uploadedFiles={uploadedPostImages.filter((img: any) =>
            img.filePath?.includes("/post/")
          )}
          isPre={false}
          dragActive={dragActivePost}
          isUploading={isUploadingPost}
          handleFileChange={handleFileChange}
          handleDrop={handleDrop}
          removeLocalImage={removeLocalImage}
          removeUploadedImage={removeUploadedImage}
        />
      </div>
    </div>
  );
}
