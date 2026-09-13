"use client";

import { useState, type ReactElement } from "react";
import {
  DAYS,
  SHIFTS,
  SHIFT_LABEL,
  STORE_CLOSE,
  STORE_OPEN,
  formatHour,
  overlapLabel,
  overlapWindow,
  shiftWindowFor,
  type Day,
  type Shift,
  type WeekData,
} from "@/lib/schedule";
import { ArrowRightIcon, ClockIcon, InfoIcon, OverlapIcon, SunriseIcon, SunsetIcon } from "../Icons";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { Pill } from "../ui/Pill";
import { SelectMenu, selectTriggerClass } from "../ui/SelectMenu";

const DAY_OPTIONS = DAYS.map((day) => ({ value: day, label: day }));

const SHIFT_GLYPH: Record<Shift, (props: { size?: number }) => ReactElement> = {
  opening: SunriseIcon,
  closing: SunsetIcon,
};

/** Every hour a shift may start at, and every hour it may end at. */
const startOptions = () =>
  Array.from({ length: STORE_CLOSE - STORE_OPEN }, (_, index) => STORE_OPEN + index).map((hour) => ({
    value: String(hour),
    label: formatHour(hour),
  }));

const endOptions = (start: number) =>
  Array.from({ length: STORE_CLOSE - start }, (_, index) => start + index + 1).map((hour) => ({
    value: String(hour),
    label: formatHour(hour),
  }));

/**
 * The two windows one day runs, and the handover between them.
 *
 * ONE DAY AT A TIME, chosen from a select rather than seven panels stacked down
 * the page. The times are the same on most days and differ on two, so the shape
 * that fits is "pick the day you are changing" rather than a form seven times
 * long that a reader has to scroll past to reach the part they came for.
 */
export function ShiftTimesCard({
  week,
  onUpdate,
  onReset,
}: {
  week: WeekData;
  onUpdate: (day: Day, shift: Shift, field: "start" | "end", hour: number) => void;
  onReset: (day: Day) => void;
}) {
  const [settingsDay, setSettingsDay] = useState<Day>("Monday");
  const overlap = overlapWindow(week, settingsDay);

  return (
    <Card as="section">
      <CardHeader
        title="Shift times"
        subtitle="Set the two windows for one day."
        icon={<ClockIcon size={16} />}
      />

      <div className="flex flex-col gap-4 p-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Set times for
          <SelectMenu
            value={settingsDay}
            options={DAY_OPTIONS}
            onChange={(value) => setSettingsDay(value as Day)}
            ariaLabel="Day to set times for"
            buttonClass={`${selectTriggerClass} w-full`}
            panelClass="w-56"
          />
        </label>

        {SHIFTS.map((shift) => {
          const window = shiftWindowFor(week, settingsDay, shift);
          const Glyph = SHIFT_GLYPH[shift];
          return (
            <fieldset key={shift} className="rounded-control border border-border p-3">
              <legend className="flex items-center gap-1.5 px-1 text-xs font-semibold text-ink">
                <span className="text-muted">
                  <Glyph size={14} />
                </span>
                {SHIFT_LABEL[shift]}
                <Pill tone="accent" className="tnum">
                  {window.end - window.start} hrs
                </Pill>
              </legend>

              <div className="mt-1 flex items-end gap-2">
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-muted">
                  Starts
                  <SelectMenu
                    value={String(window.start)}
                    options={startOptions()}
                    onChange={(value) => onUpdate(settingsDay, shift, "start", Number(value))}
                    ariaLabel={`${SHIFT_LABEL[shift]} start time on ${settingsDay}`}
                    buttonClass={`${selectTriggerClass} w-full`}
                    panelClass="w-40"
                  />
                </label>
                <span aria-hidden="true" className="pb-2.5 text-muted">
                  <ArrowRightIcon size={14} />
                </span>
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-muted">
                  Ends
                  <SelectMenu
                    value={String(window.end)}
                    options={endOptions(window.start)}
                    onChange={(value) => onUpdate(settingsDay, shift, "end", Number(value))}
                    ariaLabel={`${SHIFT_LABEL[shift]} end time on ${settingsDay}`}
                    buttonClass={`${selectTriggerClass} w-full`}
                    panelClass="w-40"
                  />
                </label>
              </div>
            </fieldset>
          );
        })}

        {/* The handover, stated whether or not there is one: "No overlap" is a
            fact somebody planning cover needs as much as the hours are. */}
        <div
          className={`flex items-start gap-2.5 rounded-control px-3 py-2.5 ${
            overlap ? "bg-accent-soft text-accent-text" : "bg-element text-muted"
          }`}
        >
          <span aria-hidden="true" className="mt-0.5 shrink-0">
            <OverlapIcon size={15} />
          </span>
          <span className="min-w-0">
            <strong className="block text-xs font-semibold">{overlapLabel(week, settingsDay)}</strong>
            <span className="block text-xs opacity-80">
              {overlap ? "Both shifts work together" : "Shift handoff has no overlap"}
            </span>
          </span>
        </div>

        <Button variant="secondary" size="sm" onClick={() => onReset(settingsDay)}>
          Reset {settingsDay} to default
        </Button>

        <p className="flex items-start gap-2 text-xs text-muted">
          <span aria-hidden="true" className="mt-px shrink-0">
            <InfoIcon size={13} />
          </span>
          These times apply to everyone assigned to that shift. The latest end time is 11 PM.
        </p>
      </div>
    </Card>
  );
}
