"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DisclaimerAgreementProps {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function DisclaimerAgreement({
  isChecked,
  onCheckedChange,
}: DisclaimerAgreementProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const disclaimerText = `Anubha's Nutrition Clinic Disclaimer

The services provided by Anubha's Nutrition Clinic are for nutrition informational purposes and are not a substitute for professional medical advice. Our nutrition plans and advice are tailored to individual needs, but clients should consult their healthcare professional before making any changes to their diet or lifestyle.

- We are not responsible for any adverse effects or consequences resulting from the use of our services.
- Clients are advised to inform us of any medical conditions or allergies before starting any diet or nutrition plan.
- We reserve the right to modify or discontinue services at any time.

By using our services, you acknowledge that you have read, understood, and agreed to the terms of this disclaimer.

Contact: 9713885582, Office no. 1, Upper ground floor, Kanaksai CHS ltd., S. No. 56, Jagdamba Bhavan Marg, Undri, Pune 411060`;

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      {/* Disclaimer Header - Always Visible */}
      <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            id="disclaimer-checkbox"
            checked={isChecked}
            onChange={(e) => {
              if (!isExpanded) {
                // Expand first if not expanded
                setIsExpanded(true);
              }
              onCheckedChange(e.target.checked);
            }}
            className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
          />
          <label
            htmlFor="disclaimer-checkbox"
            className={`text-sm font-medium text-slate-700 cursor-pointer select-none ${
              isChecked ? "text-emerald-700" : ""
            }`}
          >
            I agree to Anubha's Nutrition Clinic Disclaimer
          </label>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center p-1 hover:bg-slate-100 rounded transition-colors"
          aria-label={isExpanded ? "Collapse disclaimer" : "Expand disclaimer"}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>

      {/* Collapsible Disclaimer Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {disclaimerText}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
