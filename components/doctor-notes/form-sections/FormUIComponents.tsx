"use client";

import React from "react";
import { motion } from "framer-motion";

// Input Component
export interface InputProps {
  label: string;
  type?: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: InputProps) {
  const displayValue =
    type === "number"
      ? value === undefined || value === null
        ? ""
        : value
      : value || "";

  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 text-[#4A4842] text-sm sm:text-base">
        {label}
      </label>
      <motion.input
        type={type}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input w-full border-2 border-[#D4C4B0] bg-[#FAF6F0] p-3 sm:p-3.5 rounded-lg text-[#2D2A24] text-base focus:border-[#6B9B6A] focus:bg-[#F7F3ED] focus:ring-2 focus:ring-[#6B9B6A]/50 transition-all duration-300 touch-manipulation"
        whileFocus={{ scale: 1.01, borderColor: "#6B9B6A" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </div>
  );
}

// DateInput Component
export interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function DateInput({ label, value, onChange }: DateInputProps) {
  return <Input label={label} type="date" value={value} onChange={onChange} />;
}

// TextArea Component
export interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  small?: boolean;
  placeholder?: string;
  isTime?: boolean;
}

export function TextArea({
  label,
  value,
  onChange,
  small = false,
  placeholder,
  isTime = false,
}: TextAreaProps) {
  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
        {label}
      </label>
      <motion.textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`form-input w-full border-2 border-slate-200 bg-white/90 p-3 sm:p-3.5 rounded-lg text-slate-900 text-base focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300 transition-all duration-300 resize-y touch-manipulation ${
          isTime
            ? "min-h-[40px] sm:min-h-[45px]"
            : small
            ? "min-h-[60px] sm:min-h-[70px]"
            : "min-h-[100px] sm:min-h-[120px]"
        }`}
        whileFocus={{ scale: 1.01, borderColor: "rgb(52, 211, 153)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </div>
  );
}

// Radio Component
export interface RadioProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function Radio({ label, options, value, onChange }: RadioProps) {
  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 sm:mb-3 text-slate-700 text-sm sm:text-base">
        {label}
      </label>
      <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 cursor-pointer group px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 touch-manipulation min-h-[44px] flex-1 sm:flex-initial"
          >
            <input
              type="radio"
              name={label.replace(/\s+/g, "-")}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="w-5 h-5 sm:w-5 sm:h-5 text-emerald-500 focus:ring-2 focus:ring-emerald-300 transition-all duration-200 touch-manipulation"
            />
            <span className="text-sm sm:text-base text-slate-700 group-hover:text-slate-900 font-medium transition-colors duration-200">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Select Component
export interface SelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function Select({ label, options, value, onChange }: SelectProps) {
  return (
    <div className="input-group">
      <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input w-full border-2 border-slate-200 bg-white/90 p-3 sm:p-3.5 rounded-lg text-slate-900 text-base focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300 transition-all duration-300 cursor-pointer touch-manipulation min-h-[44px]"
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// Checkbox Component
export interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({ label, checked = false, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group px-3 py-2.5 sm:py-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 touch-manipulation min-h-[44px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-5 h-5 sm:w-5 sm:h-5 text-emerald-500 focus:ring-2 focus:ring-emerald-300 transition-all duration-200 rounded touch-manipulation flex-shrink-0"
      />
      <span className="text-sm sm:text-base text-slate-700 group-hover:text-slate-900 font-medium transition-colors duration-200">
        {label}
      </span>
    </label>
  );
}

// CheckboxWithText Component
export interface CheckboxWithTextProps {
  label: string;
  subLabel: string;
  checked?: boolean;
  textValue?: string;
  onCheckedChange?: (checked: boolean) => void;
  onTextChange?: (text: string) => void;
}

export function CheckboxWithText({
  label,
  subLabel,
  checked = false,
  textValue = "",
  onCheckedChange,
  onTextChange,
}: CheckboxWithTextProps) {
  return (
    <div className="space-y-3">
      <Checkbox label={label} checked={checked} onChange={onCheckedChange} />
      {checked && (
        <TextArea
          label={subLabel}
          value={textValue}
          onChange={(val) => onTextChange?.(val)}
          small
        />
      )}
    </div>
  );
}

// FoodQty Component
export interface FoodQtyProps {
  label: string;
  checked?: boolean;
  quantity?: string;
  onCheckedChange?: (checked: boolean) => void;
  onQuantityChange?: (quantity: string) => void;
}

export function FoodQty({
  label,
  checked = false,
  quantity = "",
  onCheckedChange,
  onQuantityChange,
}: FoodQtyProps) {
  return (
    <div className="space-y-3">
      <Checkbox label={label} checked={checked} onChange={onCheckedChange} />
      {checked && (
        <TextArea
          label={`${label} Quantity`}
          value={quantity}
          onChange={(val) => onQuantityChange?.(val)}
          small
        />
      )}
    </div>
  );
}

// Qty5Select Component
export interface Qty5SelectProps {
  label: string;
  checkbox?: boolean;
  checked?: boolean;
  value?: string;
  onCheckedChange?: (checked: boolean) => void;
  onValueChange?: (value: string) => void;
}

export function Qty5Select({
  label,
  checkbox = false,
  checked = false,
  value = "",
  onCheckedChange,
  onValueChange,
}: Qty5SelectProps) {
  return (
    <div className="space-y-3">
      {checkbox && (
        <Checkbox label={label} checked={checked} onChange={onCheckedChange} />
      )}
      {(!checkbox || checked) && (
        <Select
          label={checkbox ? label : label}
          options={["1", "2", "3", "4", "5"]}
          value={value}
          onChange={(val) => onValueChange?.(val)}
        />
      )}
    </div>
  );
}

// SubSection Component
export interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SubSection({ title, children }: SubSectionProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 shadow-md hover:shadow-lg"
      whileHover={{ y: -1, scale: 1.005 }}
    >
      <h3 className="text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
        <motion.span
          className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex-shrink-0"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        ></motion.span>
        <span className="break-words">{title}</span>
      </h3>
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </motion.div>
  );
}
