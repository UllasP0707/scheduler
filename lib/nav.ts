/**
 * The whole of this app's navigation, in one list.
 *
 * Two screens, and they are the two halves of the job: set up the week, then
 * assign it and print it. They are real routes rather than a `view` flag so the
 * Back button, a bookmark and a second tab all behave the way a browser has
 * taught everybody they behave - the schedule itself lives in lib/schedule.ts
 * and survives the navigation.
 *
 * There is no sidebar and no top bar to hold these, deliberately: with exactly
 * two destinations, a segmented control in each screen's own header
 * (components/ScreenTop) is the whole navigation, and it costs no fixed chrome
 * at the edges of a window that a seven-column table needs all of.
 */
export type NavStep = { href: string; label: string; shortLabel: string };

export const NAV_STEPS: readonly NavStep[] = [
  { href: "/", label: "Build the week", shortLabel: "Build" },
  // "Assign", not "Review": this screen is where the week is DECIDED, and a tab
  // called Review reads as a read-only summary of work finished somewhere else.
  { href: "/preview", label: "Assign and print", shortLabel: "Assign" },
];
