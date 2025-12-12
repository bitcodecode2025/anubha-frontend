import Link from "next/link";
import HeroClient from "./HeroClient";

const fruits = [
  {
    src: "/images/fruits/broccoli.webp",
    size: "w-14 sm:w-16 md:w-24 lg:w-24",
    width: 96,
    height: 96,
  },
  {
    src: "/images/fruits/apple.webp",
    size: "w-12 sm:w-14 md:w-18 lg:w-23",
    width: 92,
    height: 92,
  },
  {
    src: "/images/fruits/carrot.webp",
    size: "w-20 sm:w-20 md:w-26 lg:w-38",
    width: 152,
    height: 152,
  },
  {
    src: "/images/fruits/cucumber.webp",
    size: "w-14 sm:w-16 md:w-20 lg:w-22",
    width: 88,
    height: 88,
  },
  {
    src: "/images/fruits/bellpeper.webp",
    size: "w-20 sm:w-25 md:w-30 lg:w-31",
    width: 124,
    height: 124,
  },
  {
    src: "/images/fruits/tomato.webp",
    size: "w-11 sm:w-13 md:w-17 lg:w-19",
    width: 76,
    height: 76,
  },
  {
    src: "/images/fruits/eggplant.webp",
    size: "w-14 sm:w-16 md:w-20 lg:w-32",
    width: 128,
    height: 128,
  },
];

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center overflow-hidden pb-6">
      <HeroClient fruits={fruits} />

      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF6F0]/95 via-white/80 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-[70vh] sm:min-h-[60vh] px-6 max-w-3xl text-center">
        <p className="uppercase tracking-[0.35em] text-xs sm:text-sm text-emerald-600 mb-4">
          Nutritional healing that lasts
        </p>

        <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl text-slate-900 leading-tight tracking-tight mb-4">
          Heal with{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#47d644] via-[#62d6a4] to-[#97c3ea]">
            Nutrition
          </span>
        </h1>

        <p className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
          Personalized nutrition & lifestyle guidance designed to help you feel
          better, live stronger, and achieve lasting wellness — simply and
          scientifically.
        </p>

        <div>
          <Link
            href="/services?from=hero"
            className="inline-block rounded-full bg-linear-to-r from-[#7fb77e] via-[#6fbb9c] to-[#64a0c8] text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl hover:brightness-105 active:scale-95 transition-all duration-200"
          >
            Book an Appointment
          </Link>
        </div>
      </div>
    </section>
  );
}
