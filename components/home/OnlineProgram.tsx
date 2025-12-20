import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function OnlineProgram() {
  return (
    <section className="relative w-full py-24 px-6 md:px-10 bg-linear-to-b from-emerald-50/50 via-teal-50/40 to-[#E8F5E9] text-slate-800">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
          Online Programme
        </h2>

        <p className="max-w-3xl mx-auto text-lg leading-relaxed text-slate-600 mb-10">
          What’s more convenient than getting expert nutritional advice at your
          fingertips? Our <strong>Online Programme</strong> is designed for busy
          individuals or those living outside Pune. All it takes is a WhatsApp
          message — and within 48 hours, you’ll receive your personalized diet
          plan.
        </p>

        <ul className="text-slate-600 space-y-3 mb-12 text-base max-w-2xl mx-auto text-left sm:text-center list-disc list-inside marker:text-[#7fb77e]">
          <li>Send a WhatsApp message or call to get started.</li>
          <li>
            Once we receive your WhatsApp , we will send you a client assessment
            form which will be followed by a call from us to understand your
            expectations and lifestyle. A diet plan will be curated as per your
            needs to make sure you get the best.
          </li>
          <li>
            We will send you the diet plan within 48 hours, so all it will take
            is 48 hours for you to make a new and healthy lifestyle choice.
          </li>
          <li>The diet will be modified as per the plan you choose.</li>
        </ul>

        <div>
          <Link
            href="https://wa.me/919713885582"
            target="_blank"
            className="inline-flex items-center gap-2 bg-white text-[#318a63] px-6 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-[#f1faf4] active:scale-95 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Message on WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}
