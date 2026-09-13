"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Lightweight headless dropdown: a trigger button plus a floating panel that
 * closes on outside-click, Escape, or any click inside it.
 *
 * The panel is rendered into <body> with fixed positioning, anchored to the
 * trigger's box, so no ancestor `overflow-hidden` (a table wrapper, a card) can
 * clip it and no stacking context can bury it. It flips above the trigger when
 * it would overflow the bottom of the viewport. Panels carry a soft shadow -
 * legitimate elevation for a popover, and the one place this design allows it.
 */
export function Menu({
  button,
  children,
  align = "start",
  buttonClass = "",
  panelClass = "",
  ariaLabel,
  closeOnItemClick = true,
  disabled = false,
}: {
  button: ReactNode;
  /** Static content, or a render prop receiving close() for panels with controls. */
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "start" | "end";
  buttonClass?: string;
  panelClass?: string;
  ariaLabel?: string;
  /** Set false for panels with inputs where a click should not dismiss. */
  closeOnItemClick?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<"below" | "above" | null>(null);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const box = trigger.getBoundingClientRect();
    const gap = 8;
    const pad = 8;
    const panelWidth = panelRef.current?.offsetWidth ?? 220;
    const panelHeight = panelRef.current?.offsetHeight ?? 0;

    let left = align === "end" ? box.right - panelWidth : box.left;
    left = Math.max(pad, Math.min(left, window.innerWidth - panelWidth - pad));

    const below = box.bottom + gap;
    const above = box.top - gap - panelHeight;
    const fitsBelow = below + panelHeight <= window.innerHeight - pad;
    const fitsAbove = above >= pad;
    // Filtering a list must not move an upward-opening panel below its button
    // just because fewer results now fit there. Flip only when the chosen side
    // no longer fits and the other one does.
    let side = sideRef.current ?? (fitsBelow || !fitsAbove ? "below" : "above");
    if (side === "below" && !fitsBelow && fitsAbove) side = "above";
    else if (side === "above" && !fitsAbove && fitsBelow) side = "below";
    sideRef.current = side;

    const top = Math.max(pad, Math.min(side === "below" ? below : above, window.innerHeight - panelHeight - pad));
    setCoords({ top, left });
  }, [align]);

  // Position before the browser paints, so the panel never flashes at (0,0).
  useLayoutEffect(() => {
    if (open) place();
    else sideRef.current = null;
  }, [open, place]);

  // A filtered list changes height while open. Re-anchor to its actual size.
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const observer = new ResizeObserver(place);
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const reflow = (event: Event) => {
      // Scrolling the results does not move the anchor. Only page or viewport
      // changes need another placement pass.
      if (event.type === "scroll" && event.target instanceof Node && panelRef.current?.contains(event.target)) return;
      place();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", reflow);
    window.addEventListener("scroll", reflow, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", reflow);
      window.removeEventListener("scroll", reflow, true);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        // The shared button classes include a pressed scale. Measuring during
        // its release transition leaves the panel offset until the next scroll.
        style={{ scale: "none" }}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className={`${buttonClass} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        {button}
      </button>
      {/* No "mounted" flag guarding this: the panel only exists once `open` is
          true, and `open` can only be set by a click, which is long after the
          server has finished with this markup. */}
      {open &&
        !disabled &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            onClick={closeOnItemClick ? () => setOpen(false) : undefined}
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              visibility: coords ? "visible" : "hidden",
            }}
            // The width default applies only when the caller does not size the
            // panel itself: same-element Tailwind conflicts resolve by
            // stylesheet order, not class order, so a caller's w- must be the
            // ONLY one present.
            className={`pop-in fixed z-[80] rounded-xl border border-border bg-card shadow-xl ${
              /(^|\s)(w-|min-w-|max-w-)/.test(panelClass) ? "" : "min-w-[13.75rem]"
            } ${panelClass}`}
          >
            {typeof children === "function" ? children(() => setOpen(false)) : children}
          </div>,
          document.body,
        )}
    </>
  );
}

/** One row in a menu panel. */
export function MenuItem({
  children,
  onClick,
  selected = false,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  selected?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={`tap flex w-full items-center justify-between gap-2 rounded-chip px-2.5 py-1.5 text-left text-sm transition hover:bg-element ${
        selected ? "font-medium text-ink" : "text-ink"
      } ${className}`}
    >
      {children}
    </button>
  );
}
