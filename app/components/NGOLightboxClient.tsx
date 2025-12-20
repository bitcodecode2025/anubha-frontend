"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
} from "lucide-react";

interface NGOLightboxClientProps {
  images: string[];
}

export default function NGOLightboxClient({ images }: NGOLightboxClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fitMode, setFitMode] = useState<"contain" | "full">("contain");
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Auto-play interval (4 seconds)
  const AUTOPLAY_INTERVAL = 4000;

  // Preload the first 3 images
  useEffect(() => {
    images.slice(0, 3).forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.onload = () => {
        setImageLoaded((prev) => ({ ...prev, [index]: true }));
      };
    });
  }, [images]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToIndex = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isHovered || isOpen) return;

    const interval = setInterval(() => {
      goToNext();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, isOpen, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToPrevious, goToNext]);

  const openLightbox = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  // Swipe detection
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    setIsDragging(false);
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      goToNext();
    } else if (swipe > swipeConfidenceThreshold) {
      goToPrevious();
    }
  };

  // Slide variants for smooth animation
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="w-full">
      {/* Main Carousel Container */}
      <div
        className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-2xl overflow-hidden shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Carousel */}
        <div className="relative w-full h-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              {/* Image with aspect ratio preservation */}
              <div className="relative w-full h-full p-4 md:p-8">
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                  {/* Loading skeleton */}
                  {!imageLoaded[currentIndex] && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse" />
                  )}

                  <Image
                    src={images[currentIndex]}
                    alt={`NGO community work image ${
                      currentIndex + 1
                    } by Dt. Anubha`}
                    fill
                    className="object-contain"
                    priority={currentIndex < 3}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    onLoad={() =>
                      setImageLoaded((prev) => ({
                        ...prev,
                        [currentIndex]: true,
                      }))
                    }
                  />

                  {/* Click to open lightbox overlay */}
                  <div
                    className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center cursor-pointer group"
                    onClick={openLightbox}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                      <Maximize2 className="w-8 h-8 text-slate-700" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons - Desktop */}
        <div className="hidden md:block">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : -20,
            }}
            transition={{ duration: 0.2 }}
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-slate-700 hover:text-emerald-600"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : 20,
            }}
            transition={{ duration: 0.2 }}
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 text-slate-700 hover:text-emerald-600"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Navigation Buttons - Mobile (Always Visible) */}
        <div className="block md:hidden">
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg active:scale-95 transition-transform text-slate-700"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg active:scale-95 transition-transform text-slate-700"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Control Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isHovered || isDragging ? 1 : 0.9,
            y: 0,
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-white/95 backdrop-blur-md rounded-full px-6 py-3 shadow-xl"
        >
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 hover:bg-emerald-50 rounded-full transition-colors text-slate-700 hover:text-emerald-600"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <div className="w-px h-6 bg-slate-300" />

          {/* Counter */}
          <div className="text-sm font-semibold text-slate-700 min-w-[70px] text-center">
            {currentIndex + 1} / {images.length}
          </div>
        </motion.div>

        {/* Dot Indicators */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className="group p-1"
              aria-label={`Go to image ${index + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-emerald-600"
                    : "w-2 bg-white/60 group-hover:bg-white group-hover:w-4"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Image Label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: 0 }}
          className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg"
        >
          <p className="text-sm font-semibold text-slate-700">
            Community Work #{currentIndex + 1}
          </p>
          <p className="text-xs text-slate-500">
            Click image to view full size
          </p>
        </motion.div>

        {/* Auto-play indicator */}
        {isPlaying && !isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-emerald-600 text-white rounded-full px-3 py-1.5 text-xs font-medium shadow-lg"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Auto-play
          </motion.div>
        )}
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
              className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9998]"
            />

            {/* Lightbox Container */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
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
                  onClick={() =>
                    setFitMode((prev) =>
                      prev === "contain" ? "full" : "contain"
                    )
                  }
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
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Next Button */}
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Image Container with Animation */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
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
                        fitMode === "contain"
                          ? "object-contain"
                          : "object-cover"
                      } rounded-lg`}
                      priority
                      sizes="100vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </div>

                {/* Dot Indicators in Lightbox */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToIndex(index)}
                      className="group"
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? "w-8 bg-white"
                            : "w-2 bg-white/40 group-hover:bg-white/70 group-hover:w-4"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
