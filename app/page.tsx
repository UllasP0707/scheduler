"use client";

import { useMemo } from "react";
import { ScreenTop } from "@/components/ScreenTop";
import { ShiftTimesCard } from "@/components/scheduler/ShiftTimesCard";
import { TeamCard } from "@/components/scheduler/TeamCard";
import { WeekStepper } from "@/components/scheduler/WeekStepper";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSchedule, weeklyHours } from "@/lib/schedule";

/**
 * Build the week: the two shift windows, and the people working them.
 *
 * ASSIGNMENT IS NOT HERE. Who works which shift is decided on the printable
 * sheet, where the whole week is visible at once - deciding Thursday cover while
 * looking at Thursday alone is how a week ends up with nobody on the Wednesday.
 * This screen answers the two questions that come first: when are the shifts,
 * and who is available to work them.
 *
 * The week being edited is named ONCE, by the stepper in the header. There used
 * to be a toolbar under it as well - the same week again, with a date field and
 * the store hours - and it was a second bar saying what the header already said.
 */
export default function PlanPage() {
  const {
    weekStart,
    week,
    moveWeek,
    addPeople,
    removePerson,
    updateShiftTime,
    resetShiftTimesForDay,
  } = useSchedule();

  const hoursByPerson = useMemo(() => weeklyHours(week), [week]);

  return (
    <PageContainer>
      <ScreenTop activeHref="/" />

      <PageHeader
        title="Build the week"
        subtitle="Set the shift times, then add your team."
        action={<WeekStepper weekStart={weekStart} onMove={moveWeek} />}
      />

      {/* One page width across both screens (ui/PageContainer), so the two
          panels have to fill it rather than sit in a narrower column of their
          own. Shift times is a stack of short controls and keeps one column;
          the team is a list of names and hours, so it takes the rest. */}
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ShiftTimesCard week={week} onUpdate={updateShiftTime} onReset={resetShiftTimesForDay} />
        <TeamCard
          week={week}
          hoursByPerson={hoursByPerson}
          onAdd={addPeople}
          onRemove={removePerson}
          className="xl:col-span-2"
        />
      </div>
    </PageContainer>
  );
}
