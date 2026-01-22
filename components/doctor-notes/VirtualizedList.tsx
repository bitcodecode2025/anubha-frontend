"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /**
   * Number of items to render initially.
   * Additional items will load as user scrolls.
   */
  initialItemCount?: number;
  /**
   * Number of items to load per batch when scrolling.
   */
  batchSize?: number;
  /**
   * Maximum height of the container before virtualization kicks in.
   * If undefined, virtualization is always active.
   */
  maxHeight?: string;
  /**
   * Grid or list layout
   */
  layout?: "grid" | "list";
  /**
   * Grid columns class (e.g., "grid-cols-1 md:grid-cols-2")
   */
  gridCols?: string;
  /**
   * Custom class names for the container
   */
  className?: string;
}

/**
 * Simple virtualization component for long lists.
 * Renders items in batches as user scrolls, reducing initial render time.
 *
 * This is a lightweight alternative to react-window/react-virtuoso that:
 * - Renders initial batch of items
 * - Loads more items as user scrolls near the bottom
 * - Uses IntersectionObserver for scroll detection
 *
 * Usage:
 * ```tsx
 * <VirtualizedList
 *   items={myItems}
 *   renderItem={(item, index) => <ItemComponent key={index} item={item} />}
 *   initialItemCount={20}
 *   batchSize={10}
 * />
 * ```
 */
export default function VirtualizedList<T>({
  items,
  renderItem,
  initialItemCount = 20,
  batchSize = 10,
  maxHeight,
  layout = "list",
  gridCols = "grid-cols-1 md:grid-cols-2",
  className = "",
}: VirtualizedListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(initialItemCount);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Total items count
  const totalItems = items.length;

  // Items to render (only visible items)
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  // Check if all items are visible
  const hasMore = visibleCount < totalItems;

  // Load more items when loadMoreRef enters viewport
  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => Math.min(prev + batchSize, totalItems));
          }
        });
      },
      {
        root: null,
        rootMargin: "200px", // Start loading 200px before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, batchSize, totalItems]);

  // Container class names
  const containerClass =
    layout === "grid"
      ? `grid ${gridCols} gap-3 ${className}`
      : `space-y-3 ${className}`;

  const containerStyle = maxHeight ? { maxHeight, overflow: "auto" } : undefined;

  return (
    <div className={containerClass} style={containerStyle}>
      {visibleItems.map((item, index) => renderItem(item, index))}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="col-span-full flex items-center justify-center py-4"
        >
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24" />
          </div>
        </div>
      )}
    </div>
  );
}
