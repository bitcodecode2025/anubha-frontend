"use client";

import { motion, Variants } from "framer-motion";

export type Testimonial = {
  img: string;
  name: string;
  text: string;
};

const cardVariants: Variants = {
  offscreen: { opacity: 0, y: 120, scale: 0.8 },
  onscreen: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      delay: index * 0.12,
      ease: [0.15, 0.75, 0.35, 1.0],
    },
  }),
};

type Props = {
  testimonials: Testimonial[];
};

export default function TestimonialsClient({ testimonials }: Props) {
  return (
    <div className="grid gap-14 md:gap-12 sm:grid-cols-2 md:grid-cols-3">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.name}
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardVariants}
          custom={index}
          whileHover={{
            y: -10,
            scale: 1.04,
            boxShadow: "0 25px 70px rgba(15,118,110,0.35)",
            transition: { duration: 0.25 },
          }}
          className="rounded-3xl p-6 shadow-[0_18px_60px_rgba(15,118,110,0.15)] border border-white/40 bg-white/30 backdrop-blur-2xl flex flex-col items-center text-center transition-all"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              repeatType: "mirror",
              duration: 4.5 + index,
              ease: "easeInOut",
            }}
            className="w-full flex flex-col items-center"
          >
            <img
              src={testimonial.img}
              alt={testimonial.name}
              className="w-64 h-64 sm:w-68 sm:h-68 md:w-78 md:h-78 rounded-3xl object-cover shadow-xl border border-white/70 mb-6"
            />

            <p className="text-slate-700 italic text-lg mb-4 leading-relaxed">
              “{testimonial.text}”
            </p>

            <h3 className="text-xl font-semibold text-emerald-800">
              {testimonial.name}
            </h3>

            <div className="text-yellow-500 text-2xl mt-2">★★★★★</div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
