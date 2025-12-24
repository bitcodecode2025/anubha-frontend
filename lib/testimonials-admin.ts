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

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const response = await api.get("/testimonials/admin");
    if (response.data.success && response.data.testimonials) {
      return response.data.testimonials;
    }
    return [];
  } catch (error: any) {
    console.error(
      "[API] Get testimonials error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function createTestimonial(
  data: FormData
): Promise<{ success: boolean; testimonial: Testimonial }> {
  try {
    const response = await api.post("/testimonials/admin", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Create testimonial error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function updateTestimonial(
  id: string,
  data: FormData
): Promise<{ success: boolean; testimonial: Testimonial }> {
  try {
    const response = await api.put(`/testimonials/admin/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Update testimonial error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}

export async function deleteTestimonial(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/testimonials/admin/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "[API] Delete testimonial error:",
      error?.response?.data || error?.message
    );
    throw error;
  }
}
