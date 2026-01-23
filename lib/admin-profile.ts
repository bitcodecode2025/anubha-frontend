import api from "./api";

interface GetProfilePictureResponse {
  success: boolean;
  profilePictureUrl: string | null;
}

interface UploadProfilePictureResponse {
  success: boolean;
  message: string;
  profilePictureUrl: string;
}

interface UpdateProfilePictureResponse {
  success: boolean;
  message: string;
  profilePictureUrl: string;
}

interface DeleteProfilePictureResponse {
  success: boolean;
  message: string;
}

/**
 * Get admin profile picture
 */
export async function getAdminProfilePicture(): Promise<{
  profilePictureUrl: string | null;
}> {
  try {
    const response = await api.get<GetProfilePictureResponse>(
      "/admin/profile/picture"
    );
    if (response.data.success) {
      return {
        profilePictureUrl: response.data.profilePictureUrl || null,
      };
    }
    return { profilePictureUrl: null };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Upload admin profile picture
 */
export async function uploadAdminProfilePicture(
  file: File
): Promise<{ success: boolean; profilePictureUrl: string }> {
  try {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await api.post<UploadProfilePictureResponse>(
      "/admin/profile/picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return {
      success: response.data.success,
      profilePictureUrl: response.data.profilePictureUrl,
    };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Update admin profile picture
 */
export async function updateAdminProfilePicture(
  file: File
): Promise<{ success: boolean; profilePictureUrl: string }> {
  try {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await api.put<UpdateProfilePictureResponse>(
      "/admin/profile/picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return {
      success: response.data.success,
      profilePictureUrl: response.data.profilePictureUrl,
    };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Delete admin profile picture
 */
export async function deleteAdminProfilePicture(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await api.delete<DeleteProfilePictureResponse>(
      "/admin/profile/picture"
    );
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    throw error;
  }
}
