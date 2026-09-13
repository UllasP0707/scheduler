"use client";

/**
 * The week, its rules, and the one store that holds it.
 *
 * Everything above the fold here is PURE: days, shift windows, hour arithmetic
 * and the labels the UI prints. The store at the foot is the only part that
 * touches the browser, and it is an external store read through
 * useSyncExternalStore rather than state plus an effect: localStorage is an
 * external system, this app is statically exported, and the first client render
 * has to match the prerendered HTML. getServerSnapshot returns the empty week,
 * so the server HTML and the hydrating client agree; React then re-renders with
 * whatever this browser had saved.
 *
 * That is also what keeps the schedule alive across a navigation between the
 * planner and the preview: the state lives in a module, not in a page.
 */
import { useSyncExternalStore } from "react";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Day = (typeof DAYS)[number];
export type Shift = "opening" | "closing";
export type Person = { id: string; name: string };
export type DaySchedule = Record<Shift, string[]>;
export type ShiftWindow = { start: number; end: number };
export type WeekData = {
  people: Person[];
  schedule: Record<Day, DaySchedule>;
  shiftTimes?: Record<Day, Record<Shift, ShiftWindow>>;
};
export type StoredSchedule = Record<string, WeekData>;

export const STORAGE_KEY = "weekwise-scheduler-v1";

/** The store is open 10 AM to 11 PM, and no shift may fall outside it. */
export const STORE_OPEN = 10;
export const STORE_CLOSE = 23;

export const SHIFT_LABEL: Record<Shift, string> = {
  opening: "First shift",
  closing: "Second shift",
};

export const SHIFTS: readonly Shift[] = ["opening", "closing"];

export function byDay<T>(build: (day: Day) => T): Record<Day, T> {
  const result = {} as Record<Day, T>;
  for (const day of DAYS) result[day] = build(day);
  return result;
}

export function emptySchedule(): Record<Day, DaySchedule> {
  return byDay<DaySchedule>(() => ({ opening: [], closing: [] }));
}

/** Thursday and Friday run the first shift late, so the two shifts overlap. */
export function isExtendedDay(day: Day) {
  return day === "Thursday" || day === "Friday";
}

export function defaultShiftWindow(day: Day, shift: Shift): ShiftWindow {
  if (shift === "closing") return { start: 16, end: STORE_CLOSE };
  return { start: STORE_OPEN, end: isExtendedDay(day) ? 20 : 16 };
}

export function emptyShiftTimes(): Record<Day, Record<Shift, ShiftWindow>> {
  return byDay((day) => ({
    opening: defaultShiftWindow(day, "opening"),
    closing: defaultShiftWindow(day, "closing"),
  }));
}

export function emptyWeek(): WeekData {
  return { people: [], schedule: emptySchedule(), shiftTimes: emptyShiftTimes() };
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Noon, not midnight: a date pinned to the middle of the day cannot be tipped
 *  into the day before or after by a daylight-saving shift. */
export function mondayOf(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  result.setHours(12, 0, 0, 0);
  return result;
}

export function dateFromIso(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function addDays(value: string, days: number) {
  const date = dateFromIso(value);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** The date number a column sits on: 15, not "Sep 15". The month is already
 *  said once, by the week label above the sheet. */
export function dayNumber(value: string, index: number) {
  if (!value) return "";
  return String(dateFromIso(addDays(value, index)).getDate());
}

export function formatHour(hour: number) {
  if (hour === 12) return "12 PM";
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
}

/**
 * A saved window, or the default when what is saved cannot be trusted. Anything
 * outside the store hours, inverted, or not a whole hour is treated as absent
 * rather than clamped: a schedule read back from another version of this app has
 * to land on something a reader can recognise.
 */
export function shiftWindowFor(week: WeekData, day: Day, shift: Shift) {
  const fallback = defaultShiftWindow(day, shift);
  const saved = week.shiftTimes?.[day]?.[shift];
  if (
    !saved ||
    !Number.isInteger(saved.start) ||
    !Number.isInteger(saved.end) ||
    saved.start < STORE_OPEN ||
    saved.start > STORE_CLOSE - 1 ||
    saved.end <= saved.start ||
    saved.end > STORE_CLOSE
  ) {
    return fallback;
  }
  return saved;
}

export function shiftDetails(week: WeekData, day: Day, shift: Shift) {
  const window = shiftWindowFor(week, day, shift);
  return {
    label: SHIFT_LABEL[shift],
    time: `${formatHour(window.start)} to ${formatHour(window.end)}`,
    hours: window.end - window.start,
  };
}

/** The hours a person is down for across the whole week. */
export function weeklyHours(week: WeekData): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const person of week.people) {
    totals[person.id] = DAYS.reduce((hours, day) => {
      const shifts = week.schedule[day];
      return (
        hours +
        (shifts.opening.includes(person.id) ? shiftDetails(week, day, "opening").hours : 0) +
        (shifts.closing.includes(person.id) ? shiftDetails(week, day, "closing").hours : 0)
      );
    }, 0);
  }
  return totals;
}

/** The stretch where both shifts are on the floor together, if there is one. */
export function overlapWindow(week: WeekData, day: Day): ShiftWindow | null {
  const opening = shiftWindowFor(week, day, "opening");
  const closing = shiftWindowFor(week, day, "closing");
  const start = Math.max(opening.start, closing.start);
  const end = Math.min(opening.end, closing.end);
  return start < end ? { start, end } : null;
}

export function hasOverlap(week: WeekData, day: Day) {
  return overlapWindow(week, day) !== null;
}

export function overlapLabel(week: WeekData, day: Day) {
  const overlap = overlapWindow(week, day);
  return overlap ? `${formatHour(overlap.start)} to ${formatHour(overlap.end)} overlap` : "No overlap";
}

/* ------------------------------------------------------------------------- */
/* The store                                                                  */
/* ------------------------------------------------------------------------- */

export type ScheduleState = { weekStart: string; weeks: StoredSchedule };

/**
 * What the server renders, and what the client renders on its hydrating pass.
 * An empty weekStart is the signal every label in the app already understands as
 * "not known yet" - see app/week-label.ts.
 *
 * It has to be one frozen object: useSyncExternalStore compares snapshots by
 * identity, and a fresh literal every call is an infinite render loop.
 */
const SERVER_STATE: ScheduleState = Object.freeze({ weekStart: "", weeks: {} });

let state: ScheduleState | null = null;
const listeners = new Set<() => void>();

function readStored(): ScheduleState {
  const thisMonday = toIsoDate(mondayOf(new Date()));
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { weekStart: thisMonday, weeks: {} };
    const parsed = JSON.parse(saved) as { weekStart?: string; weeks?: StoredSchedule };
    return { weekStart: parsed.weekStart || thisMonday, weeks: parsed.weeks || {} };
  } catch {
    return { weekStart: thisMonday, weeks: {} };
  }
}

function snapshot(): ScheduleState {
  if (state === null) state = readStored();
  return state;
}

function commit(next: ScheduleState): void {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Private mode, or storage full. The week still works for this session and
       simply does not survive a reload - which is better than refusing an edit. */
  }
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // A second tab editing the same week: drop the cache and re-read, so this tab
  // shows what was actually saved rather than what it happened to have.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    state = readStored();
    for (const listener of listeners) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Rewrite the week currently on screen. A week that has never been touched is
 *  created from the defaults at the moment it is first edited. */
function updateWeek(current: ScheduleState, update: (week: WeekData) => WeekData): ScheduleState {
  if (!current.weekStart) return current;
  return {
    ...current,
    weeks: {
      ...current.weeks,
      [current.weekStart]: update(current.weeks[current.weekStart] ?? emptyWeek()),
    },
  };
}

export type ScheduleActions = {
  moveWeek: (weeks: number) => void;
  addPeople: (raw: string) => void;
  removePerson: (personId: string) => void;
  toggleAssignment: (day: Day, shift: Shift, personId: string) => void;
  updateShiftTime: (day: Day, shift: Shift, field: "start" | "end", hour: number) => void;
  resetShiftTimesForDay: (day: Day) => void;
  clearSchedule: () => void;
};

const actions: ScheduleActions = {
  moveWeek(weeks) {
    const current = snapshot();
    if (!current.weekStart) return;
    commit({ ...current, weekStart: addDays(current.weekStart, weeks * 7) });
  },

  /** Names come in as one blob: commas or newlines between them, and neither a
   *  duplicate of somebody already on the week nor a duplicate inside the blob
   *  itself is added twice. */
  addPeople(raw) {
    const names = raw
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter(Boolean);
    if (!names.length) return;

    commit(
      updateWeek(snapshot(), (week) => {
        const existing = new Set(week.people.map((person) => person.name.toLocaleLowerCase()));
        const additions = names
          .filter(
            (name, index, all) =>
              !existing.has(name.toLocaleLowerCase()) &&
              all.findIndex((candidate) => candidate.toLocaleLowerCase() === name.toLocaleLowerCase()) === index,
          )
          .map((name) => ({ id: `${Date.now()}-${crypto.randomUUID()}`, name }));
        return { ...week, people: [...week.people, ...additions] };
      }),
    );
  },

  /** Removing somebody takes their shifts with them. A schedule holding an id
   *  with no person behind it is a row that renders as nothing. */
  removePerson(personId) {
    commit(
      updateWeek(snapshot(), (week) => ({
        ...week,
        people: week.people.filter((person) => person.id !== personId),
        schedule: byDay<DaySchedule>((day) => ({
          opening: week.schedule[day].opening.filter((id) => id !== personId),
          closing: week.schedule[day].closing.filter((id) => id !== personId),
        })),
      })),
    );
  },

  toggleAssignment(day, shift, personId) {
    commit(
      updateWeek(snapshot(), (week) => {
        const assigned = week.schedule[day][shift];
        const next = assigned.includes(personId)
          ? assigned.filter((id) => id !== personId)
          : [...assigned, personId];
        return {
          ...week,
          schedule: { ...week.schedule, [day]: { ...week.schedule[day], [shift]: next } },
        };
      }),
    );
  },

  /**
   * Move one end of one shift. The other end follows when it has to: a start
   * pushed past its own end drags the end along, and the reverse. The result is
   * always at least an hour long and always inside the store hours, so there is
   * no combination of clicks that produces a shift nobody could work.
   */
  updateShiftTime(day, shift, field, hour) {
    commit(
      updateWeek(snapshot(), (week) => {
        const current = shiftWindowFor(week, day, shift);
        const next = { ...current };
        if (field === "start") {
          next.start = Math.min(STORE_CLOSE - 1, Math.max(STORE_OPEN, Math.round(hour)));
          if (next.end <= next.start) next.end = Math.min(STORE_CLOSE, next.start + 1);
        } else {
          next.end = Math.min(STORE_CLOSE, Math.max(STORE_OPEN + 1, Math.round(hour)));
          if (next.start >= next.end) next.start = Math.max(STORE_OPEN, next.end - 1);
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
      }),
    );
  },

  resetShiftTimesForDay(day) {
    commit(
      updateWeek(snapshot(), (week) => ({
        ...week,
        shiftTimes: {
          ...(week.shiftTimes ?? emptyShiftTimes()),
          [day]: {
            opening: defaultShiftWindow(day, "opening"),
            closing: defaultShiftWindow(day, "closing"),
          },
        },
      })),
    );
  },

  /** Clears the assignments and keeps the people and the shift windows: the
   *  common case is "start this week over", not "start this store over". */
  clearSchedule() {
    commit(updateWeek(snapshot(), (week) => ({ ...week, schedule: emptySchedule() })));
  },
};

/**
 * The week on screen, plus the actions that change it.
 *
 * `week` is derived rather than stored: an untouched week has no entry at all in
 * localStorage, and materialising one on read is what keeps an empty file empty.
 */
export function useSchedule(): {
  weekStart: string;
  week: WeekData;
  weeks: StoredSchedule;
} & ScheduleActions {
  const current = useSyncExternalStore(subscribe, snapshot, () => SERVER_STATE);
  return {
    weekStart: current.weekStart,
    weeks: current.weeks,
    week: current.weeks[current.weekStart] ?? emptyWeek(),
    ...actions,
  };
}
