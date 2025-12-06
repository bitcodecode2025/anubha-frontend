import TestimonialsClient, {
  Testimonial,
} from "@/components/home/TestimonialsClient";

const testimonials: Testimonial[] = [
  {
    img: "/images/testi1.jpg",
    name: "Client One",
    text: "Amazing experience! I feel more energetic and healthier than ever.",
  },
  {
    img: "/images/testi2.jpg",
    name: "Client Two",
    text: "Lost weight safely with sustainable plans. Highly recommended!",
  },
  {
    img: "/images/testi3.jpg",
    name: "Client Three",
    text: "Great guidance and personalized diet. Visible results in weeks.",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-24 px-6 bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-cyan-50/40">
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
