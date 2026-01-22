"use client";

import React, { useEffect, useState } from "react";
import { useInViewOnce } from "./hooks/useInViewOnce";

interface ConditionalMountProps {
  children: React.ReactNode;
  /**
   * Whether the accordion/section is currently open.
   * If true, children will mount immediately.
   */
  isOpen: boolean;
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
 * ConditionalMount component that mounts children when:
 * 1. Accordion is open (isOpen === true), OR
 * 2. Element enters viewport (via IntersectionObserver)
 *
 * This ensures children are mounted only when needed, while keeping form state alive
 * in the context when unmounted (form state persists in DoctorNotesContext).
 *
 * Usage:
 * ```tsx
 * <ConditionalMount isOpen={openSections.has("section1")}>
 *   <ExpensiveSectionComponent />
 * </ConditionalMount>
 * ```
 */
export default function ConditionalMount({
  children,
  isOpen,
  skeleton,
  observerOptions,
}: ConditionalMountProps) {
  // Use IntersectionObserver to detect when element enters viewport
  const [ref, isInView] = useInViewOnce(observerOptions);

  // Mount children if accordion is open OR element is in viewport
  const shouldMount = isOpen || isInView;

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

  // If should mount, render children immediately
  if (shouldMount) {
    return <div ref={ref}>{children}</div>;
  }

  // Otherwise, show skeleton and observe for viewport entry
  return <div ref={ref}>{skeleton ?? defaultSkeleton}</div>;
}
