"use client";

import { useEffect, useState } from "react";
import TestimonialsClient, {
  Testimonial,
} from "@/components/home/TestimonialsClient";
import api from "@/lib/api";

interface TestimonialsResponse {
  success: boolean;
  testimonials: Testimonial[];
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        // Check if API URL is configured
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          console.warn(
            "NEXT_PUBLIC_API_URL is not set. Using relative URL. Make sure backend is running on the same origin."
          );
        }

        const response = await api.get<TestimonialsResponse>("/testimonials");
        console.log(`testimonials: ${JSON.stringify(response.data)}`);
        setTestimonials(response.data.testimonials);
      } catch (error: any) {
        console.error("Failed to fetch testimonials:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          request: error.request,
          config: {
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method,
          },
        });
        // Fallback to empty array if API fails
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-24 px-6 bg-linear-to-b from-emerald-50/40 via-teal-50/30 to-[#F7F3ED]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold text-emerald-800 mb-5">
            Client Transformations
          </h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto text-base">
            Real stories. Real changes. Personalized nutrition that actually
            works.
          </p>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <section className="w-full py-24 px-6 bg-linear-to-b from-emerald-50/40 via-teal-50/30 to-[#F7F3ED]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-emerald-800 mb-5">
          Client Transformations
        </h2>

        <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto text-base">
          Real stories. Real changes. Personalized nutrition that actually
          works.
        </p>

        <TestimonialsClient testimonials={testimonials} />
      </div>
    </section>
  );
}
