import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { formatWeekLabel, formatWeekRange } from "../app/week-label.ts";

// Trailing slash included on purpose: next.config.ts sets trailingSlash, so
// "/preview" answers 308 and only "/preview/" answers 200.
async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

/**
 * Every source file the app itself is built from, as one string.
 *
 * The assertions below are about the APP, not about which file happens to hold a
 * given line: the two screens, the design-system primitives and the week's rules
 * live in three directories, and a test that pins a behaviour to one path is a
 * test that fails the next time a file is split.
 */
async function appSource() {
  const files = [];

  async function walk(dir) {
    for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await walk(path);
      else if (/\.(ts|tsx|css)$/.test(entry.name)) files.push(path);
    }
  }

  for (const root of ["app", "components", "lib"]) await walk(root);
  const contents = await Promise.all(
    files.map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")),
  );
  return contents.join("\n");
}

test("server-renders the week builder", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Weekwise · Staff Scheduler<\/title>/i);
  assert.match(html, /Build the week/);
  assert.match(html, /Weekly staff planner/);
  assert.match(html, /Shift times/);
  assert.match(html, /Your team/);
  assert.match(html, /First shift/);
  assert.match(html, /Second shift/);
  assert.match(html, /Saved on this device/);

  // No app chrome, and no theme machinery: one light theme, drawn once.
  assert.doesNotMatch(html, /data-theme/);
  assert.doesNotMatch(html, /prefers-color-scheme/);
});

test("server-renders the printable week, with a picker on every shift", async () => {
  const response = await render("/preview/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Assign the week/);
  assert.match(html, /Weekly team schedule/);
  assert.match(html, /Weekly hours/);

  // Every day states its own two windows, including the two that run late.
  assert.match(html, /10 AM to 4 PM/);
  assert.match(html, /10 AM to 8 PM/);
  assert.match(html, /4 PM to 11 PM/);
  assert.match(html, /4 PM to 8 PM overlap/);

  // Assignment happens here, in a dropdown per shift per day.
  assert.match(html, /data-people-picker/);
  assert.match(html, /choose who works it/);

  // The sheet is the one thing on this screen that reaches paper, and the
  // chrome around it is the one thing that must not.
  assert.match(html, /data-print-sheet/);
  assert.match(html, /data-print-hide/);

  // Two ways out, and the image leads.
  assert.match(html, /Download image/);
  assert.match(html, /Print/);

  // Rejected from the sheet: the same store hours repeated under every day, and
  // the branding that was already taken off its heading.
  assert.doesNotMatch(html, /Daily coverage window/);
  assert.doesNotMatch(html, /Prepared with Weekwise/);
});

test("formats week ranges without malformed dates", () => {
  assert.equal(formatWeekLabel("2026-08-03"), "Aug 3 to Aug 9, 2026");
  assert.equal(formatWeekLabel("2026-07-27"), "Jul 27 to Aug 2, 2026");
  assert.equal(
    formatWeekLabel("2027-12-27"),
    "Dec 27, 2027 to Jan 2, 2028",
  );
});

test("the week stepper names both ends, with no year", () => {
  assert.equal(formatWeekRange("2026-09-14"), "Sep 14 to Sep 20");
  assert.equal(formatWeekRange("2026-08-31"), "Aug 31 to Sep 6");
  assert.equal(formatWeekRange("2027-12-27"), "Dec 27 to Jan 2");
  // Nothing saved yet: the stepper says so rather than printing "Invalid Date".
  assert.equal(formatWeekRange(""), "Loading…");
});

test("ships the completed app without starter preview assets", async () => {
  const [source, layout, packageJson] = await Promise.all([
    appSource(),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  // The week is saved in this browser and nowhere else.
  assert.match(source, /weekwise-scheduler-v1/);
  assert.match(source, /window\.localStorage/);

  // Hours are calculated rather than typed in.
  assert.match(source, /weeklyHours/);
  assert.match(source, /shiftDetails/);
  assert.match(source, /window\.end - window\.start/);

  // Per-day shift windows, and the way back to the defaults.
  assert.match(source, /shiftTimes/);
  assert.match(source, /updateShiftTime/);
  assert.match(source, /Reset \{settingsDay\} to default/);
  assert.match(source, /latest end time is 11 PM/);
  assert.match(source, /hasOverlap/);

  // One theme, and no control for it. Matched on the forms that DO something -
  // the at-rule and the attribute selector - so the note in app/globals.css
  // explaining why neither is here does not trip its own rule.
  assert.doesNotMatch(source, /@media \(prefers-color-scheme/);
  assert.doesNotMatch(source, /\[data-theme|dataset\.theme/);

  // Rejected wording that must not come back.
  assert.doesNotMatch(source, /Overlap coverage/);

  // NO EN DASHES AND NO EM DASHES, anywhere - not in the copy, not in a range,
  // not in a comment. Ranges are written with the word "to". This is a guard
  // rather than a style note: every dash in this app arrived inside a template
  // literal that formats a time or a date, which is exactly the sort of thing
  // that gets re-added one formatter at a time.
  assert.doesNotMatch(source, /[–—]/);

  assert.match(layout, /Weekwise · Staff Scheduler/);
  assert.doesNotMatch(source, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(
    access(new URL("../app/_sites-preview", import.meta.url)),
  );
});
