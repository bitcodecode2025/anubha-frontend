"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface NGOLightboxClientProps {
  images: string[];
}

export default function NGOLightboxClient({ images }: NGOLightboxClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fitMode, setFitMode] = useState<"contain" | "full">("contain");
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

  // Auto-scroll speed (pixels per frame) - optimized for smooth visible flow
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
      // Jump to end of first set (seamless loop)
      scrollToIndex(images.length - 1, true);
    } else {
      scrollToIndex(newIdx, true);
    }

    // Enter manual mode
    enterManualMode();
  }, [images.length, scrollToIndex]);

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

    if (newIdx >= images.length) {
      // Jump to start of first set (seamless loop)
      scrollToIndex(0, true);
    } else {
      scrollToIndex(newIdx, true);
    }

    // Enter manual mode
    enterManualMode();
  }, [images.length, scrollToIndex]);

  // =========================
  // MODE MANAGEMENT
  // =========================

  const enterManualMode = useCallback(() => {
    console.log("👆 Manual interaction detected");
    setIsManualMode(true);

    // Clear any existing timeouts
    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    // Return to auto mode after duration (if not hovering)
    manualTimeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        console.log("⏰ Manual mode timeout - Resuming auto-scroll");
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
        // Retry if DOM not ready
        setTimeout(initialize, 100);
        return;
      }

      // Set initial scroll position to start of first set
      const spacerWidth = firstItem.offsetLeft;
      container.scrollLeft = spacerWidth;
      isInitializedRef.current = true;

      console.log("✅ NGO Carousel initialized - Auto-scroll will start");
    };

    // Initialize with a small delay to ensure DOM is ready
    const initTimeout = setTimeout(initialize, 100);
    return () => clearTimeout(initTimeout);
  }, [images.length]);

  // =========================
  // AUTO MODE: Continuous Scrolling
  // =========================

  useEffect(() => {
    // Don't auto-scroll if hovered, in manual mode, or lightbox is open
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
        // Retry after a short delay
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
      const firstSetEnd = spacerWidth + images.length * itemWidth;

      // Seamless infinite loop reset
      if (currentScroll >= firstSetEnd - 10) {
        container.scrollLeft = spacerWidth;
      } else {
        // Smooth continuous scrolling
        container.scrollLeft += AUTO_SCROLL_SPEED;
      }

      // Update current index for display
      const relativeScroll = container.scrollLeft - spacerWidth;
      const newIndex = Math.floor(relativeScroll / itemWidth) % images.length;
      if (
        newIndex >= 0 &&
        newIndex < images.length &&
        newIndex !== currentIndex
      ) {
        setCurrentIndex(newIndex);
      }

      autoScrollRef.current = requestAnimationFrame(autoScroll);
    };

    // Start auto-scroll with a delay to ensure DOM is ready
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
  }, [isHovered, isManualMode, isOpen, images.length, currentIndex]);

  // =========================
  // MANUAL MODE: Scroll Detection
  // =========================

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isHovered || isManualMode || isOpen) {
        // Manual scroll detected - update current index
        const firstItem = container.querySelector(
          ".carousel-item"
        ) as HTMLElement;
        if (!firstItem) return;

        const itemWidth = firstItem.offsetWidth;
        const spacerWidth = firstItem.offsetLeft;
        const currentScroll = container.scrollLeft;
        const firstSetEnd = spacerWidth + images.length * itemWidth;

        // Handle infinite loop reset for manual scrolls
        if (currentScroll >= firstSetEnd - 10) {
          const relativeOverflow = currentScroll - firstSetEnd;
          container.scrollLeft = spacerWidth + relativeOverflow;
        } else if (currentScroll < spacerWidth - 10) {
          const relativeUnderflow = spacerWidth - currentScroll;
          container.scrollLeft = firstSetEnd - relativeUnderflow;
        }

        const relativeScroll = container.scrollLeft - spacerWidth;
        const newIndex = Math.round(relativeScroll / itemWidth) % images.length;
        if (newIndex >= 0 && newIndex < images.length) {
          setCurrentIndex(newIndex);
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [images.length, isHovered, isManualMode, isOpen]);

  // =========================
  // EVENT HANDLERS
  // =========================

  const handleMouseEnter = () => {
    console.log("🖱️ Mouse entered - Pausing auto-scroll");
    setIsHovered(true);
    setIsManualMode(true);

    // Clear any pending resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    console.log("🖱️ Mouse left - Will resume auto-scroll after delay");
    setIsHovered(false);

    // Clear any existing timeouts
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    // Resume auto-scroll after a 1-second delay
    resumeTimeoutRef.current = setTimeout(() => {
      console.log("▶️ Resuming auto-scroll");
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
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // =========================
  // KEYBOARD NAVIGATION
  // =========================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        // Lightbox keyboard navigation
        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowLeft") {
          goToPrevious();
        } else if (e.key === "ArrowRight") {
          goToNext();
        }
      } else {
        // Carousel keyboard navigation
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
            // Remove conflicting scrollBehavior - handled by navigation functions
          }}
          onWheel={handleInteraction}
          onMouseDown={handleInteraction}
        >
          {/* Centering spacer - first item */}
          <div
            className="shrink-0"
            style={{
              width: "max(5vw, calc((100% - min(90vw, 600px)) / 2))",
              minWidth: "max(5vw, calc((100% - min(90vw, 600px)) / 2))",
            }}
          />

          {/* Duplicate images twice for seamless infinite loop */}
          {[...images, ...images].map((src, index) => {
            const actualIndex = index % images.length;
            return (
              <div
                key={`${src}-${index}`}
                className={`carousel-item shrink-0 px-2 md:px-4 ${
                  isManualMode || isHovered ? "snap-center" : ""
                }`}
                style={{
                  width: "min(90vw, 600px)",
                }}
                onClick={() => openLightbox(actualIndex)}
              >
                <div className="group cursor-pointer relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="relative aspect-4/3 w-full">
                    <Image
                      src={src}
                      alt={`NGO work image #${actualIndex + 1} by Dt. Anubha`}
                      fill
                      className="object-cover rounded-xl"
                      loading={index < images.length ? "eager" : "lazy"}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      sizes="(max-width: 768px) 90vw, 600px"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg
                          className="w-12 h-12 text-white drop-shadow-lg"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Image label badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-semibold text-slate-700">
                        Image #{actualIndex + 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Centering spacer - last item */}
          <div
            className="shrink-0"
            style={{
              width: "max(5vw, calc((100% - min(90vw, 600px)) / 2))",
              minWidth: "max(5vw, calc((100% - min(90vw, 600px)) / 2))",
            }}
          />
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={goToPreviousCarousel}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-emerald-800 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Previous image"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={goToNextCarousel}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-emerald-800 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Next image"
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
                className="relative w-full h-full flex items-center justify-center"
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

                {/* Fit Mode Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFitMode((prev) =>
                      prev === "contain" ? "full" : "contain"
                    );
                  }}
                  className="absolute top-4 left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Toggle fit mode"
                >
                  {fitMode === "contain" ? (
                    <Maximize2 className="w-5 h-5" />
                  ) : (
                    <Minimize2 className="w-5 h-5" />
                  )}
                </button>

                {/* Previous Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Previous image"
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
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Image Container */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className={`relative ${
                    fitMode === "contain"
                      ? "w-full h-full max-w-7xl max-h-[90vh]"
                      : "w-full h-full"
                  }`}
                >
                  <Image
                    src={images[currentIndex]}
                    alt={`NGO work image #${currentIndex + 1} by Dt. Anubha`}
                    fill
                    className={`${
                      fitMode === "contain" ? "object-contain" : "object-cover"
                    } rounded-lg`}
                    priority
                    sizes="100vw"
                  />
                </motion.div>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
