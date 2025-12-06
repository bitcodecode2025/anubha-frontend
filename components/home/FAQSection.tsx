import FAQAccordionClient, {
  FAQItem,
} from "@/components/home/FAQAccordionClient";

const faqs: FAQItem[] = [
  {
    question: "What do you expect in Anubha’s Nutrition Clinic?",
    answer:
      "Anubha’s Nutrition Clinic is a healthcare facility where dietitians provide personalized nutrition counseling and guidance to individuals, groups, or communities.",
  },
  {
    question: "What services does Anubha’s Nutrition Clinic offer?",
    answer:
      "Anubha’s Nutrition Clinic offers a range of services including nutrition assessment, personalized meal planning, weight loss programs, medical management, food allergy and intolerance management, wedding glow plans, baby & toddler first solid food, and child & old age nutrition plans.",
  },
  {
    question: "Who can benefit from visiting a dietitian clinic?",
    answer:
      "Anyone can benefit from visiting a dietitian clinic, including individuals with chronic health conditions, those looking to manage their weight, and those seeking general health and wellness guidance",
  },
  {
    question: "What can I expect during my first visit?",
    answer:
      "During your first visit, you can expect a comprehensive assessment of your dietary habits, health status, and lifestyle. The dietitian will work with you to develop a personalized nutrition plan.",
  },
  {
    question: "How long does a typical dietitian appointment last?",
    answer:
      "Appointments usually last around 30–40 minutes, depending on the nature of the consultation.",
  },
  {
    question: "How often should I visit a dietitian clinic?",
    answer:
      "The frequency of visits depends on your health goals. Some clients prefer monthly check-ins, while others come once every few months for follow-ups.",
  },
  {
    question: "Can I get a personalized meal plan?",
    answer:
      "Yes, dietitians can create personalized meal plans tailored to your specific needs and health goals.",
  },
  {
    question: "How will the consultation process work if I don’t live in Pune?",
    answer:
      "Our consultation is designed to benefit all clients, no matter where they live. Besides in-person meetings, clients can interact with us via the phone/ Skype calls/ FaceTime, and email. In fact, many of our Pune -based clients also opt for video/ Audio chats for their appointments",
  },
  {
    question: "What happens once I make the payment?",
    answer:
      "We will generate your appointment schedule and send you a ‘Getting to Know You’ sheet. This contains all the info we will require from you to start the program. No other tests / reports are necessary; however, you are free to share the reports you already have.",
  },
  {
    question: "I travel a lot. How would that be accommodated?",
    answer:
      "Most of our clients have travel as an essential part of their jobs. The diet plan will be designed keeping in tune with the lifestyle and job requirements you might have. You will be educated on how to plan meals while traveling and assisted with choosing best options when you are in a new country/ city.",
  },
  {
    question: "I work in different shifts. Will the plan account for that?",
    answer:
      "We will design an eating pattern that fits into your work schedule & lifestyle. If you do work in shifts (day & night), your meal plan will be tweaked depending on your nutritional requirements as per the work shifts and the availability and practicality of food choices.",
  },
  {
    question: "Will exercise advice also be included in the package?",
    answer:
      "Yes. Your current fitness levels and exercise pattern will be analysed for any additional changes that need to be made. Specific plans, for example exercise prescriptions to be followed at your gym, will be given to you.",
  },
  {
    question: "What kind of exercise is recommended?",
    answer:
      "Any form of exercise that challenges you and is an enjoyable experience. It could be strength training, running or Yoga and also recreational exercise like dancing, swimming, cycling, etc. You will also be educated on the basics of exercise physiology and bio-mechanics so that you have good fundamentals and can make intelligent choices in the future also.",
  },
];

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="w-full py-20 px-6 md:px-10 bg-gradient-to-b from-[#F0EBE0] via-[#F5F1EB] to-white"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-10">
          Frequently Asked Questions
        </h2>

        <FAQAccordionClient faqs={faqs} />
      </div>
    </section>
  );
}
