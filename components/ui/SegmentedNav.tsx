"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SegmentedTrack } from "./SegmentedTrack";

export type SegmentedNavItem = { href: string; label: string; shortLabel?: string; icon?: ReactNode };

/**
 * The segmented control, backed by real links: a grey track holding a white chip
 * behind whichever route you are on.
 *
 * Selection is carried by the CHIP and not by colour alone, so it reads the same
 * in light and dark and does not need the accent. `aria-current="page"` is both
 * the accessible answer and the thing SegmentedTrack measures, which is why
 * there is no second "active" prop to get out of step with it.
 */
export function SegmentedNav({
  items,
  activeHref,
  ariaLabel,
  className = "",
}: {
  items: readonly SegmentedNavItem[];
  activeHref: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <SegmentedTrack
      as="nav"
      value={activeHref}
      ariaLabel={ariaLabel}
      className={`inline-flex rounded-control border border-border bg-element p-0.5 ${className}`}
    >
      {items.map((item) => {
        const on = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={`tap flex items-center justify-center gap-1.5 rounded-chip px-3 py-1.5 text-sm font-medium transition ${
              on ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {item.icon}
            {item.shortLabel ? (
              <>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </>
            ) : (
              <span>{item.label}</span>
            )}
          </Link>
        );
      })}
    </SegmentedTrack>
  );
}
