"use client";

import { useRef, useState } from "react";
import { formatWeekLabel } from "@/app/week-label";
import { ScreenTop } from "@/components/ScreenTop";
import { ScheduleSheet } from "@/components/scheduler/ScheduleSheet";
import { WeekStepper } from "@/components/scheduler/WeekStepper";
import { DownloadIcon, PrinterIcon } from "@/components/Icons";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { downloadSheetImage, sheetFileName } from "@/lib/capture";
import { useSchedule } from "@/lib/schedule";

/**
 * The week, assigned and handed over.
 *
 * The sheet below is the whole screen: who works what is chosen in it, and it is
 * the only part of this page that leaves the app. Everything around it wears
 * `data-print-hide`, which covers both ways out - the printer and the PNG.
 *
 * DOWNLOAD LEADS AND PRINT FOLLOWS. A rota gets pasted into a group chat far
 * more often than it gets taped to a wall, and "print to PDF" was three dialogs
 * to reach a file nobody could paste. Printing is still here for the wall.
 */
export default function PreviewPage() {
  const { weekStart, week, moveWeek, toggleAssignment, clearSchedule } = useSchedule();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const download = async () => {
    const node = sheetRef.current;
    if (!node || saving) return;
    setSaving(true);
    try {
      await downloadSheetImage(node, sheetFileName(formatWeekLabel(weekStart)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <ScreenTop activeHref="/preview" />

      <div data-print-hide>
        <PageHeader
          title="Assign the week"
          subtitle="Choose who works each shift, then share it."
          action={
            /* The ways out first, the week last. The control that says WHICH
               week you are acting on closes the row nearest the grid it
               labels. */
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={download} disabled={saving}>
                <DownloadIcon size={14} />
                {saving ? "Saving image…" : "Download image"}
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <PrinterIcon size={14} />
                Print
              </Button>
              <WeekStepper weekStart={weekStart} onMove={moveWeek} />
            </div>
          }
        />
      </div>

      {/* The capture target is this wrapper rather than the card itself, so the
          sheet stays a presentational component with no ref to thread through
          it. The wrapper is a plain block the card fills, so the two have the
          same box. */}
      <div ref={sheetRef}>
        <ScheduleSheet week={week} weekStart={weekStart} onToggle={toggleAssignment} onClear={clearSchedule} />
      </div>
    </PageContainer>
  );
}
