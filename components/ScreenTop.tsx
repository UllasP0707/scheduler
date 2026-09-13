"use client";

import { NAV_STEPS } from "@/lib/nav";
import { Logo } from "./Logo";
import { SegmentedNav } from "./ui/SegmentedNav";

/**
 * The first row of every screen: the mark on the left, the two-step control on
 * the right.
 *
 * This is NOT app chrome. There is no top bar in this app, no sidebar and no
 * footer - it is a page column and nothing else - so the brand and the way
 * across live inside the column, scroll with it, and take no fixed height off
 * the top of the window.
 *
 * The storage note sits here because it is the single most surprising fact about
 * this app: the schedule is in THIS browser and nowhere else. It belongs where
 * it is always visible rather than in a paragraph somebody reads once.
 */
export function ScreenTop({ activeHref }: { activeHref: string }) {
  return (
    <div data-print-hide className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Logo size={24} />
        <span className="hidden h-6 w-px shrink-0 bg-border sm:block" />
        <span className="hidden text-xs text-muted sm:block">Weekly staff planner</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-element px-2.5 py-1 text-xs font-medium text-muted lg:inline-flex">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-positive" />
          Saved on this device
        </span>
        <SegmentedNav items={NAV_STEPS} activeHref={activeHref} ariaLabel="Scheduler steps" />
      </div>
    </div>
  );
}
