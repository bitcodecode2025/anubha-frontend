"use client";

import React from "react";
import { useInViewOnce } from "./hooks/useInViewOnce";

interface LazyMountProps {
  children: React.ReactNode;
  /**
   * Optional skeleton component to show before mounting children.
   * If not provided, a default lightweight skeleton is used.
   */
  skeleton?: React.ReactNode;
  /**
   * IntersectionObserver options for detecting when element enters viewport.
   */
  observerOptions?: IntersectionObserverInit;
}

/**
 * LazyMount component that only mounts children when they enter the viewport.
 * Shows a lightweight skeleton before mount.
 *
 * Usage:
 * ```tsx
 * <LazyMount>
 *   <ExpensiveComponent />
 * </LazyMount>
 * ```
 */
export default function LazyMount({
  children,
  skeleton,
  observerOptions,
}: LazyMountProps) {
  const [ref, isInView] = useInViewOnce(observerOptions);

  // Default lightweight skeleton
  const defaultSkeleton = (
    <div className="animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-4 bg-slate-200 rounded w-4/6" />
      </div>
    </div>
  );

  return (
    <div ref={ref}>
      {isInView ? children : skeleton ?? defaultSkeleton}
    </div>
  );
}
