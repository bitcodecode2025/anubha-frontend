import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemeContextProvider from "@/lib/themeProvider";
import Providers from "./Providers"; // 🌟 Global Booking Provider Wrapper
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
  title: "NutriWell | Nutrition Doctor",
  description: "Personalized nutrition and wellness care",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-800`}
      >
        <AuthProvider>
          <ThemeContextProvider>
            <Providers>
              <LogoutAnimation />
              <Navbar />
              <main className="min-h-screen pt-20">{children}</main>
              <Footer />
            </Providers>
          </ThemeContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
