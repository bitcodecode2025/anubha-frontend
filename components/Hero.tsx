import Link from "next/link";
import HeroClient from "./HeroClient";

const fruits = [
  { src: "/images/fruits/broccoli.png", size: "w-14 sm:w-16 md:w-24 lg:w-24" },
  { src: "/images/fruits/apple.png", size: "w-12 sm:w-14 md:w-18 lg:w-23" },
  { src: "/images/fruits/carrot.png", size: "w-20 sm:w-20 md:w-26 lg:w-38" },
  { src: "/images/fruits/cucumber.png", size: "w-14 sm:w-16 md:w-20 lg:w-22" },
  { src: "/images/fruits/bellpeper.png", size: "w-20 sm:w-25 md:w-30 lg:w-31" },
  { src: "/images/fruits/tomato.png", size: "w-11 sm:w-13 md:w-17 lg:w-19" },
  { src: "/images/fruits/eggplant.png", size: "w-14 sm:w-16 md:w-20 lg:w-32" },
];

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center overflow-hidden pb-6">
      <HeroClient fruits={fruits} />

      <div className="absolute inset-0 bg-linear-to-b from-white/90 via-white/75 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-[70vh] sm:min-h-[60vh] px-6 max-w-3xl text-center">
        <p className="uppercase tracking-[0.35em] text-xs sm:text-sm text-emerald-600 mb-4">
          Nutritional healing that lasts
        </p>

        <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl text-slate-900 leading-tight tracking-tight mb-4">
          Heal with{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#7fb77e] via-[#82c6a8] to-[#6aa6d9]">
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
