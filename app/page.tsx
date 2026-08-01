"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatWeekLabel as weekLabel } from "./week-label";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Day = (typeof DAYS)[number];
type Shift = "opening" | "closing";
type Person = { id: string; name: string };
type DaySchedule = Record<Shift, string[]>;
type ShiftWindow = { start: number; end: number };
type WeekData = {
  people: Person[];
  schedule: Record<Day, DaySchedule>;
  shiftTimes?: Record<Day, Record<Shift, ShiftWindow>>;
};
type StoredSchedule = Record<string, WeekData>;

const STORAGE_KEY = "weekwise-scheduler-v1";

function emptySchedule(): Record<Day, DaySchedule> {
  return Object.fromEntries(
    DAYS.map((day) => [day, { opening: [], closing: [] }]),
  ) as Record<Day, DaySchedule>;
}

function defaultShiftWindow(day: Day, shift: Shift): ShiftWindow {
  if (shift === "closing") return { start: 16, end: 23 };
  return { start: 10, end: isExtendedDay(day) ? 20 : 16 };
}

function emptyShiftTimes(): Record<Day, Record<Shift, ShiftWindow>> {
  return Object.fromEntries(
    DAYS.map((day) => [
      day,
      {
        opening: defaultShiftWindow(day, "opening"),
        closing: defaultShiftWindow(day, "closing"),
      },
    ]),
  ) as Record<
    Day,
    Record<Shift, ShiftWindow>
  >;
}

function emptyWeek(): WeekData {
  return {
    people: [],
    schedule: emptySchedule(),
    shiftTimes: emptyShiftTimes(),
  };
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mondayOf(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  result.setHours(12, 0, 0, 0);
  return result;
}

function dateFromIso(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addDays(value: string, days: number) {
  const date = dateFromIso(value);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function dayDate(value: string, index: number) {
  if (!value) return "";
  return dateFromIso(addDays(value, index)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isExtendedDay(day: Day) {
  return day === "Thursday" || day === "Friday";
}

function formatHour(hour: number) {
  if (hour === 12) return "12 PM";
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
}

function shiftWindowFor(week: WeekData, day: Day, shift: Shift) {
  const fallback = defaultShiftWindow(day, shift);
  const saved = week.shiftTimes?.[day]?.[shift];
  if (
    !saved ||
    !Number.isInteger(saved.start) ||
    !Number.isInteger(saved.end) ||
    saved.start < 10 ||
    saved.start > 22 ||
    saved.end <= saved.start ||
    saved.end > 23
  ) {
    return fallback;
  }
  return saved;
}

function shiftDetails(week: WeekData, day: Day, shift: Shift) {
  const window = shiftWindowFor(week, day, shift);
  return {
    label: shift === "opening" ? "First shift" : "Second shift",
    time: `${formatHour(window.start)} – ${formatHour(window.end)}`,
    hours: window.end - window.start,
  };
}

export default function Home() {
  const [weekStart, setWeekStart] = useState("");
  const [weeks, setWeeks] = useState<StoredSchedule>({});
  const [nameInput, setNameInput] = useState("");
  const [settingsDay, setSettingsDay] = useState<Day>("Monday");
  const [view, setView] = useState<"build" | "preview">("build");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const thisMonday = toIsoDate(mondayOf(new Date()));
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          weekStart?: string;
          weeks?: StoredSchedule;
        };
        setWeekStart(parsed.weekStart || thisMonday);
        setWeeks(parsed.weeks || {});
      } else {
        setWeekStart(thisMonday);
      }
    } catch {
      setWeekStart(thisMonday);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !weekStart) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ weekStart, weeks }),
    );
  }, [hydrated, weekStart, weeks]);

  const currentWeek = weeks[weekStart] ?? emptyWeek();

  const updateCurrentWeek = (update: (week: WeekData) => WeekData) => {
    if (!weekStart) return;
    setWeeks((existing) => ({
      ...existing,
      [weekStart]: update(existing[weekStart] ?? emptyWeek()),
    }));
  };

  const hoursByPerson = useMemo(() => {
    const totals: Record<string, number> = {};
    currentWeek.people.forEach((person) => {
      totals[person.id] = DAYS.reduce((hours, day) => {
        const shifts = currentWeek.schedule[day];
        return (
          hours +
          (shifts.opening.includes(person.id)
            ? shiftDetails(currentWeek, day, "opening").hours
            : 0) +
          (shifts.closing.includes(person.id)
            ? shiftDetails(currentWeek, day, "closing").hours
            : 0)
        );
      }, 0);
    });
    return totals;
  }, [currentWeek]);

  const totalHours = Object.values(hoursByPerson).reduce(
    (total, hours) => total + hours,
    0,
  );
  const scheduledPeople = Object.values(hoursByPerson).filter(
    (hours) => hours > 0,
  ).length;
  const openShifts = DAYS.reduce(
    (total, day) =>
      total +
      (currentWeek.schedule[day].opening.length === 0 ? 1 : 0) +
      (currentWeek.schedule[day].closing.length === 0 ? 1 : 0),
    0,
  );

  const addPeople = (event: FormEvent) => {
    event.preventDefault();
    const names = nameInput
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter(Boolean);
    if (!names.length) return;

    updateCurrentWeek((week) => {
      const existingNames = new Set(
        week.people.map((person) => person.name.toLocaleLowerCase()),
      );
      const additions = names
        .filter(
          (name, index, allNames) =>
            !existingNames.has(name.toLocaleLowerCase()) &&
            allNames.findIndex(
              (candidate) =>
                candidate.toLocaleLowerCase() === name.toLocaleLowerCase(),
            ) === index,
        )
        .map((name) => ({
          id: `${Date.now()}-${crypto.randomUUID()}`,
          name,
        }));
      return { ...week, people: [...week.people, ...additions] };
    });
    setNameInput("");
  };

  const removePerson = (personId: string) => {
    updateCurrentWeek((week) => ({
      ...week,
      people: week.people.filter((person) => person.id !== personId),
      schedule: Object.fromEntries(
        DAYS.map((day) => [
          day,
          {
            opening: week.schedule[day].opening.filter(
              (id) => id !== personId,
            ),
            closing: week.schedule[day].closing.filter(
              (id) => id !== personId,
            ),
          },
        ]),
      ) as Record<Day, DaySchedule>,
    }));
  };

  const toggleAssignment = (day: Day, shift: Shift, personId: string) => {
    updateCurrentWeek((week) => {
      const assigned = week.schedule[day][shift];
      const next = assigned.includes(personId)
        ? assigned.filter((id) => id !== personId)
        : [...assigned, personId];
      return {
        ...week,
        schedule: {
          ...week.schedule,
          [day]: { ...week.schedule[day], [shift]: next },
        },
      };
    });
  };

  const updateShiftTime = (
    day: Day,
    shift: Shift,
    field: "start" | "end",
    hour: number,
  ) => {
    updateCurrentWeek((week) => {
      const current = shiftWindowFor(week, day, shift);
      const next = { ...current };
      if (field === "start") {
        next.start = Math.min(22, Math.max(10, Math.round(hour)));
        if (next.end <= next.start) next.end = Math.min(23, next.start + 1);
      } else {
        next.end = Math.min(23, Math.max(11, Math.round(hour)));
        if (next.start >= next.end) next.start = Math.max(10, next.end - 1);
      }

      return {
        ...week,
        shiftTimes: {
          ...(week.shiftTimes ?? emptyShiftTimes()),
          [day]: {
            opening: shiftWindowFor(week, day, "opening"),
            closing: shiftWindowFor(week, day, "closing"),
            [shift]: next,
          },
        },
      };
    });
  };

  const resetShiftTimesForDay = (day: Day) => {
    updateCurrentWeek((week) => ({
      ...week,
      shiftTimes: {
        ...(week.shiftTimes ?? emptyShiftTimes()),
        [day]: {
          opening: defaultShiftWindow(day, "opening"),
          closing: defaultShiftWindow(day, "closing"),
        },
      },
    }));
  };

  const clearSchedule = () => {
    updateCurrentWeek((week) => ({
      ...week,
      schedule: emptySchedule(),
    }));
  };

  const moveWeek = (amount: number) => {
    if (!weekStart) return;
    setWeekStart(addDays(weekStart, amount * 7));
    setView("build");
  };

  const chooseWeek = (value: string) => {
    if (!value) return;
    setWeekStart(toIsoDate(mondayOf(dateFromIso(value))));
    setView("build");
  };

  const overlapWindowForDay = (day: Day) => {
    const opening = shiftWindowFor(currentWeek, day, "opening");
    const closing = shiftWindowFor(currentWeek, day, "closing");
    const start = Math.max(opening.start, closing.start);
    const end = Math.min(opening.end, closing.end);
    return start < end ? { start, end } : null;
  };

  const dayHasShiftOverlap = (day: Day) => Boolean(overlapWindowForDay(day));

  const overlapLabel = (day: Day) => {
    const overlap = overlapWindowForDay(day);
    return overlap
      ? `${formatHour(overlap.start)}–${formatHour(overlap.end)} overlap`
      : "No overlap";
  };

  const overlapIsCovered = (day: Day) =>
    dayHasShiftOverlap(day) &&
    currentWeek.schedule[day].opening.length > 0 &&
    currentWeek.schedule[day].closing.length > 0 &&
    new Set([
      ...currentWeek.schedule[day].opening,
      ...currentWeek.schedule[day].closing,
    ]).size >= 2;

  return (
    <main className="app-shell">
      <header className="topbar no-print">
        <a className="brand" href="#top" aria-label="Weekwise home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Weekwise</span>
        </a>
        <div className="save-status" aria-live="polite">
          <span className="save-dot" />
          Saved on this device
        </div>
      </header>

      <section className="page" id="top">
        <div className="page-heading no-print">
          <div>
            <p className="eyebrow">Weekly staff planner</p>
            <h1>{view === "build" ? "Build the week" : "Your week, at a glance"}</h1>
            <p className="heading-copy">
              {view === "build"
                ? "Add your team and tap each person into the shifts they’re working."
                : "A clean, ready-to-share schedule with weekly hours already totaled."}
            </p>
          </div>
          <div className="step-switch" aria-label="Scheduler progress">
            <button
              className={view === "build" ? "active" : ""}
              onClick={() => setView("build")}
              type="button"
            >
              <span>1</span> Plan
            </button>
            <span className="step-line" />
            <button
              className={view === "preview" ? "active" : ""}
              onClick={() => setView("preview")}
              type="button"
            >
              <span>2</span> Preview
            </button>
          </div>
        </div>

        <div className="week-toolbar no-print">
          <button
            className="icon-button"
            onClick={() => moveWeek(-1)}
            type="button"
            aria-label="Previous week"
          >
            ←
          </button>
          <label className="week-picker">
            <span>Week of</span>
            <strong>{weekLabel(weekStart)}</strong>
            <input
              type="date"
              value={weekStart}
              onChange={(event) => chooseWeek(event.target.value)}
              aria-label="Choose a week"
            />
          </label>
          <button
            className="icon-button"
            onClick={() => moveWeek(1)}
            type="button"
            aria-label="Next week"
          >
            →
          </button>
          <span className="store-hours">Store hours · 10 AM–11 PM</span>
        </div>

        {view === "build" ? (
          <div className="builder-layout">
            <aside className="builder-sidebar no-print">
              <section className="shift-settings-panel">
                <div className="panel-heading shift-panel-heading">
                  <div>
                    <p className="section-kicker">Step 1</p>
                    <h2>Shift times</h2>
                  </div>
                  <span className="settings-icon" aria-hidden="true">⌚</span>
                </div>

                <div className="shift-settings-body">
                  <label className="settings-day-select">
                    <span>Set times for</span>
                    <select
                      value={settingsDay}
                      onChange={(event) => setSettingsDay(event.target.value as Day)}
                    >
                      {DAYS.map((day) => (
                        <option value={day} key={day}>{day}</option>
                      ))}
                    </select>
                  </label>

                  {(["opening", "closing"] as const).map((shift) => {
                    const window = shiftWindowFor(currentWeek, settingsDay, shift);
                    return (
                      <fieldset className={`shift-time-card ${shift}`} key={shift}>
                        <legend>
                          <span className="table-shift-dot" />
                          {shift === "opening" ? "First shift" : "Second shift"}
                          <b>{window.end - window.start} hrs</b>
                        </legend>
                        <div className="time-select-grid">
                          <label>
                            <span>Starts</span>
                            <select
                              value={window.start}
                              onChange={(event) =>
                                updateShiftTime(
                                  settingsDay,
                                  shift,
                                  "start",
                                  Number(event.target.value),
                                )
                              }
                            >
                              {Array.from({ length: 13 }, (_, index) => 10 + index).map(
                                (hour) => (
                                  <option value={hour} key={hour}>
                                    {formatHour(hour)}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                          <span className="time-arrow" aria-hidden="true">→</span>
                          <label>
                            <span>Ends</span>
                            <select
                              value={window.end}
                              onChange={(event) =>
                                updateShiftTime(
                                  settingsDay,
                                  shift,
                                  "end",
                                  Number(event.target.value),
                                )
                              }
                            >
                              {Array.from(
                                { length: 23 - window.start },
                                (_, index) => window.start + index + 1,
                              ).map((hour) => (
                                <option value={hour} key={hour}>
                                  {formatHour(hour)}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </fieldset>
                    );
                  })}

                  <div className={`settings-overlap ${
                    overlapWindowForDay(settingsDay) ? "active" : ""
                  }`}>
                    <span aria-hidden="true">↔</span>
                    <span>
                      <strong>{overlapLabel(settingsDay)}</strong>
                      <small>
                        {overlapWindowForDay(settingsDay)
                          ? "Both shifts work together"
                          : "Shift handoff has no overlap"}
                      </small>
                    </span>
                  </div>

                  <button
                    className="reset-times-button"
                    type="button"
                    onClick={() => resetShiftTimesForDay(settingsDay)}
                  >
                    Reset {settingsDay} to default
                  </button>
                </div>
              </section>

              <section className="team-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Step 2</p>
                  <h2>Your team</h2>
                </div>
                <span className="count-badge">{currentWeek.people.length}</span>
              </div>
              <form onSubmit={addPeople} className="add-person-form">
                <label htmlFor="team-names">Add names</label>
                <textarea
                  id="team-names"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder="e.g. Maya, Jordan, Sam"
                  rows={3}
                />
                <p>Paste several names separated by commas.</p>
                <button className="primary-button full" type="submit">
                  <span aria-hidden="true">＋</span> Add to this week
                </button>
              </form>

              <div className="team-list">
                {currentWeek.people.length === 0 ? (
                  <div className="empty-team">
                    <span aria-hidden="true">✦</span>
                    <strong>Your team will appear here</strong>
                    <p>Add the people working this week to get started.</p>
                  </div>
                ) : (
                  currentWeek.people.map((person) => (
                    <div className="team-row" key={person.id}>
                      <span className="avatar" aria-hidden="true">
                        {person.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="team-name">
                        <strong>{person.name}</strong>
                        <small>{hoursByPerson[person.id] || 0} hrs scheduled</small>
                      </span>
                      <button
                        className="remove-button"
                        type="button"
                        onClick={() => removePerson(person.id)}
                        aria-label={`Remove ${person.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
              </section>
            </aside>

            <section className="schedule-panel">
              <div className="schedule-heading no-print">
                <div>
                  <p className="section-kicker">Step 3</p>
                  <h2>Assign shifts</h2>
                  <p>
                    Set the day’s shift windows on the left, then tap names to
                    assign the team. Hours update automatically.
                  </p>
                </div>
                {totalHours > 0 && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={clearSchedule}
                  >
                    Clear shifts
                  </button>
                )}
              </div>

              <div className="day-grid">
                {DAYS.map((day, dayIndex) => (
                  <article
                    className={`day-card ${
                      dayHasShiftOverlap(day) ? "extended" : ""
                    }`}
                    key={day}
                  >
                    <div className="day-heading">
                      <div>
                        <h3>{day}</h3>
                        <span>{dayDate(weekStart, dayIndex)}</span>
                      </div>
                      <span className="day-hours">
                        {currentWeek.people.reduce(
                          (total, person) =>
                            total +
                            (currentWeek.schedule[day].opening.includes(person.id)
                              ? shiftDetails(currentWeek, day, "opening").hours
                              : 0) +
                            (currentWeek.schedule[day].closing.includes(person.id)
                              ? shiftDetails(currentWeek, day, "closing").hours
                              : 0),
                          0,
                        )}
                        h
                      </span>
                    </div>

                    {dayHasShiftOverlap(day) && (
                      <div
                        className={`overlap-banner ${
                          overlapIsCovered(day) ? "covered" : ""
                        }`}
                      >
                        <span className="overlap-mark" aria-hidden="true">
                          ↔
                        </span>
                        <span>
                          <strong>{overlapLabel(day)}</strong>
                          <small>First and second shift work together</small>
                        </span>
                        <b>
                          {overlapIsCovered(day)
                            ? "Covered"
                            : "Assign both shifts"}
                        </b>
                      </div>
                    )}

                    {(["opening", "closing"] as const).map((shift) => {
                      const details = shiftDetails(currentWeek, day, shift);
                      return (
                      <div className={`shift-block ${shift}`} key={shift}>
                        <div className="shift-label">
                          <span className="shift-icon" aria-hidden="true">
                            {shift === "opening" ? "☼" : "◐"}
                          </span>
                          <span>
                            <strong>{details.label}</strong>
                            <small>{details.time} · {details.hours} hrs</small>
                          </span>
                        </div>
                        <div className="person-options">
                          {currentWeek.people.length === 0 ? (
                            <span className="add-team-prompt">Add your team first</span>
                          ) : (
                            currentWeek.people.map((person) => {
                              const isSelected = currentWeek.schedule[day][
                                shift
                              ].includes(person.id);
                              return (
                                <span className="person-option" key={person.id}>
                                  <button
                                    className={`assignment-toggle ${
                                      isSelected ? "selected" : ""
                                    }`}
                                    aria-pressed={isSelected}
                                    onClick={() =>
                                      toggleAssignment(day, shift, person.id)
                                    }
                                    type="button"
                                  >
                                    <span>{isSelected ? "✓" : "+"}</span>
                                    {person.name}
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </article>
                ))}
              </div>

              <div className="builder-footer no-print">
                <p>
                  <span>i</span> Shift times are set per day and apply to every
                  worker assigned to that shift. The latest end time is 11 PM.
                </p>
                <button
                  className="primary-button review-button"
                  type="button"
                  onClick={() => {
                    setView("preview");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentWeek.people.length === 0}
                >
                  Review weekly schedule <span aria-hidden="true">→</span>
                </button>
              </div>
            </section>
          </div>
        ) : (
          <section className="preview-section">
            <div className="summary-strip no-print">
              <div>
                <span>Team scheduled</span>
                <strong>{scheduledPeople}</strong>
              </div>
              <div>
                <span>Weekly labor</span>
                <strong>{totalHours} hrs</strong>
              </div>
              <div>
                <span>Shifts unassigned</span>
                <strong className={openShifts > 0 ? "warning-text" : ""}>
                  {openShifts}
                </strong>
              </div>
              <div className="preview-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setView("build")}
                >
                  ← Edit schedule
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => window.print()}
                >
                  Print schedule
                </button>
              </div>
            </div>

            <article className="schedule-sheet">
              <div className="sheet-header">
                <div>
                  <span className="sheet-brand">WEEKWISE</span>
                  <h2>Weekly team schedule</h2>
                  <p>{weekLabel(weekStart)}</p>
                </div>
                <div className="hours-lockup">
                  <span>Store hours</span>
                  <strong>10 AM–11 PM</strong>
                  <small>Every day</small>
                </div>
              </div>

              <div className="table-wrap">
                <table className="weekly-matrix">
                  <thead>
                    <tr className="matrix-date-row">
                      <th className="team-column" rowSpan={2}>
                        <span>Team member</span>
                        <small>Weekly hours beside each name</small>
                      </th>
                      {DAYS.map((day, index) => (
                        <th
                          className={
                            dayHasShiftOverlap(day) ? "extended-column" : ""
                          }
                          key={day}
                        >
                          {dayDate(weekStart, index)}
                        </th>
                      ))}
                    </tr>
                    <tr className="matrix-day-row">
                      {DAYS.map((day) => (
                        <th
                          className={
                            dayHasShiftOverlap(day) ? "extended-column" : ""
                          }
                          key={day}
                        >
                          <strong>{day}</strong>
                          {dayHasShiftOverlap(day) && (
                            <small>{overlapLabel(day)}</small>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentWeek.people.length ? (
                      currentWeek.people.map((person) => {
                        const shiftCount = DAYS.reduce(
                          (count, day) =>
                            count +
                            (currentWeek.schedule[day].opening.includes(person.id)
                              ? 1
                              : 0) +
                            (currentWeek.schedule[day].closing.includes(person.id)
                              ? 1
                              : 0),
                          0,
                        );

                        return (
                          <tr className="employee-row" key={person.id}>
                            <th scope="row">
                              <div className="matrix-person">
                                <span className="avatar" aria-hidden="true">
                                  {person.name.slice(0, 1).toUpperCase()}
                                </span>
                                <span>
                                  <strong>
                                    {person.name} <b>({hoursByPerson[person.id]}h)</b>
                                  </strong>
                                  <small>
                                    {shiftCount} {shiftCount === 1 ? "shift" : "shifts"}
                                  </small>
                                </span>
                              </div>
                            </th>
                            {DAYS.map((day) => {
                              const assignedShifts = (
                                ["opening", "closing"] as const
                              ).filter((shift) =>
                                currentWeek.schedule[day][shift].includes(person.id),
                              );

                              return (
                                <td
                                  className={
                                    dayHasShiftOverlap(day)
                                      ? "extended-column"
                                      : ""
                                  }
                                  key={day}
                                >
                                  {assignedShifts.length ? (
                                    <div className="matrix-shifts">
                                      {assignedShifts.map((shift) => {
                                        const details = shiftDetails(
                                          currentWeek,
                                          day,
                                          shift,
                                        );
                                        return (
                                          <span
                                            className={`matrix-shift ${shift}`}
                                            key={shift}
                                          >
                                            <i aria-hidden="true" />
                                            <span>
                                              <strong>{details.time}</strong>
                                              <small>
                                                {shift === "opening"
                                                  ? "First shift"
                                                  : "Second shift"}
                                              </small>
                                            </span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="off-duty">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="matrix-empty-row">
                        <td colSpan={8}>Add your team and assign shifts to fill this schedule.</td>
                      </tr>
                    )}

                    <tr className="store-coverage-row">
                      <th scope="row">
                        <strong>Store hours</strong>
                        <small>Daily coverage window</small>
                      </th>
                      {DAYS.map((day) => (
                        <td key={day}>10 AM–11 PM</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <footer className="sheet-footer">
                <span>Prepared with Weekwise</span>
                <span>Week of {weekLabel(weekStart)}</span>
              </footer>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}
