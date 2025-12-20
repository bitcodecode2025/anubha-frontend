/*
 * OLD OTP-BASED LOGIN PAGE (BACKUP)
 *
 * This file is kept as a backup of the original OTP-based authentication.
 * The current /login page now uses NextAuth with password + Google OAuth.
 *
 * If you need to restore OTP authentication, copy this file back to /login/page.tsx
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/auth";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

/* This is the old OTP-based login - kept for reference */
export default function LoginOTPBackup() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          OTP Login (Backup)
        </h1>
        <p className="text-slate-600 mb-4">
          This is the old OTP-based login page (backup).
        </p>
        <Link
          href="/login"
          className="text-emerald-700 font-semibold hover:underline"
        >
          Go to New Login Page
        </Link>
      </div>
    </div>
  );
}
