"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const { user, logout, loggingOut } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "#about", label: "About", scroll: true },
    { href: "/services", label: "Services" },
    { href: "#faq", label: "FAQ", scroll: true },
  ];

  const handleScrollOrRedirect = (sectionId: string) => {
    if (window.location.pathname === "/") {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  // Dropdown animation
  const dropdownVariant = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className={`fixed top-0 left-0 w-full z-[500] transition-all duration-300 ${
          scrolled
            ? "bg-white/95 shadow-md backdrop-blur-md"
            : "bg-white/70 backdrop-blur-xl"
        } border-b border-[#dfe7dd]`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/eatrightlogo.jpg"
              alt="logo"
              className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-white"
            />
            <span className="font-semibold text-md md:text-lg text-emerald-800">
              Dt. Anubha's Nutrition
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.scroll ? (
                <button
                  key={link.label}
                  onClick={() =>
                    handleScrollOrRedirect(link.label.toLowerCase())
                  }
                  className="text-slate-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Dashboard Link (Admin Only) */}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-slate-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}

            {/* Hi Name */}
            {user && (
              <span className="text-emerald-700 font-semibold text-[15px]">
                Hi {user.name}
              </span>
            )}

            {/* USER ICON + DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`rounded-full bg-white/80 border border-[#dfe7dd] hover:bg-white transition overflow-hidden ${
                  user?.role === "ADMIN" ? "p-0" : "p-2"
                }`}
              >
                {user?.role === "ADMIN" ? (
                  <img
                    src="/images/anubha_profile_hd.jpg"
                    alt="Admin Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="text-emerald-700" size={24} />
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={dropdownVariant}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-[#367228] py-3 z-[460]"
                  >
                    {!user ? (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>

                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await logout();
                            window.location.href = "/";
                          }}
                          disabled={loggingOut}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loggingOut ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-4 h-4"
                              >
                                <LogOut className="w-4 h-4" />
                              </motion.div>
                              Logging out...
                            </>
                          ) : (
                            "Logout"
                          )}
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* MOBILE ICONS */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden rounded-md p-2 bg-white/80 border border-[#dfe7dd] hover:bg-white transition"
          >
            {menuOpen ? (
              <X size={20} className="text-emerald-700" />
            ) : (
              <Menu size={20} className="text-emerald-700" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[400]"
              onClick={() => setMenuOpen(false)}
            />

            {/* MENU PANEL */}
            <motion.div
              initial={{ y: -25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -25, opacity: 0 }}
              className="fixed top-[64px] left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-[#dfe7dd] rounded-b-2xl shadow-xl 
              flex flex-col items-center gap-5 py-6 z-[460]"
            >
              {/* Hi {name} */}
              {user && (
                <span className="text-emerald-700 font-semibold text-lg">
                  Hi {user.name}
                </span>
              )}

              {/* NAV LINKS */}
              {navLinks.map((link) =>
                link.scroll ? (
                  <button
                    key={link.label}
                    onClick={() => {
                      handleScrollOrRedirect(link.label.toLowerCase());
                      setMenuOpen(false);
                    }}
                    className="text-slate-700 hover:text-emerald-700 text-lg font-medium"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-slate-700 hover:text-emerald-700 text-lg font-medium"
                  >
                    {link.label}
                  </Link>
                )
              )}

              {/* Dashboard Link (Admin Only - Mobile) */}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="text-slate-700 hover:text-emerald-700 text-lg font-medium"
                >
                  Dashboard
                </Link>
              )}

              {/* AUTH OPTIONS */}
              {!user ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-lg text-slate-700 hover:text-emerald-700 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-lg text-slate-700 hover:text-emerald-700 font-medium"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="text-lg text-slate-700 hover:text-emerald-700 font-medium"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                      window.location.href = "/";
                    }}
                    disabled={loggingOut}
                    className="text-lg text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loggingOut ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4"
                        >
                          <LogOut className="w-4 h-4" />
                        </motion.div>
                        Logging out...
                      </>
                    ) : (
                      "Logout"
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
