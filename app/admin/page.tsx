"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p>Checking permissions…</p>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="min-h-[70vh] px-6 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-500 mb-3">
          Admin Dashboard
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          Welcome back, {user.name}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          Appointment management, slot controls, and patient insights are coming
          soon. We&apos;re building a powerful workspace tailored for you.
        </p>
        <div className="mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold shadow-lg">
          <Loader2 className="w-5 h-5 animate-spin" />
          Coming soon…
        </div>
      </div>
    </main>
  );
}
