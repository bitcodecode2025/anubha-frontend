"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/auth";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

/* ------------------ FORMAT PHONE ------------------ */
const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, "");
  return digits.replace(/(\d{5})(\d{0,5})/, "$1 $2").trim();
};

/* ------------------ EXTRACT ERROR ------------------ */
const extractError = (err: any): string => {
  const api = err?.response?.data;

  if (api?.errors?.length) return api.errors[0].message;
  if (api?.message) return api.message;

  return "Something went wrong. Please try again.";
};

/* ------------------ TIMER CIRCLE ------------------ */
const TimerCircle = ({ seconds, total = 60 }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = ((total - seconds) / total) * circumference;

  return (
    <svg className="w-6 h-6 mx-auto" viewBox="0 0 30 30">
      <circle
        cx="15"
        cy="15"
        r={radius}
        stroke="#d1fae5"
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="15"
        cy="15"
        r={radius}
        stroke="#10b981"
        strokeWidth="4"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-[9px] font-semibold fill-emerald-600"
      >
        {seconds}
      </text>
    </svg>
  );
};

export default function Login() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);

  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = Array.from({ length: 4 }, () =>
    useRef<HTMLInputElement | null>(null)
  );

  /* ---------------- AUTO-REDIRECT IF ALREADY LOGGED IN ---------------- */
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const destination = user.role === "ADMIN" ? "/admin" : "/";
    router.replace(destination);
  }, [user, loading, router]);

  /* ---------------- RESTORE TIMER ON REFRESH ---------------- */
  useEffect(() => {
    const expiry = localStorage.getItem("login_otp_expiry");
    if (!expiry) return;

    const remaining = Math.floor((Number(expiry) - Date.now()) / 1000);

    if (remaining > 0) {
      setOtpSent(true);
      setTimer(remaining);
      setCanResend(false);
    } else {
      setTimer(0);
      setCanResend(true);
    }
  }, []);

  /* ---------------- TIMER HANDLING ---------------- */
  useEffect(() => {
    if (!otpSent || timer <= 0) return;

    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  useEffect(() => {
    if (timer === 0) setCanResend(true);
  }, [timer]);

  /* ---------------- VALIDATE PHONE ---------------- */
  const validatePhone = (val: string) => /^[0-9]{10}$/.test(val);

  /* ---------------- SEND OTP ---------------- */
  const handleSendOtp = async () => {
    const rawPhone = phone.replace(/\D/g, "");

    const newErrors: any = {};
    if (!validatePhone(rawPhone))
      newErrors.phone = "Enter a valid 10-digit phone number.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoadingOtp(true);

      await sendLoginOtp({ phone: rawPhone });

      const expiry = Date.now() + 60000;
      localStorage.setItem("login_otp_expiry", expiry.toString());

      setOtpSent(true);
      setTimer(60);
      setCanResend(false);
      otpRefs[0].current?.focus();

      toast.success("OTP sent successfully!");
    } catch (err: any) {
      toast.error(extractError(err));
      setErrors({ phone: extractError(err) });
    } finally {
      setLoadingOtp(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */
  const handleResendOtp = async () => {
    if (!canResend) return;

    const rawPhone = phone.replace(/\D/g, "");

    try {
      setLoadingResend(true);

      await sendLoginOtp({ phone: rawPhone });

      const expiry = Date.now() + 60000;
      localStorage.setItem("login_otp_expiry", expiry.toString());

      setTimer(60);
      setCanResend(false);
      otpRefs[0].current?.focus();

      toast.success("OTP resent!");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setLoadingResend(false);
    }
  };

  /* ---------------- HANDLE OTP CHANGE ---------------- */
  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setErrors((prev) => ({ ...prev, otp: "" }));

    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleBackspace = (value: string, index: number) => {
    if (!value && index > 0) otpRefs[index - 1].current?.focus();
  };

  /* ---------------- VERIFY OTP (AUTO-LOGIN) ---------------- */
  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 4)
      return setErrors({ otp: "Enter full 4-digit OTP." });

    try {
      setLoadingVerify(true);

      const res = await verifyLoginOtp({
        phone: phone.replace(/\D/g, ""),
        otp: otpValue,
      });

      // AUTO LOGIN
      login(res.user);

      toast.success("Logged in successfully!");
      const destination =
        (res.user?.role || res.role) === "ADMIN" ? "/admin" : "/";
      router.push(destination);
    } catch (err: any) {
      toast.error(extractError(err));
      setErrors({ otp: extractError(err) });
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <div className="h-svh flex items-center justify-center bg-gradient-to-b from-white to-emerald-50/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40"
      >
        <h1 className="text-3xl font-bold text-emerald-800 text-center mb-6">
          Login
        </h1>

        {/* ---------------- PHONE INPUT ---------------- */}
        <div className="mb-4">
          <label className="text-slate-700 font-medium text-sm">
            Phone Number
          </label>

          <div className="flex gap-2">
            <div className="p-3 rounded-xl mt-2 bg-white/80 border border-emerald-200 text-slate-700 font-semibold flex items-center">
              +91
            </div>

            <motion.input
              animate={errors.phone ? { x: [-8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.3 }}
              type="text"
              placeholder="97138 85582"
              value={phone}
              disabled={otpSent}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                if (raw.length <= 10) {
                  setPhone(formatPhone(raw));
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }
              }}
              className={`w-full mt-2 p-3 rounded-xl bg-white/80 border outline-none shadow-sm text-slate-700 transition
                ${
                  errors.phone
                    ? "border-red-400"
                    : "border-emerald-200 focus:border-emerald-500"
                }
                ${otpSent ? "opacity-60 cursor-not-allowed" : ""}`}
            />
          </div>

          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* ---------------- SEND OTP BUTTON ---------------- */}
        {!otpSent && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleSendOtp}
            disabled={loadingOtp}
            className={`w-full bg-emerald-700 text-white p-3 rounded-xl font-semibold mt-3 shadow-lg hover:bg-emerald-800 transition
              ${loadingOtp ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loadingOtp ? "Sending OTP..." : "Get OTP"}
          </motion.button>
        )}

        {/* ---------------- OTP SECTION ---------------- */}
        {otpSent && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <label className="text-slate-700 font-medium text-sm">
              Enter OTP
            </label>

            <div className="flex justify-center gap-3 mt-3 mb-2">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) =>
                    e.key === "Backspace" && handleBackspace(digit, index)
                  }
                  className="w-14 h-14 rounded-xl bg-white/80 text-center border border-emerald-300 focus:border-emerald-600 outline-none text-xl font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)] focus:shadow-[0_0_18px_rgba(16,185,129,0.55)] transition-all"
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
            )}

            {/* ---------------- TIMER / RESEND ---------------- */}
            <div className="text-center text-sm text-slate-600 mt-3">
              {loadingResend ? (
                <span className="text-emerald-700 font-semibold">
                  Sending OTP...
                </span>
              ) : canResend ? (
                <button
                  onClick={handleResendOtp}
                  disabled={loadingResend}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              ) : (
                <div className="flex flex-col items-center">
                  <TimerCircle seconds={timer} />
                  <span className="mt-1 text-xs">Resend in {timer}s</span>
                </div>
              )}
            </div>

            {/* ---------------- VERIFY OTP BUTTON ---------------- */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              onClick={handleVerifyOtp}
              disabled={loadingVerify}
              className={`w-full bg-emerald-700 text-white p-3 mt-5 rounded-xl font-semibold hover:bg-emerald-800 transition shadow-lg 
                ${loadingVerify ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loadingVerify ? "Verifying..." : "Verify OTP"}
            </motion.button>
          </motion.div>
        )}

        <p className="text-center text-slate-600 mt-6 text-sm">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-emerald-700 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
