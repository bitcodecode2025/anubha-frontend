import TestimonialsClient, {
  Testimonial,
} from "@/components/home/TestimonialsClient";

const testimonials: Testimonial[] = [
  {
    img: "/testimonial/testimonial1.webp",
    name: "Mr. Sagar Masih",
    text: "The experience has been truly amazing. I feel more energetic, active, and healthier than ever before. The guidance was simple, practical, and easy to follow, which made a big difference in my daily routine.",
  },
  {
    img: "/testimonial/testimonial2.webp",
    name: "Ms. Akansha",
    text: "I sincerely thank you for your constant guidance and motivation throughout my weight loss journey. Losing 10 kg felt extremely difficult for me initially, but your personalised diet plan, practical advice, and continuous encouragement helped me stay consistent. This transformation has not only improved my physical health but has also boosted my confidence and overall well-being. I am truly grateful for your support and positive influence on my journey towards a healthier lifestyle.",
  },
  {
    img: "/testimonial/testimonial3.webp",
    name: "Mr. Ashish Sharma",
    text: "I was concerned about my increasing weight and the health issues caused by being overweight. I came to know about Ms. Anubha through a colleague and decided to consult her. She patiently listened to my concerns, created a personalised diet plan, and provided clear guidance throughout the process. The overall experience was excellent, and I would highly recommend her.",
  },
  {
    img: "/testimonial/testimonial4.webp",
    name: "Mr. Abhishek",
    text: "The guidance was clear, realistic, and well-structured. The diet plan suited my lifestyle perfectly, and I started noticing visible results within a few weeks. Highly satisfied with the overall approach.",
  },
  {
    img: "/testimonial/testimonial5.webp",
    name: "Ms. Yogita Selvaraj",
    text: "I really appreciated the personalised approach and continuous support. The diet plans were easy to follow, and the results were noticeable over time. It helped me develop healthier eating habits and a better relationship with food.",
  },
];

export default function Testimonials() {
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
