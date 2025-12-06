"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

type Fruit = {
  src: string;
  size: string;
};

type Props = {
  fruits: Fruit[];
};

export default function HeroClient({ fruits }: Props) {
  useEffect(() => {
    const handleHashScroll = () => {
      if (!window.location.hash) return;
      const target = document.querySelector(window.location.hash);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  return (
    <div className="relative w-full flex justify-center mt-2 sm:mt-3 z-20 overflow-visible">
      <div className="flex justify-center items-start gap-3 sm:gap-6 md:gap-10">
        {fruits.map((fruit, index) => {
          const delay = index * 0.2 + Math.random() * 0.5;
          const duration = 3 + Math.random() * 1.5;
          const threadHeights = [
            "h-10",
            "h-12",
            "h-14",
            "h-16",
            "h-12",
            "h-10",
            "h-14",
          ];
          const threadClass = threadHeights[index % threadHeights.length];

          return (
            <motion.div
              key={`${fruit.src}-${index}`}
              className="relative flex flex-col items-center"
              initial={{ y: -80, opacity: 0, rotate: 0 }}
              animate={{
                y: [0, -10, 0, 10, 0, -5, 0],
                rotate: [0, 3, -3, 2, -2, 0],
                opacity: 1,
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 5 + Math.random() * 3,
                  ease: "easeInOut",
                },
                rotate: {
                  repeat: Infinity,
                  duration: 4 + Math.random() * 3,
                  ease: "easeInOut",
                },
                opacity: { delay, duration: 0.8, ease: "easeOut" },
              }}
            >
              <motion.svg
                width="2"
                height="100"
                viewBox="0 0 2 100"
                xmlns="http://www.w3.org/2000/svg"
                className={threadClass}
                animate={{ rotate: [0, 5, 0, -5, 0], x: [0, 1, -1, 0] }}
                transition={{
                  duration: duration + 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path
                  d="M1 0 C 1.5 30, 0.5 70, 1 100"
                  stroke="#a0a0a0"
                  strokeWidth="2"
                  fill="transparent"
                />
              </motion.svg>

              <motion.img
                src={fruit.src}
                alt="fruit"
                className={`${fruit.size} select-none pointer-events-none -mt-2 sm:-mt-3`}
                animate={{
                  y: [0, 8, -5, 4, -2, 0],
                  rotate: [0, 8, -6, 4, -2, 0],
                  scale: [1, 1.05, 1, 1.03, 1],
                }}
                transition={{
                  duration: 6 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
