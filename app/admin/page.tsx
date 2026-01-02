"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  // 🔒 ROUTE PROTECTION: Wait for auth, then check permissions
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.role !== "ADMIN") {
        router.replace("/");
        return;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const handleCardClick = (cardId: string) => {
    if (cardId === "slots") {
      router.push("/admin/slots");
    } else if (cardId === "appointments") {
      router.push("/admin/appointments");
    } else if (cardId === "testimonials") {
      router.push("/admin/testimonials");
    } else {
      setClickedCard(cardId);
      toast("Coming soon!", {
        icon: "🚀",
        duration: 2000,
      });
      setTimeout(() => setClickedCard(null), 2000);
    }
  };

  return (
    <main className="min-h-[70vh] px-6 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-500 mb-3">
            Admin Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Manage your appointments and schedule slots efficiently
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Edit Slots Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick("slots")}
            className={`
              relative overflow-hidden
              bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50
              rounded-2xl shadow-xl border-2 border-blue-200/50
              p-8 cursor-pointer transition-all duration-300
              ${
                clickedCard === "slots"
                  ? "ring-4 ring-blue-400 ring-offset-2"
                  : ""
              }
              hover:shadow-2xl hover:border-blue-300
            `}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Edit Slots
              </h3>

              {/* Description */}
              <p className="text-slate-600 mb-6 leading-relaxed">
                Create, modify, and manage appointment time slots. Set
                availability, add day-offs, and control your schedule.
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <span>Manage Slots</span>
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Navigate to Edit Slots */}
            </div>
          </motion.div>

          {/* Appointments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick("appointments")}
            className={`
              relative overflow-hidden
              bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50
              rounded-2xl shadow-xl border-2 border-emerald-200/50
              p-8 cursor-pointer transition-all duration-300
              ${
                clickedCard === "appointments"
                  ? "ring-4 ring-emerald-400 ring-offset-2"
                  : ""
              }
              hover:shadow-2xl hover:border-emerald-300
            `}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500 rounded-full blur-2xl" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Appointments
              </h3>

              {/* Description */}
              <p className="text-slate-600 mb-6 leading-relaxed">
                View and manage all patient appointments. Track status, update
                details, and handle scheduling efficiently.
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <span>View Appointments</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          {/* Testimonials Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick("testimonials")}
            className={`
              relative overflow-hidden
              bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50
              rounded-2xl shadow-xl border-2 border-purple-200/50
              p-8 cursor-pointer transition-all duration-300
              ${
                clickedCard === "testimonials"
                  ? "ring-4 ring-purple-400 ring-offset-2"
                  : ""
              }
              hover:shadow-2xl hover:border-purple-300
            `}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500 rounded-full blur-2xl" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Testimonials
              </h3>

              {/* Description */}
              <p className="text-slate-600 mb-6 leading-relaxed">
                Manage client testimonials. Add, edit, or remove testimonials
                displayed on the website.
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-purple-600 font-semibold">
                <span>Manage Testimonials</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
