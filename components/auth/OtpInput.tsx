"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  error = false,
  disabled = false,
  autoFocus = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null
  );

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow digits
    const sanitized = digit.replace(/\D/g, "");
    if (sanitized.length > 1) return;

    // Update the value
    const newValue = value.split("");
    newValue[index] = sanitized;
    const updatedValue = newValue.join("").slice(0, 4);
    onChange(updatedValue);

    // Auto-focus next input if digit entered
    if (sanitized && index < 3) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // If current box is empty, focus previous and clear it
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        const newValue = value.split("");
        newValue[index - 1] = "";
        onChange(newValue.join(""));
      } else {
        // Clear current box
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 4);
        if (digits.length === 4) {
          onChange(digits);
          inputRefs.current[3]?.focus();
          setFocusedIndex(3);
        }
      });
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {[0, 1, 2, 3].map((index) => (
        <motion.input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          animate={
            error && value[index]
              ? { x: [-4, 4, -3, 3, 0] }
              : focusedIndex === index
              ? { scale: 1.05 }
              : { scale: 1 }
          }
          transition={{ duration: 0.2 }}
          className={`w-12 sm:w-14 h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
            error
              ? "border-red-400 bg-red-50 text-red-700"
              : focusedIndex === index
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg"
              : "border-emerald-200 bg-white text-slate-800"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}`}
        />
      ))}
    </div>
  );
}
