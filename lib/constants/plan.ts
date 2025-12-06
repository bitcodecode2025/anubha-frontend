export interface Package {
  name: string;
  details: string;
  duration?: string;
  price: string;
}

export interface Plan {
  title: string;
  slug: string;
  description: string;
  howItWorks: string;
  packages: Package[];
  terms?: string[];
  note?: string;
  image?: string;
}

export const plans: Plan[] = [
  {
    title: "Weight Loss Plan",
    slug: "weight-loss",
    image: "/images/services/weight-loss.png",
    description: `
Weight loss with a balanced diet — no fad diets, only healthy and region-based meal plans tailored to your lifestyle to help you achieve the results you desire.

After an in-depth discussion about your daily activities, eating habits, and overall regime, a personalized, result-oriented plan is created that works for you and helps you achieve weight-loss goals the healthy and happy way.

Weight loss is not a battle that can't be won — it's about making smarter and healthier choices to fight the flab. Taking small, sustainable steps toward a lifestyle change is key. When we set realistic weight-loss goals, our efforts are more consistent and effective.

Nowadays, diet plans are available everywhere — a click away — but most of them are generalized, restrictive, and unsustainable. Following them often leaves you feeling tired, hungry, and frustrated, which can lead to binge eating and a complete reversal of progress.

Remember — just because a diet worked for someone else doesn't mean it will work for you. Just like one size doesn’t fit all, one diet can’t suit everyone.

At Dt. Anubha’s Clinic, weight loss plans are crafted to fit your personal lifestyle, ensuring they are practical, enjoyable, and effective. After understanding your routine in detail, we build a structured, result-oriented plan that helps you achieve your goals in a sustainable, happy, and healthy way.
    `,
    howItWorks: `
    This package includes:
    
    • Weekly diet plans.  
    • Best & effective 20-minute workout plans for faster and sustainable weight loss.  
    • Daily weight monitoring and feedback.  
    • Monthly full-body measurements and progress follow-ups.  
    • Recipe guides and healthy cooking tips.  
    • Travel food guidance for maintaining progress on the go.  
    • Fast & festival food plans, including healthy sweet options.  
    • One additional month of follow-up for weight maintenance, lifestyle guidance, and continued healthy eating habits.
        `,
    packages: [
      {
        name: "3-Month Plan",
        details: "8–10 kg weight loss in 3 months.",
        duration: "3 months",
        price: "₹17,800",
      },
      {
        name: "6-Month Plan",
        details: "17–20 kg weight loss in 6 months.",
        duration: "6 months",
        price: "₹26,800",
      },
    ],
    terms: [
      "If you want to freeze the weight loss journey in between, you can freeze the package for 6 to 10 days only.",
      "You can’t switch your weight loss purchase plan to another person.",
      "Fees are non-refundable.",
    ],
  },
  {
    title: "Kid's Nutrition Plan",
    slug: "kids-nutrition",
    image: "/images/services/kids-nutrition.png",
    description: `
A kids' nutrition plan provides specialized care for children's nutritional needs. It includes creating personalized meal plans, managing weight or health-related issues, dealing with fussy eaters or hyperactivity, educating families, and offering sports nutrition guidance.

This plan ensures every child receives balanced, age-appropriate meals that support their growth, concentration, and energy levels.
    `,
    howItWorks: `
This plan includes:
• In-depth discussion with mothers or caregivers about the child’s daily routine and eating habits  
• Body weight, height, and key measurements to analyze the growth chart  
• Customized diet plan and food guide delivered within 48 hours
    `,
    packages: [
      {
        name: "Kid’s Nutrition Plan",
        details:
          "Personalized diet plan and food guide for children aged 3–18 years.",
        price: "₹5,500",
      },
    ],
  },
  {
    title: "Baby's First Solid Food Plan",
    slug: "baby-solid-food",
    image: "/images/services/baby-solid.png",
    note: "Two options are available — choose any one method to introduce your baby's first food, based on your and your baby's convenience. Both methods are completely ideal and best.",
    description: `
  This plan helps parents introduce solid foods to their babies safely and confidently. 
  You can choose between two ideal methods — Baby-Led Weaning or the Traditional Way — based on what suits your baby best.
  Both options are completely safe and customized to match your baby’s readiness, age, and family lifestyle.
    `,
    howItWorks: `
  This plan includes:
  • Detailed discussion with the mother or caregiver  
  • Baby’s readiness assessment for solids  
  • Baby’s weight and height and other basic food tolerance discussion. 
  • Meal planning guidance and recipes with age appropriate meal plans.How to start,when to start, portions size,food size etc every thing is provided in depth detail. 
  • Meal planning, age-appropriate recipes, and customized diet plan 
    `,
    packages: [
      {
        name: "Option 1: Solid Food Complete Guide (Baby-Led Weaning)",
        details:
          "For parents who prefer a baby-led approach where the baby self-feeds safely, encouraging independence and sensory development.",
        price: "₹5,500",
      },
      {
        name: "Option 2: Solid Food Complete Guide (Traditional Feeding)",
        details:
          "For parents who prefer traditional spoon-feeding — includes meal guidance, portion control, and progression plans.",
        price: "₹5,500",
      },
    ],
  },
  {
    title: "Medical Management Plan",
    slug: "medical-management",
    image: "/images/services/medical-management.png",
    description: `
  Be it PCOS/PCOD, Thyroid, Insulin resistance, Diabetes, Hypertension, CKD, Liver Disease, Dialysis, Arthritis, Anaemia, Food Allergies/Intolerance, Old Age Nutrition, Child and Kids Nutrition, Autism, Pregnancy, Lactation — we’re here to guide you toward a healthier lifestyle.
  
  At Dr. Anubha’s Nutrition Clinic, medical nutrition therapy is designed to support various health conditions through personalized diet guidance and continuous monitoring. Our focus is to help you heal and recover naturally by optimizing your food choices and lifestyle habits.
    `,
    howItWorks: `
  • Customized nutritional plans tailored to your specific medical condition.  
  • We coordinate with your doctor to ensure safe, evidence-based results.  
  • Guidance on natural supplements — only once approved by your physician.  
  • Continuous progress monitoring and support.  
    `,
    packages: [
      {
        name: "Medical Management Consultation",
        details:
          "Comprehensive medical nutrition consultation with a 40-minute session.",
        duration: "40 minutes",
        price: "₹5,500",
      },
    ],
  },
  {
    title: "Groom or Bride-to-be Plan",
    slug: "groom-bride-plan",
    image: "/images/services/groom-bride.png",
    description: `
  Congratulations! You’re a groom or bride-to-be — and we know you want to look exactly how you’ve imagined yourself on your big day. This plan helps you achieve that vision naturally and radiantly.
  
  If you’re someone who desires a glowing complexion, balanced body, and healthy skin that lasts long after the wedding, this plan is designed for you. Dr. Anubha’s customized pre-wedding diet ensures that you look and feel your absolute best — inside and out.
    `,
    howItWorks: `
  • One-on-one consultation session (40 minutes).  
  • A single personalized diet plan with a complete nutrition and meal guide.  
  • Detox and rejuvenation plan to prepare your body and skin before the big day.  
  • Shopping-day food guidance and healthy snacking alternatives.  
  • Hydration and healthy drink recommendations.  
  • Fasting and feasting guide for wedding and pre-wedding events.  
    `,
    packages: [
      {
        name: "Pre-Wedding Glow Plan",
        details:
          "Customized diet and wellness plan for 40-minute consultation.",
        duration: "40 minutes",
        price: "₹3,000",
      },
    ],
  },
  {
    title: "Corporate Health & Wellness Plan",
    slug: "corporate-plan",
    image: "/images/services/corporate-plan.png",
    description: `
  With extremely hectic schedules and demanding jobs, focusing on fitness and health often takes a backseat. Since most people spend a major portion of their day at work, it’s only ideal to have a well-designed health and wellness plan for both employees and employers.
  
  At Dr. Anubha’s Nutrition Clinic, our **Corporate Health Plan** is custom-built according to each company’s requirements. The program is designed to improve the overall well-being of your team, helping individuals make sustainable, healthful choices in their everyday work environment.
    `,
    howItWorks: `
  • 40-minute corporate session — includes 30-minute workshop and 10-minute discussion.  
  • Advanced health assessment using body composition analysis (weight, BMI, body fat, and muscle mass).  
  • Colour-coded health status reports for easy interpretation.  
  • Seminars and presentations on lifestyle issues like obesity, fatigue, diabetes, etc.  
  • Office canteen inspection with healthy meal and snack recommendations.  
  • Exercise seminars and travel-friendly nutrition guides for employees.  
  • Optional one-on-one nutritional counselling for employees seeking personalized guidance.  
    `,
    packages: [
      {
        name: "Corporate Wellness Session",
        details:
          "Comprehensive 40-minute corporate session (30-minute workshop + 10-minute discussion).",
        duration: "40 minutes",
        price: "₹6,800 per session",
      },
    ],
  },
];
