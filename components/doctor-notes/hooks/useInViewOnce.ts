"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook that detects when an element enters the viewport using IntersectionObserver.
 * Once the element is in view, it stays "in view" (doesn't reset on scroll out).
 *
 * @param options - IntersectionObserver options
 * @returns A tuple of [ref, isInView]
 *   - ref: Ref to attach to the element you want to observe
 *   - isInView: Boolean indicating if the element has been in view at least once
 */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
): [React.RefObject<T>, boolean] {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || isInView) {
      // If already in view, no need to observe
      return;
    }

    // Default options: trigger when 10% of element is visible
    const observerOptions: IntersectionObserverInit = {
      root: null, // Use viewport as root
      rootMargin: "0px",
      threshold: 0.1, // Trigger when 10% visible
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Once in view, disconnect observer (one-time trigger)
          observer.disconnect();
        }
      });
    }, observerOptions);

    observer.observe(element);

    // Cleanup: disconnect observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [isInView, options]);

  return [ref, isInView];
}
