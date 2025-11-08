export interface Package {
  name: string;
  slug: string;
  duration?: string;
  price: string;
  description?: string;
  features: string[];
}

export interface Plan {
  name: string;
  slug: string;
  longDescription: string;
  packages?: Package[];
  price?: string;
  features?: string[];
}

export const plans: Plan[] = [
  {
    name: "Weight Loss Plan",
    slug: "weight-loss",
    longDescription: `
Weight loss with a balanced diet — no fad diets, only region-based, healthy eating patterns.
Plans are tailored to fit your lifestyle and help you achieve lasting results. After an in-depth
discussion about your daily routine and habits, a personalized program is designed to make
smart, sustainable changes that lead to visible transformation.
`,
    packages: [
      {
        name: "1 Month Package",
        slug: "weight-loss-1-month",
        duration: "3–4 kg weight loss",
        price: "₹6,800",
        features: [
          "Weekly diet plans",
          "Daily weight check",
          "Monthly full body measurement follow-up",
          "1-month maintenance and healthy habit guide",
        ],
      },
      {
        name: "3 Month Package",
        slug: "weight-loss-3-month",
        duration: "8–10 kg weight loss",
        price: "₹17,800",
        features: [
          "Personalized diet plans for each month",
          "Weekly follow-ups & adjustments",
          "1-month post-program maintenance",
        ],
      },
      {
        name: "6 Month Package",
        slug: "weight-loss-6-month",
        duration: "17–20 kg weight loss",
        price: "₹26,800",
        features: [
          "Long-term transformation & lifestyle coaching",
          "Monthly progress tracking & body measurements",
          "Post-program maintenance plan",
        ],
      },
    ],
  },

  // 👶 KIDS NUTRITION PLAN
  {
    name: "Kids Nutrition Plan",
    slug: "kids-nutrition",
    longDescription: `
Specialized nutrition care for children from 6 months to 18 years, helping manage fussy eating,
hyperactivity, weight issues, and growth optimization. Personalized meal plans and guidance
for mothers and caregivers to establish healthy eating habits early.
`,
    packages: [
      {
        name: "Baby First Solid Food (6 months – 2 years)",
        slug: "kids-solid-food",
        price: "₹5,500",
        features: [
          "Baby readiness & tolerance discussion",
          "Meal planning and portion guidance",
          "Traditional & Baby-led feeding options",
          "Custom diet plan with age-appropriate recipes",
        ],
      },
      {
        name: "Kids Food Plan (3–18 years)",
        slug: "kids-food-plan",
        price: "₹5,500",
        features: [
          "Growth chart assessment",
          "Custom diet plan within 48 hours",
          "Caregiver consultation",
        ],
      },
    ],
  },

  // 🩺 MEDICAL MANAGEMENT
  {
    name: "Medical Management Plan",
    slug: "medical-management",
    longDescription: `
A specialized nutrition program for PCOS/PCOD, Diabetes, Hypertension, CKD, Liver Disorders,
Arthritis, Anaemia, and more. We work alongside your doctor to craft a customized diet that
supports medical treatment and gradually reduces dependency on medication.
`,
    price: "₹5,500",
    features: [
      "Condition-specific nutritional plan",
      "Doctor-approved dietary guidance",
      "Natural supplement support (as advised)",
    ],
  },

  // 💍 WEDDING GLOW PLAN
  {
    name: "Wedding Glow Plan (Bride & Groom)",
    slug: "wedding-glow",
    longDescription: `
Get glowing skin, high energy, and a healthy body before your big day! This plan is designed
to detoxify and nourish from within. Includes guidance for hectic days, outside eating,
and fasting & feasting plans.
`,
    price: "₹3,000",
    features: [
      "Custom glow diet plan",
      "Detox & hydration strategy",
      "Skin-nourishing recipes",
      "Healthy shopping & snack guide",
    ],
  },

  // 🏢 CORPORATE PLAN
  {
    name: "Corporate Wellness Plan",
    slug: "corporate-plan",
    longDescription: `
A workplace-focused wellness program designed for employees and employers.
Includes body composition analysis, lifestyle education, and canteen audits
to promote sustainable health habits in organizations.
`,
    price: "₹6,800/session",
    features: [
      "30-min workshop + 10-min personalized discussion",
      "BMI and body composition analysis",
      "Lifestyle & stress management guidance",
      "Healthy food options for office canteens",
    ],
  },
];
