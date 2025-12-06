"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type FAQItem = {
  question: string;
  answer: string;
};

type Props = {
  faqs: FAQItem[];
};

export default function FAQAccordionClient({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <motion.div
          key={faq.question}
          className="border border-[#dfe7dd] rounded-3xl overflow-hidden bg-white/90 shadow-(--shadow-soft)"
        >
          <button
            className="w-full flex justify-between items-center text-left px-6 py-4 font-medium text-slate-800"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span>{faq.question}</span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown className="w-5 h-5 text-[#7fb77e]" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-5 text-slate-600 text-sm leading-relaxed"
              >
                {faq.answer}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
