import type { ReactNode } from "react";

/**
 * The one shared page frame, and it is FULL WIDTH.
 *
 * There is no max-width cap. The usual reason to cap a page is that long lines
 * of prose are hard to read, and this app has no prose in it - both screens are
 * a seven-day grid or a pair of panels, and every pixel of gutter is a pixel the
 * week could have been read in. Both screens wear this, so nothing shifts
 * between them.
 *
 * What is left is a 100px gutter each side, and this is THE ONE LENGTH IN THE
 * APP WRITTEN IN PIXELS. Everything else is rem so that the scale block in
 * app/globals.css can grow the whole design together on a big monitor - but the
 * gutter is the thing that scale is being fed FROM. In rem it would inflate with
 * the root size and eat back a share of the very room the bigger type was meant
 * to be spent in; in px it stays put, and every pixel a wider window brings goes
 * to the week.
 *
 * IT ONLY APPLIES FROM `lg` UP, and that is not timidity, it is arithmetic. 100
 * each side is 200px of gutter: on a 1024px window that still leaves 824px for
 * the week, but on a 640px tablet it would leave 440, and on a 360px phone there
 * would be nothing left at all. So the gutter grows with the room there is to
 * give it - 16px, then 24px, then the full 100.
 *
 * `data-print-page`: paper has its own margin (see @page in app/globals.css), so
 * the column gives that padding back there rather than spending a second margin
 * inside the first.
 */
export function PageContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div data-print-page className={`w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-[100px] ${className}`}>
      {children}
    </div>
  );
}
