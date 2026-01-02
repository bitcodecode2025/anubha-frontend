"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Star, CheckCircle2 } from "lucide-react";
import { Testimonial } from "./TestimonialsClient";

interface TestimonialsLightboxClientProps {
  testimonials: Testimonial[];
}

export default function TestimonialsLightboxClient({
  testimonials,
}: TestimonialsLightboxClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Auto-scroll speed (pixels per frame)
  const AUTO_SCROLL_SPEED = 2;

  // Duration to stay in manual mode after user interaction (ms)
  const MANUAL_MODE_DURATION = 3000;

  // Delay before resuming auto-scroll after hover ends (ms)
  const RESUME_DELAY = 1000;

  // =========================
  // MANUAL MODE: Navigation Functions
  // =========================

  const scrollToIndex = useCallback((index: number, smooth: boolean = true) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const firstItem = container.querySelector(".carousel-item") as HTMLElement;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth;
    const spacerWidth = firstItem.offsetLeft;
    const scrollPosition = spacerWidth + index * itemWidth;

    container.scrollTo({
      left: scrollPosition,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const goToPreviousCarousel = useCallback(() => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const firstItem = container.querySelector(".carousel-item") as HTMLElement;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth;
    const spacerWidth = firstItem.offsetLeft;
    const currentScroll = container.scrollLeft;
    const relativeScroll = currentScroll - spacerWidth;
    const currentIdx = Math.round(relativeScroll / itemWidth);
    const newIdx = currentIdx - 1;

    if (newIdx < 0) {
      scrollToIndex(testimonials.length - 1, true);
    } else {
      scrollToIndex(newIdx, true);
    }

    enterManualMode();
  }, [testimonials.length, scrollToIndex]);

  const goToNextCarousel = useCallback(() => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const firstItem = container.querySelector(".carousel-item") as HTMLElement;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth;
    const spacerWidth = firstItem.offsetLeft;
    const currentScroll = container.scrollLeft;
    const relativeScroll = currentScroll - spacerWidth;
    const currentIdx = Math.round(relativeScroll / itemWidth);
    const newIdx = currentIdx + 1;

    if (newIdx >= testimonials.length) {
      scrollToIndex(0, true);
    } else {
      scrollToIndex(newIdx, true);
    }

    enterManualMode();
  }, [testimonials.length, scrollToIndex]);

  // =========================
  // MODE MANAGEMENT
  // =========================

  const enterManualMode = useCallback(() => {
    setIsManualMode(true);

    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    manualTimeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsManualMode(false);
      }
    }, MANUAL_MODE_DURATION);
  }, [isHovered]);

  // =========================
  // INITIALIZATION
  // =========================

  useEffect(() => {
    if (!carouselRef.current) return;

    const initialize = () => {
      const container = carouselRef.current;
      if (!container) return;

      const firstItem = container.querySelector(
        ".carousel-item"
      ) as HTMLElement;
      if (!firstItem) {
        setTimeout(initialize, 100);
        return;
      }

      const spacerWidth = firstItem.offsetLeft;
      container.scrollLeft = spacerWidth;
      isInitializedRef.current = true;
    };

    const initTimeout = setTimeout(initialize, 100);
    return () => clearTimeout(initTimeout);
  }, [testimonials.length]);

  // =========================
  // AUTO MODE: Continuous Scrolling
  // =========================

  useEffect(() => {
    if (isHovered || isManualMode || isOpen) {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      return;
    }

    const autoScroll = () => {
      const container = carouselRef.current;
      if (!container || isHovered || isManualMode || isOpen) {
        autoScrollRef.current = null;
        return;
      }

      const firstItem = container.querySelector(
        ".carousel-item"
      ) as HTMLElement;
      if (!firstItem) {
        setTimeout(() => {
          if (!isHovered && !isManualMode && !isOpen) {
            autoScrollRef.current = requestAnimationFrame(autoScroll);
          }
        }, 100);
        return;
      }

      const itemWidth = firstItem.offsetWidth;
      const spacerWidth = firstItem.offsetLeft;
      const currentScroll = container.scrollLeft;
      const firstSetEnd = spacerWidth + testimonials.length * itemWidth;

      if (currentScroll >= firstSetEnd - 10) {
        container.scrollLeft = spacerWidth;
      } else {
        container.scrollLeft += AUTO_SCROLL_SPEED;
      }

      const relativeScroll = container.scrollLeft - spacerWidth;
      const newIndex =
        Math.floor(relativeScroll / itemWidth) % testimonials.length;
      if (
        newIndex >= 0 &&
        newIndex < testimonials.length &&
        newIndex !== currentIndex
      ) {
        setCurrentIndex(newIndex);
      }

      autoScrollRef.current = requestAnimationFrame(autoScroll);
    };

    const startTimeout = setTimeout(() => {
      if (!isHovered && !isManualMode && !isOpen) {
        autoScrollRef.current = requestAnimationFrame(autoScroll);
      }
    }, 200);

    return () => {
      clearTimeout(startTimeout);
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };
  }, [isHovered, isManualMode, isOpen, testimonials.length, currentIndex]);

  // =========================
  // MANUAL MODE: Scroll Detection
  // =========================

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isHovered || isManualMode || isOpen) {
        const firstItem = container.querySelector(
          ".carousel-item"
        ) as HTMLElement;
        if (!firstItem) return;

        const itemWidth = firstItem.offsetWidth;
        const spacerWidth = firstItem.offsetLeft;
        const currentScroll = container.scrollLeft;
        const firstSetEnd = spacerWidth + testimonials.length * itemWidth;

        if (currentScroll >= firstSetEnd - 10) {
          const relativeOverflow = currentScroll - firstSetEnd;
          container.scrollLeft = spacerWidth + relativeOverflow;
        } else if (currentScroll < spacerWidth - 10) {
          const relativeUnderflow = spacerWidth - currentScroll;
          container.scrollLeft = firstSetEnd - relativeUnderflow;
        }

        const relativeScroll = container.scrollLeft - spacerWidth;
        const newIndex =
          Math.round(relativeScroll / itemWidth) % testimonials.length;
        if (newIndex >= 0 && newIndex < testimonials.length) {
          setCurrentIndex(newIndex);
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [testimonials.length, isHovered, isManualMode, isOpen]);

  // =========================
  // EVENT HANDLERS
  // =========================

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsManualMode(true);

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    resumeTimeoutRef.current = setTimeout(() => {
      setIsManualMode(false);
    }, RESUME_DELAY);
  };

  const handleInteraction = () => {
    enterManualMode();
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  }, [testimonials.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  }, [testimonials.length]);

  // =========================
  // KEYBOARD NAVIGATION
  // =========================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowLeft") {
          goToPrevious();
        } else if (e.key === "ArrowRight") {
          goToNext();
        }
      } else {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goToPreviousCarousel();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goToNextCarousel();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    closeLightbox,
    goToPrevious,
    goToNext,
    goToPreviousCarousel,
    goToNextCarousel,
  ]);

  // =========================
  // TOUCH HANDLERS
  // =========================

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    enterManualMode();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="w-full">
      {/* Horizontal Carousel */}
      <div
        className="relative w-full py-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className={`flex overflow-x-auto scrollbar-hide ${
            isManualMode || isHovered ? "snap-x snap-mandatory" : ""
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          onWheel={handleInteraction}
          onMouseDown={handleInteraction}
        >
          {/* Centering spacer - first item */}
          <div
            className="shrink-0"
            style={{
              width: "max(5vw, calc((100% - min(90vw, 400px)) / 2))",
              minWidth: "max(5vw, calc((100% - min(90vw, 400px)) / 2))",
            }}
          />

          {/* Duplicate testimonials twice for seamless infinite loop */}
          {[...testimonials, ...testimonials].map((testimonial, index) => {
            const actualIndex = index % testimonials.length;
            return (
              <div
                key={`${testimonial.name}-${index}`}
                className={`carousel-item shrink-0 px-2 md:px-4 ${
                  isManualMode || isHovered ? "snap-center" : ""
                }`}
                style={{
                  width: "min(90vw, 400px)",
                }}
                onClick={() => openLightbox(actualIndex)}
              >
                <div className="group cursor-pointer relative h-full bg-white rounded-3xl p-4 border border-emerald-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1">
                  {/* Testimonial Image */}
                  <div className="relative mb-3 overflow-hidden rounded-2xl group-hover:rounded-3xl transition-all duration-500">
                    <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-emerald-100/50 group-hover:ring-2 group-hover:ring-emerald-200">
                      <Image
                        src={testimonial.img}
                        alt={testimonial.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        loading={index < testimonials.length ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 90vw, 400px"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-linear-to-t from-emerald-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="relative z-10 space-y-2">
                    {/* Testimonial text */}
                    <p className="text-slate-700 text-center leading-snug text-xs sm:text-sm font-normal italic line-clamp-3">
                      "{testimonial.text}"
                    </p>

                    {/* Divider */}
                    <div className="flex justify-center py-1">
                      <div className="w-10 h-0.5 bg-linear-to-r from-transparent via-emerald-300 to-transparent" />
                    </div>

                    {/* Name */}
                    <div className="text-center">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">
                        {testimonial.name}
                      </h3>

                      {/* Stars */}
                      <div className="flex justify-center gap-0.5 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>

                      {/* Verified badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200/50 mt-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="text-[10px] sm:text-xs font-semibold text-emerald-700">
                          Verified Client
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Centering spacer - last item */}
          <div
            className="shrink-0"
            style={{
              width: "max(5vw, calc((100% - min(90vw, 400px)) / 2))",
              minWidth: "max(5vw, calc((100% - min(90vw, 400px)) / 2))",
            }}
          />
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={goToPreviousCarousel}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-emerald-800 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Previous testimonial"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={goToNextCarousel}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-emerald-800 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Next testimonial"
          type="button"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Hide scrollbar */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              className="fixed inset-0 z-9998 bg-black/90 backdrop-blur-sm"
            />

            {/* Lightbox Container */}
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Close lightbox"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Previous Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Next Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Testimonial Content */}
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                  {/* Image Section */}
                  <motion.div
                    key={`img-${currentIndex}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-emerald-50 to-teal-50"
                  >
                    <Image
                      src={testimonials[currentIndex].img}
                      alt={testimonials[currentIndex].name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>

                  {/* Content Section */}
                  <motion.div
                    key={`content-${currentIndex}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center overflow-y-auto"
                  >
                    {/* Quote Icon */}
                    <div className="mb-6">
                      <svg
                        className="w-12 h-12 text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-lg md:text-xl text-slate-700 italic mb-8 leading-relaxed">
                      "{testimonials[currentIndex].text}"
                    </p>

                    {/* Divider */}
                    <div className="w-20 h-0.5 bg-linear-to-r from-transparent via-emerald-300 to-transparent mb-8" />

                    {/* Name */}
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                      {testimonials[currentIndex].name}
                    </h3>

                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-6 h-6 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    {/* Verified Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200/50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">
                        Verified Client
                      </span>
                    </div>

                    {/* Testimonial Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-700 text-sm font-medium">
                      {currentIndex + 1} / {testimonials.length}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
