"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import "./segmentedTrack.css";

/**
 * One moving surface, not animated labels: the white chip slides to whichever
 * child is selected. Selection itself stays the caller's - this only measures
 * `[aria-selected="true"]` or `[aria-current="page"]` and puts the chip there.
 *
 * The chip stays hidden until it has been measured, so a track that renders
 * before layout never paints a stray rectangle in its top-left corner.
 */
export function SegmentedTrack({
  as: Tag = "div",
  value,
  ariaLabel,
  role,
  className = "",
  children,
}: {
  as?: "div" | "nav";
  value: string;
  ariaLabel: string;
  role?: "tablist";
  className?: string;
  children: ReactNode;
}) {
  const track = useRef<HTMLDivElement & HTMLElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const previous = useRef<string | null>(null);
  const geometry = useRef("");

  useLayoutEffect(() => {
    const root = track.current;
    const chip = indicator.current;
    if (!root || !chip) return;

    const place = (animate: boolean) => {
      const selected = root.querySelector<HTMLElement>('[aria-selected="true"], [aria-current="page"]');
      if (!selected || !selected.offsetWidth) {
        delete root.dataset.measured;
        return;
      }
      const next = [selected.offsetLeft, selected.offsetTop, selected.offsetWidth, selected.offsetHeight].join(":");
      if (geometry.current === next && root.dataset.measured) return;
      geometry.current = next;
      chip.style.transition = animate ? "" : "none";
      chip.style.width = `${selected.offsetWidth}px`;
      chip.style.height = `${selected.offsetHeight}px`;
      chip.style.transform = `translate(${selected.offsetLeft}px, ${selected.offsetTop}px)`;
      root.dataset.measured = "true";
    };

    place(previous.current !== null && previous.current !== value);
    previous.current = value;
    // Resizing and wrapped rows are layout changes, not tab gestures.
    const observer = new ResizeObserver(() => place(false));
    observer.observe(root);
    for (const child of root.querySelectorAll<HTMLElement>('[role="tab"], a')) observer.observe(child);
    return () => observer.disconnect();
  }, [value, children]);

  return (
    <Tag ref={track} role={role} aria-label={ariaLabel} className={`${className} segmented-track`}>
      <span ref={indicator} aria-hidden="true" className="segmented-indicator rounded-chip bg-card shadow-sm" />
      {children}
    </Tag>
  );
}
