"use client";

import React, { useEffect, useState } from "react";
import { useBookingForm } from "../context/BookingFormContext";
import { calcAgeFromDOB } from "../utils/calcAge";

interface StepPersonalProps {
  error?: string | null;
  fieldErrors?: Record<string, string>;
}

export default function StepPersonal({
  error,
  fieldErrors,
}: StepPersonalProps) {
  const { form, setForm } = useBookingForm();

  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");

  /* ---------------------------------------
      Auto-calc age when DOB changes
  ---------------------------------------- */
  useEffect(() => {
    if (!form.dob) return;

    const age = calcAgeFromDOB(form.dob);
    if (age !== undefined && !isNaN(age)) {
      setForm({ age });
    }
  }, [form.dob]);

  /* ---------------------------------------
      Validate mobile (10 digits)
  ---------------------------------------- */
  function handleMobile(val: string) {
    const cleaned = val.replace(/\D/g, "");

    if (cleaned.length > 10) return;

    setForm({ mobile: cleaned });

    if (cleaned.length !== 10) {
      setMobileError("Mobile number must be 10 digits");
    } else {
      setMobileError("");
    }
  }

  /* ---------------------------------------
      Validate email format
  ---------------------------------------- */
  function handleEmail(val: string) {
    setForm({ email: val });

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Personal Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <input
            className={`input ${fieldErrors?.fullName ? "border-red-500" : ""}`}
            placeholder="Full Name"
            value={form.fullName || ""}
            onChange={(e) => setForm({ fullName: e.target.value })}
          />
          {fieldErrors?.fullName && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Mobile with +91 prefix */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 rounded-lg bg-slate-100 border text-sm text-slate-700">
              +91
            </span>
            <input
              className={`input flex-1 ${
                fieldErrors?.mobile ? "border-red-500" : ""
              }`}
              placeholder="10-digit mobile number"
              value={form.mobile || ""}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => handleMobile(e.target.value)}
            />
          </div>
          {mobileError && (
            <p className="text-red-500 text-xs mt-1">{mobileError}</p>
          )}
          {fieldErrors?.mobile && !mobileError && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.mobile}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            className={`input ${fieldErrors?.email ? "border-red-500" : ""}`}
            placeholder="Email address"
            type="email"
            value={form.email || ""}
            onChange={(e) => handleEmail(e.target.value)}
          />
          {emailError && (
            <p className="text-red-500 text-xs mt-1">{emailError}</p>
          )}
          {fieldErrors?.email && !emailError && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* DOB — mobile friendly */}
        <div>
          <input
            className={`input ${fieldErrors?.dob ? "border-red-500" : ""}`}
            type="date"
            placeholder="Date of Birth"
            value={form.dob || ""}
            onChange={(e) => setForm({ dob: e.target.value })}
          />
          {fieldErrors?.dob && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.dob}</p>
          )}
        </div>

        {/* AGE — user can manually type */}
        <div>
          <input
            className={`input ${fieldErrors?.age ? "border-red-500" : ""}`}
            type="number"
            placeholder="Age"
            value={form.age ?? ""}
            onChange={(e) => setForm({ age: Number(e.target.value) })}
            min={1}
            max={120}
          />
          {fieldErrors?.age && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.age}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <select
            className={`input ${fieldErrors?.gender ? "border-red-500" : ""}`}
            value={form.gender || ""}
            onChange={(e) => setForm({ gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          {fieldErrors?.gender && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.gender}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <input
            className={`input ${fieldErrors?.address ? "border-red-500" : ""}`}
            placeholder="Complete Address"
            value={form.address || ""}
            onChange={(e) => setForm({ address: e.target.value })}
          />
          {fieldErrors?.address && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
