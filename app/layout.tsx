import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemeContextProvider from "@/lib/themeProvider";
import Providers from "./Providers";
import LogoutAnimation from "@/components/ui/LogoutAnimation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anubha Nutrition – Personalized Diet & Wellness Plans",
  description:
    "Book consultations, get customized diet plans, and manage your nutrition journey with Anubha Nutrition.",
  keywords: [
    "nutritionist",
    "dietitian",
    "weight loss",
    "diet plan",
    "nutrition consultation",
    "health coach",
    "Anubha Nutrition",
    "diet app",
    "meal plan",
    "healthy eating",
  ],
  metadataBase: new URL("https://anubhanutrition.in"),
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Anubha Nutrition – Personalized Diet & Wellness Plans",
    description:
      "Transform your health with personalized diet and wellness guidance.",
    url: "https://anubhanutrition.in",
    siteName: "Anubha Nutrition",
    images: [
      {
        url: "/images/anubha_logo.webp",
        width: 1200,
        height: 630,
        alt: "Anubha Nutrition",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anubha Nutrition",
    description: "Your personalised nutrition & wellness partner.",
    images: ["/images/anubha_logo.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "https://anubhanutrition.in",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": "https://anubhanutrition.in",
    name: "Anubha Nutrition Clinic",
    alternateName: "Dt. Anubha's Nutrition",
    description:
      "Personalized nutrition consultations and diet plans by certified nutritionist Dt. Anubha Issac.",
    url: "https://anubhanutrition.in",
    logo: "https://anubhanutrition.in/images/anubha_logo.webp",
    image: "https://anubhanutrition.in/images/anubha_logo.webp",
    telephone: "+919713885582",
    email: "anubhasnutritionclinic@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Office no. 1, Upper Ground Floor, Kanaksai CHS Ltd., S.No.56, Jagdamba Bhavan Marg, Undri",
      addressLocality: "Pune",
      postalCode: "411060",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "18.4653",
      longitude: "73.8718",
    },
    priceRange: "$$",
    sameAs: [
      "https://www.facebook.com/anu.foodclinic",
      "https://www.instagram.com/anubhas_nutrition_clinic/",
      "https://www.linkedin.com/in/anubha-isaac-0799a454/",
      "https://www.youtube.com/@anubhasnutritionclinic",
    ],
    areaServed: {
      "@type": "City",
      name: "Pune",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Nutrition Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Weight Loss Plan",
            description:
              "Personalized weight loss diet plans with sustainable meal planning",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Medical Nutrition Management",
            description:
              "Specialized nutrition plans for medical conditions like diabetes, PCOS, thyroid",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Kids Nutrition",
            description:
              "Child nutrition counseling and meal plans for healthy growth",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "General Consultation",
            description:
              "One-on-one nutrition consultation and personalized diet guidance",
          },
        },
      ],
    },
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dt. Anubha Issac",
    jobTitle: "Certified Nutritionist & Dietitian",
    description:
      "Master's in Dietetics & Food Service Management with 15+ years of experience",
    url: "https://anubhanutrition.in",
    image: "https://anubhanutrition.in/images/anubha_profile_hd.webp",
    sameAs: [
      "https://www.facebook.com/anu.foodclinic",
      "https://www.instagram.com/anubhas_nutrition_clinic/",
      "https://www.linkedin.com/in/anubha-isaac-0799a454/",
    ],
    knowsAbout: [
      "Nutrition",
      "Dietetics",
      "Weight Management",
      "Clinical Dietetics",
      "Sports Nutrition",
      "Child Nutrition",
      "Renal Nutrition",
    ],
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Master's in Dietetics & Food Service Management",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-800`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema),
          }}
        />
        <Providers>
          <AuthProvider>
            <ThemeContextProvider>
              <LogoutAnimation />
              <Navbar />
              <main className="min-h-screen pt-20">{children}</main>
              <Footer />
            </ThemeContextProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
