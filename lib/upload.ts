import api from "./api";

export interface UploadedFile {
  id: string;
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
  patientId: string | null;
}

export interface UploadResponse {
  message: string;
  files: UploadedFile[];
}

export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  try {
    if (!files || files.length === 0) {
      throw new Error("At least one file is required");
    }
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await api.post<UploadResponse>("upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.files || [];
  } catch (error: any) {
    console.error("[API] Upload files error:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
}

export async function deleteFile(fileId: string): Promise<void> {
  try {
    if (!fileId) {
      throw new Error("File ID is required");
    }
    await api.delete(`patients/file/${fileId}`);
  } catch (error: any) {
    console.error("[API] Delete file error:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
}

export async function linkFilesToPatient(
  patientId: string,
  fileIds: string[]
): Promise<void> {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }
    if (!fileIds || fileIds.length === 0) {
      throw new Error("At least one file ID is required");
    }
    await api.patch(`patients/${patientId}/files`, { fileIds });
  } catch (error: any) {
    console.error("[API] Link files to patient error:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
}
