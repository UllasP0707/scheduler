"use client";

/**
 * The schedule, as a PNG file.
 *
 * WHY AN IMAGE AND NOT A PDF. Printing was the only way out of this app, and
 * "print to PDF" is three dialogs and a file nobody can paste into a group chat.
 * A rota gets shared, not filed - so the button hands back the picture directly.
 *
 * WHY PNG AND NOT JPG. The sheet is text and hairlines on white, which is the
 * exact case JPEG is worst at: its blocks smear grey fringes around every letter
 * and every 1px rule. PNG is lossless, and for flat colour it is also the
 * SMALLER of the two here. Every place a JPG can be pasted takes a PNG.
 *
 * WHY toPng OVER DRAWING IT BY HAND. The alternative was to redraw the grid on a
 * canvas, which gives total control and guarantees the download drifts away from
 * the screen the first time the sheet changes. The DOM stays the single source
 * of truth.
 *
 * THE NODE IS PUT IN CAPTURE MODE FIRST. `data-capturing` makes the sheet drop
 * its controls and show its paper-only text, exactly as @media print does - see
 * the shared block in app/globals.css. The attribute goes on the real element
 * rather than the clone because html-to-image reads COMPUTED styles off the
 * live document, so anything that is not true on screen at that moment cannot
 * reach the file.
 */
import { toPng } from "html-to-image";

/** `Aug 31 to Sep 6, 2026` becomes `aug-31-to-sep-6-2026`. */
export function slugifyWeek(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sheetFileName(weekLabel: string): string {
  return `weekwise-${slugifyWeek(weekLabel)}.png`;
}

export async function downloadSheetImage(node: HTMLElement, fileName: string): Promise<void> {
  node.dataset.capturing = "true";
  // Force the layout the attribute just asked for. html-to-image reads computed
  // styles, and a batched recalc would hand it the pre-capture ones.
  void node.offsetHeight;

  try {
    const dataUrl = await toPng(node, {
      // 2x, so the file is legible when somebody pinches into it on a phone or
      // drops it into a document at full width.
      pixelRatio: 2,
      // Without this the area outside the card is transparent, which reads as a
      // black frame in most chat clients.
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } finally {
    // In `finally` so a failed capture cannot leave the sheet stuck with its
    // controls hidden, which would look like the app had frozen.
    delete node.dataset.capturing;
  }
}
