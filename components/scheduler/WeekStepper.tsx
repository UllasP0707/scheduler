"use client";

import { formatWeekRange } from "@/app/week-label";
import { ChevronLeftIcon, ChevronRightIcon } from "../Icons";

/**
 * Which week is on screen, as one small control in the page header.
 *
 * A back arrow, the range, a forward arrow. That is the whole of it: there is no
 * date field and no calendar popover, because picking an arbitrary date was
 * never the job - every date lands on its Monday anyway, so the only real moves
 * are "the week before" and "the week after", and a stepper says both without
 * opening anything.
 */
export function WeekStepper({
  weekStart,
  onMove,
}: {
  weekStart: string;
  onMove: (weeks: number) => void;
}) {
  return (
    <div className="flex items-center rounded-control border border-border bg-card">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={!weekStart}
        aria-label="Previous week"
        className="tap tap-sq grid h-9 w-8 place-items-center rounded-l-control text-muted transition hover:bg-element hover:text-ink disabled:opacity-40"
      >
        <ChevronLeftIcon size={15} />
      </button>

      {/* A FIXED WIDTH, not a padded one. The label is what changes when you
          step a week, and its character count changes with it: "Sep 7 to Sep 13"
          is two characters shorter than "Sep 14 to Sep 20", and "May" is
          narrower than "Aug". Left to size itself, the control breathes in and
          out and both arrows move - under a pointer that is sitting on one of
          them, about to click again. tabular-nums holds the digits still; this
          holds the box still. Wide enough for the longest form the two
          formatters can produce. */}
      <span className="w-[8.5rem] shrink-0 text-center text-sm font-medium tabular-nums text-ink">
        {formatWeekRange(weekStart)}
      </span>

      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={!weekStart}
        aria-label="Next week"
        className="tap tap-sq grid h-9 w-8 place-items-center rounded-r-control text-muted transition hover:bg-element hover:text-ink disabled:opacity-40"
      >
        <ChevronRightIcon size={15} />
      </button>
    </div>
  );
}
