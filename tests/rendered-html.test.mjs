import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { formatWeekLabel } from "../app/week-label.ts";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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

test("server-renders the staff scheduler", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Weekwise · Staff Scheduler<\/title>/i);
  assert.match(html, /Build the week/);
  assert.match(html, /Weekly staff planner/);
  assert.match(html, /First shift/);
  assert.match(html, /10 AM – 4 PM/);
  assert.match(html, /10 AM – 8 PM/);
  assert.match(html, /4 PM – 11 PM/);
  assert.match(html, /4 PM–8 PM overlap/);
  assert.match(html, /Saved on this device/);
});

test("formats week ranges without malformed dates", () => {
  assert.equal(formatWeekLabel("2026-08-03"), "Aug 3–9, 2026");
  assert.equal(formatWeekLabel("2026-07-27"), "Jul 27 – Aug 2, 2026");
  assert.equal(
    formatWeekLabel("2027-12-27"),
    "Dec 27, 2027 – Jan 2, 2028",
  );
});

test("ships the completed app without starter preview assets", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /weekwise-scheduler-v1/);
  assert.match(page, /window\.localStorage/);
  assert.match(page, /hoursByPerson/);
  assert.match(page, /shiftDetails/);
  assert.match(page, /window\.end - window\.start/);
  assert.match(page, /weekly-matrix/);
  assert.match(page, /Team member/);
  assert.doesNotMatch(page, /Overlap coverage/);
  assert.match(page, /shiftTimes/);
  assert.match(page, /updateShiftTime/);
  assert.match(page, /Reset \{settingsDay\} to default/);
  assert.match(page, /latest end time is 11 PM/);
  assert.match(page, /dayHasShiftOverlap/);
  assert.match(layout, /Weekwise · Staff Scheduler/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(
    access(new URL("../app/_sites-preview", import.meta.url)),
  );
});
