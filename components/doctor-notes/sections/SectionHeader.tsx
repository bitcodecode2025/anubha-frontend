"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  sectionId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const SectionHeader = ({
  title,
  sectionId,
  isOpen,
  onToggle,
}: SectionHeaderProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border-2 border-emerald-200 mb-4"
      aria-expanded={isOpen}
      aria-controls={`section-content-${sectionId}`}
    >
      <h4 className="text-lg font-semibold text-emerald-700">{title}</h4>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-emerald-600" />
      ) : (
        <ChevronDown className="w-5 h-5 text-emerald-600" />
      )}
    </button>
  );
};
