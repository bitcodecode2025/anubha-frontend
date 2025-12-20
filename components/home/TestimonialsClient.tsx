"use client";

import Image from "next/image";

export type Testimonial = {
  img: string;
  name: string;
  text: string;
};

type TestimonialCardProps = {
  testimonial: Testimonial;
};

function TestimonialCard({
  testimonial,
  index,
}: TestimonialCardProps & { index: number }) {
  return (
    <div
      className="snap-center shrink-0 w-[85vw] sm:w-auto sm:snap-align-none group perspective-1000 animate-float"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="relative h-full bg-white rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 border border-emerald-100">
        {/* Content card */}

        {/* Large Transformation Image with frame */}
        <div className="relative mb-3 overflow-hidden rounded-2xl group-hover:rounded-3xl transition-all duration-500">
          <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-emerald-100/50 group-hover:ring-2 group-hover:ring-emerald-200">
            <Image
              src={testimonial.img}
              alt={testimonial.name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-emerald-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* Content section */}
        <div className="relative z-10 space-y-2">
          {/* Testimonial text - no quote icon for compactness */}
          <p className="text-slate-700 text-center leading-snug text-xs sm:text-sm font-normal italic line-clamp-3">
            "{testimonial.text}"
          </p>

          {/* Divider */}
          <div className="flex justify-center py-1">
            <div className="w-10 h-0.5 bg-linear-to-r from-transparent via-emerald-300 to-transparent" />
          </div>

          {/* Name and rating */}
          <div className="text-center space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">
              {testimonial.name}
            </h3>

            {/* Stars with gradient effect */}
            <div className="flex justify-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-yellow-400 drop-shadow-md transition-transform duration-300 hover:scale-125"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200/50">
              <svg
                className="w-3 h-3 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-700">
                Verified Client
              </span>
            </div>
          </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12" />
        </div>
      </div>
    </div>
  );
}

type Props = {
  testimonials: Testimonial[];
};

export default function TestimonialsClient({ testimonials }: Props) {
  return (
    <>
      {/* Mobile: Horizontal Scroll with Snap */}
      <div className="sm:hidden">
        {/* Scroll hint with animation */}
        <div className="flex items-center justify-center gap-3 mb-6 animate-bounce-slow">
          <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 rounded-full shadow-md">
            <svg
              className="w-5 h-5 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            <span className="text-sm font-semibold">Swipe to explore</span>
            <svg
              className="w-5 h-5 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>

        {/* Scrollable testimonials */}
        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-6 pb-4 -mx-6 px-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Tablet & Desktop: Grid Layout */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.name}
            testimonial={testimonial}
            index={index}
          />
        ))}
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .perspective-1000 {
          perspective: 1000px;
        }

        /* Floating bounce animation */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Mobile hint bounce */
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
