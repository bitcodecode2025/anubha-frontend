import { ClipboardCheck, Video, HeartPulse } from "lucide-react";

const steps = [
  {
    id: "step1",
    title: "Step 01 — The Pre-Consultation Stage",
    icon: ClipboardCheck,
    points: [
      "Fill the ‘Client Assessment Form’ to help us understand your eating habits and fitness routine.",
      "We learn about your expectations and important health parameters.",
      "Appointment schedule is created as per your preferred days and times.",
      "All appointments are pre-booked with two days’ notice from our end.",
    ],
  },
  {
    id: "step2",
    title: "Step 02 — The Consultation Stage",
    icon: Video,
    points: [
      "At the consultation meeting, we work together on devising an eating pattern that is sustainable and a culture fit.",
      "Depending on the plan — we review and alter your meal plan and review your exercise plan.",
      "We also provide special meal plans for occasions like work travel, holiday, wedding, festivals etc.",
    ],
  },
  {
    id: "step3",
    title: "Step 03 — The Post-Consultation Stage",
    icon: HeartPulse,
    points: [
      "Once you complete the program with us, a maintenance diet summarizing all the learnings from the program and also practical guidelines are provided to you, that take care of most of the situations that you will face going forward in your daily life.",
    ],
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full py-20 px-6 md:px-10 bg-linear-to-b from-[#F7F3ED] via-[#E8F5E9] to-emerald-50/50"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-14">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div
              key={step.id}
              className="bg-white/90 border border-[#dfe7dd] rounded-3xl shadow-(--shadow-soft) hover:shadow-xl transition-shadow p-8 flex flex-col items-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <step.icon className="w-8 h-8 text-[#7fb77e]" />
                <h3 className="text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-2 text-sm leading-relaxed marker:text-[#84c0a0]">
                {step.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
