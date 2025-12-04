export default function About() {
  return (
    <div className="bg-white/90 rounded-3xl shadow-(--shadow-soft) px-6 sm:px-10 py-10 sm:py-14 border border-[#1a3613] backdrop-blur-lg flex flex-col items-center">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900 text-center">
        Meet Dt. Anubha
      </h2>
      <div className="text-slate-600 text-md leading-relaxed max-w-2xl w-full">
        <p className="mb-4 text-center">
          Dt. Anubha Issac is a highly qualified and experienced nutrition
          expert with a Master’s degree in{" "}
          <strong>Dietetics &amp; Food Service Management</strong>. Over the
          past <strong>15 years</strong>, she has helped countless individuals
          achieve better health and sustainable lifestyle transformations
          through scientific, personalized nutrition guidance.
        </p>
        <p className="mb-2 text-center">
          <strong>She holds multiple certifications, including:</strong>
        </p>
        <ul className="list-disc list-inside my-4 mx-auto text-left max-w-md pl-5 marker:text-emerald-500">
          <li>Specialist in Weight Management</li>
          <li>Advanced Clinical Dietetics</li>
          <li>Sports Nutrition</li>
          <li>Child Nutrition and Health Education</li>
          <li>Renal Nutrition</li>
        </ul>
        <p className="text-center">
          With deep clinical knowledge and a compassionate approach, Dt. Anubha
          designs holistic diet plans that align with each individual’s medical
          condition, fitness goals, and lifestyle. Her focus goes beyond diet
          charts — she builds lasting, mindful eating habits that empower people
          to take charge of their own well-being.
        </p>
      </div>
    </div>
  );
}
