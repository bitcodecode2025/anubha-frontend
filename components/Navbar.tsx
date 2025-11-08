"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#about", label: "About", scroll: true },
  { href: "/services", label: "Services" },
  { href: "#faq", label: "FAQ", scroll: true },
];

const navLinkVariant = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 300 },
  }),
  hover: {
    scale: 1.03,
    color: "#111827",
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-neutral-900/70"
    >
      <div className="flex items-center justify-between px-4 py-3 md:py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/anubha_logo.png"
            alt="logo"
            className="w-15 h-15 rounded-md bg-white shadow-sm"
            draggable={false}
          />
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">
            Dr. Anubha's Nutrition
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={navLinkVariant}
              whileHover="hover"
            >
              {link.label === "About" ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      typeof window !== "undefined" &&
                      window.location.pathname === "/"
                    ) {
                      document
                        .getElementById("about")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = "/#about";
                    }
                  }}
                  className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  href={link.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden rounded-md p-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
        >
          {menuOpen ? (
            <X size={24} className="text-gray-800 dark:text-gray-200" />
          ) : (
            <Menu size={24} className="text-gray-800 dark:text-gray-200" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobileMenu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden flex flex-col items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-neutral-900/95 backdrop-blur-md"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={navLinkVariant}
              >
                {link.label === "About" ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        typeof window !== "undefined" &&
                        window.location.pathname === "/"
                      ) {
                        document
                          .getElementById("about")
                          ?.scrollIntoView({ behavior: "smooth" });
                        setMenuOpen(false);
                      } else {
                        window.location.href = "/#about";
                      }
                    }}
                    className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-lg"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white text-lg"
                  >
                    {link.label}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
