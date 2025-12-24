"use client";

import { useEffect, useState } from "react";
import TestimonialsClient, {
  Testimonial,
} from "@/components/home/TestimonialsClient";
import api from "@/lib/api";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await api.get("/testimonials");
        if (response.data.success && response.data.testimonials) {
          setTestimonials(response.data.testimonials);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
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
