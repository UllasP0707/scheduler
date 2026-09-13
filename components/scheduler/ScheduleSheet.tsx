"use client";

import type { ReactElement } from "react";
import { formatWeekLabel } from "@/app/week-label";
import {
  DAYS,
  SHIFTS,
  SHIFT_LABEL,
  dayNumber,
  hasOverlap,
  overlapLabel,
  shiftDetails,
  weeklyHours,
  type Day,
  type Shift,
  type WeekData,
} from "@/lib/schedule";
import { SunriseIcon, SunsetIcon } from "../Icons";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Pill";
import { Table, Td, Th, THead, Tr } from "../ui/Table";
import { PeoplePicker } from "./PeoplePicker";

const SHIFT_GLYPH: Record<Shift, (props: { size?: number }) => ReactElement> = {
  opening: SunriseIcon,
  closing: SunsetIcon,
};

/**
 * The week as one grid, and the place the week is actually decided.
 *
 * SHIFTS DOWN THE SIDE, DAYS ACROSS THE TOP. The question this
 * grid answers is "who is on the Friday close", so the cell where Friday meets
 * the second shift is where that is chosen - not on another screen with the week
 * out of sight. Every cell states its own window, because the hours differ by
 * day, and the column header says so again when the two shifts overlap.
 *
 * IT IS RULED IN BOTH DIRECTIONS, unlike the lists elsewhere in this app. A
 * seven-column grid read across a row needs the vertical rules or the eye loses
 * which day it is on halfway along; a list of five things does not.
 *
 * THIS IS ALSO THE THING THAT GETS PRINTED, which is why it is a card that knows
 * it (`printSheet`): on paper it drops its border and its rounded corners and
 * becomes the page, the add controls disappear and the names stay. Nothing here
 * means anything by its colour alone, so a black-and-white printer loses
 * nothing.
 */
export function ScheduleSheet({
  week,
  weekStart,
  onToggle,
  onClear,
}: {
  week: WeekData;
  weekStart: string;
  onToggle: (day: Day, shift: Shift, personId: string) => void;
  /** Empty every cell in the grid above, keeping the people and the windows. */
  onClear: () => void;
}) {
  const hoursByPerson = weeklyHours(week);
  const totalHours = Object.values(hoursByPerson).reduce((total, hours) => total + hours, 0);

  return (
    <Card as="article" printSheet className="overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Weekly team schedule</h2>
          <p className="mt-0.5 text-sm text-muted">{formatWeekLabel(weekStart)}</p>
        </div>
        {/* The two figures worth carrying onto paper. The store hours used to sit
            here and they are gone: they are the same on every day of every week,
            so printing them is a line nobody reads twice. */}
        <div className="shrink-0 text-right">
          <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">This week</span>
          <strong className="block text-sm font-semibold tabular-nums text-ink">
            {week.people.length} {week.people.length === 1 ? "person" : "people"} · {totalHours} hrs
          </strong>
        </div>
      </header>

      <Table bare fixed caption="Weekly team schedule, shifts down the side and days across the top">
        <THead>
          <tr className="border-b border-border">
            <Th className="w-[9.5rem]">Shift</Th>
            {DAYS.map((day, index) => (
              <Th key={day} align="center" className="border-l border-border">
                {day.slice(0, 3)}
                <span className="mt-0.5 block text-sm font-semibold normal-case tabular-nums tracking-normal text-ink">
                  {dayNumber(weekStart, index)}
                </span>
                {hasOverlap(week, day) && (
                  <span className="mt-0.5 block text-[0.625rem] font-normal normal-case tracking-normal text-accent-text">
                    {overlapLabel(week, day)}
                  </span>
                )}
              </Th>
            ))}
          </tr>
        </THead>

        <tbody>
          {SHIFTS.map((shift) => {
            const Glyph = SHIFT_GLYPH[shift];
            return (
              <Tr key={shift}>
                <Td as="th" className="align-top">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="shrink-0 text-muted">
                      <Glyph size={15} />
                    </span>
                    <strong className="text-sm font-semibold text-ink">{SHIFT_LABEL[shift]}</strong>
                  </span>
                </Td>

                {DAYS.map((day) => {
                  const details = shiftDetails(week, day, shift);
                  return (
                    <Td key={day} className="border-l border-border align-top">
                      <span className="mb-1.5 block text-center text-[0.625rem] font-semibold uppercase tracking-wide tabular-nums text-muted">
                        {details.time}
                      </span>
                      <PeoplePicker
                        people={week.people}
                        assigned={week.schedule[day][shift]}
                        label={`${details.label} on ${day}`}
                        context={`${details.label} · ${details.time}`}
                        hoursByPerson={hoursByPerson}
                        onToggle={(personId) => onToggle(day, shift, personId)}
                      />
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </tbody>
      </Table>

      {/* Hours per person, on the sheet rather than on the other screen: this is
          the half of a rota that goes to payroll, and it has to survive being
          printed and handed over. */}
      <div className="border-t border-border px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">Weekly hours</h3>
          {/* The one destructive control on the screen, and it belongs to the
              grid it empties rather than to the page header three rows up. It
              only exists while there is something to clear, and it never
              reaches paper. */}
          {totalHours > 0 && (
            <span data-print-hide>
              <Button variant="ghost-danger" size="sm" onClick={onClear}>
                Clear shifts
              </Button>
            </span>
          )}
        </div>
        {week.people.length ? (
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {week.people.map((person) => (
              <li key={person.id} className="flex items-center gap-1.5 text-sm">
                <Avatar name={person.name} />
                <span className="text-ink">{person.name}</span>
                <span className="font-semibold tabular-nums text-accent-text">{hoursByPerson[person.id]}h</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">
            Add your team on Build the week, then choose who works each shift above.
          </p>
        )}
      </div>

    </Card>
  );
}
