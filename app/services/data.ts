export interface Service {
  title: string;
  slug: string;
  description: string;
  image: string;
  fee: string;
}

export const services: Service[] = [
  {
    title: "Weight Loss Consultation",
    slug: "weight-loss",
    description:
      "Personalized consultation with tailored plans for sustainable weight loss — available for 3-month (6–10 kg) and 6-month (18–20 kg) programs.",
    image: "/images/weight-loss.png",
    fee: "₹1000",
  },
  {
    title: "Medical Management Consultation",
    slug: "medical-management",
    description:
      "Consultation for medical nutrition therapy in conditions like PCOS, Diabetes, Thyroid, Hypertension, CKD, and more.",
    image: "/images/medical-management.png",
    fee: "₹1000",
  },
  {
    title: "Kids Nutrition Consultation",
    slug: "kids-nutrition",
    description:
      "Nutritional consultation for babies (6 months–2 years) and kids (3–18 years). Includes solid food introduction and growth-focused meal plans.",
    image: "/images/kids-nutrition.png",
    fee: "₹1000",
  },
  {
    title: "Wedding Glow Consultation",
    slug: "wedding-glow",
    description:
      "For Brides & Grooms — get customized diet consultation to achieve glowing skin, high energy, and healthy balance before your big day.",
    image: "/images/wedding-glow.png",
    fee: "₹1000",
  },
  {
    title: "Corporate Wellness Consultation",
    slug: "corporate-plan",
    description:
      "Comprehensive consultation for corporate wellness, including health assessments, workshops, and personalized employee nutrition plans.",
    image: "/images/corporate.png",
    fee: "₹1000",
  },
];
