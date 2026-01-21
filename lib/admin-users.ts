import api from "./api";

export interface AdminUser {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  patientCount: number;
}

export interface AdminPatient {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  age: number;
  createdAt: string;
}

interface CreateUserRequest {
  name: string;
  phone?: string | null;
  email?: string | null;
  password: string;
}

interface CreateUserResponse {
  success: boolean;
  message: string;
  user: AdminUser;
}

interface ListUsersResponse {
  success: boolean;
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

interface GetUserResponse {
  success: boolean;
  user: AdminUser;
}

interface GetUserPatientsResponse {
  success: boolean;
  patients: AdminPatient[];
}

/**
 * Create a new user (admin creates on behalf of patient)
 */
export async function createUser(data: CreateUserRequest): Promise<AdminUser> {
  try {
    if (!data.name || !data.password) {
      throw new Error("Name and password are required");
    }

    const response = await api.post<CreateUserResponse>("/admin/users", data);
    if (response.data.success) {
      return response.data.user;
    }
    throw new Error(response.data.message || "Failed to create user");
  } catch (error: any) {
    throw error;
  }
}

/**
 * List all users with optional search and pagination
 */
export async function listUsers(
  search?: string,
  options?: { signal?: AbortSignal; page?: number; limit?: number }
): Promise<ListUsersResponse> {
  try {
    const params: any = {};
    if (search) params.search = search;
    if (options?.page) params.page = options.page.toString();
    if (options?.limit) params.limit = options.limit.toString();

    const config: any = {
      params,
    };
    if (options?.signal) {
      config.signal = options.signal;
    }
    const response = await api.get<ListUsersResponse>("/admin/users", config);
    if (response.data.success) {
      return response.data;
    }
    return {
      success: false,
      users: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  } catch (error: any) {
    // Re-throw abort errors
    if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
      throw error;
    }
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AdminUser> {
  try {
    const response = await api.get<GetUserResponse>(`/admin/users/${userId}`);
    if (response.data.success) {
      return response.data.user;
    }
    throw new Error("Failed to get user");
  } catch (error: any) {
    throw error;
  }
}

/**
 * Get patients for a user (admin view)
 */
export async function getUserPatients(userId: string): Promise<AdminPatient[]> {
  try {
    const response = await api.get<GetUserPatientsResponse>(
      `/admin/users/${userId}/patients`
    );
    if (response.data.success) {
      return response.data.patients;
    }
    return [];
  } catch (error: any) {
    throw error;
  }
}

interface CreatePatientForUserResponse {
  success: boolean;
  message: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
    [key: string]: any;
  };
}

/**
 * Create a patient for a specific user (admin operation)
 */
export async function createPatientForUser(
  userId: string,
  patientData: any
): Promise<CreatePatientForUserResponse> {
  try {
    const response = await api.post<CreatePatientForUserResponse>(
      `/admin/users/${userId}/patients`,
      patientData
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    isArchived: boolean;
    archivedAt: string | null;
  };
}

/**
 * Delete a user (admin operation - soft delete)
 */
export async function deleteUser(userId: string): Promise<DeleteUserResponse> {
  try {
    const response = await api.delete<DeleteUserResponse>(
      `/admin/users/${userId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
