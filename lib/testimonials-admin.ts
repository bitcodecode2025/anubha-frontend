import api from "./api";

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetTestimonialsResponse {
  success: boolean;
  testimonials: Testimonial[];
  total: number;
  page: number;
  limit: number;
}

interface CreateTestimonialResponse {
  success: boolean;
  testimonial: Testimonial;
}

interface UpdateTestimonialResponse {
  success: boolean;
  testimonial: Testimonial;
}

interface DeleteTestimonialResponse {
  success: boolean;
  message: string;
}

export async function getTestimonials(
  params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }
): Promise<GetTestimonialsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.isActive !== undefined)
      queryParams.set("isActive", params.isActive.toString());
    if (params?.search) queryParams.set("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/testimonials/admin?${queryString}`
      : "/testimonials/admin";
    const response = await api.get<GetTestimonialsResponse>(url);
    if (response.data.success) {
      return response.data;
    }
    return {
      success: false,
      testimonials: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function createTestimonial(
  data: FormData
): Promise<{ success: boolean; testimonial: Testimonial }> {
  try {
    const response = await api.post<CreateTestimonialResponse>(
      "/testimonials/admin",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function updateTestimonial(
  id: string,
  data: FormData
): Promise<{ success: boolean; testimonial: Testimonial }> {
  try {
    const response = await api.put<UpdateTestimonialResponse>(
      `/testimonials/admin/${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteTestimonial(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<DeleteTestimonialResponse>(
      `/testimonials/admin/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
