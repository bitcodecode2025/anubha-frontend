import api from "./api";

export interface UploadedPDF {
  id: string;
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
  createdAt: string;
}

export interface PDFUploadResponse {
  success: boolean;
  message: string;
  files: UploadedPDF[];
}

/**
 * Upload PDF files to Cloudinary
 * Max 15 files, 10MB per file
 */
export async function uploadPDFFiles(files: File[]): Promise<PDFUploadResponse> {
  try {
    // Validate files
    if (!files || files.length === 0) {
      throw new Error("No files selected");
    }

    if (files.length > 15) {
      throw new Error("Maximum 15 PDF files allowed");
    }

    // Validate each file
    for (const file of files) {
      // Check if PDF
      if (file.type !== "application/pdf") {
        throw new Error(`File "${file.name}" is not a PDF file`);
      }

      // Check file size (10MB max)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error(
          `File "${file.name}" exceeds maximum size of 10MB`
        );
      }

      // Check if empty
      if (file.size === 0) {
        throw new Error(`File "${file.name}" is empty`);
      }
    }

    // Create FormData
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Upload to backend
    const response = await api.post<PDFUploadResponse>(
      "upload/pdf",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Add timeout for large files
        timeout: 60000, // 60 seconds
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("[PDF UPLOAD] Error:", error);
    
    // Handle specific error messages
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error("Failed to upload PDF files. Please try again.");
  }
}


