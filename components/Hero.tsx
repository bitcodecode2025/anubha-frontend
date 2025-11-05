import Link from "next/link";

const Hero = () => (
  <section
    className="relative flex h-screen flex-col items-center justify-center bg-cover md:bg-contain bg-center text-center"
    style={{ backgroundImage: "url('/images/heroposter.png')" }}
  >
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
    <div className="relative z-10 px-6 text-white">
      <h1 className="mb-4 text-4xl font-bold md:text-6xl">
        Heal with Nutrition
      </h1>
      <p className="mb-8 text-lg md:text-xl">
        Personalized diet & lifestyle plans for lasting wellness.
      </p>
      <Link
        href="/book-appointment"
        className="rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-700"
      >
        Book Appointment
      </Link>
    </div>
  </section>
);

export default Hero;
