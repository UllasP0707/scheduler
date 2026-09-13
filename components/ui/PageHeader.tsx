import type { ReactNode } from "react";

/**
 * THE PAGE SUBTITLE, and it is a FIXED FORMAT.
 *
 *   1. Every screen has one. A page with no subtitle makes the reader guess what
 *      it is for.
 *   2. It is ONE SHORT LINE and that is the whole format - a phrase saying what
 *      the screen is for, not a sentence with a rule of thumb packed into it.
 *      Aim well under 45 characters, so it reads at a glance from behind a
 *      counter.
 *   3. No info marks here. There is no second half to a page subtitle: whatever
 *      the short line leaves out is left out.
 *
 * No em dashes, anywhere. This app separates clauses with " - ".
 */
export function PageSubtitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`mt-1 max-w-prose text-sm text-muted ${className}`}>{children}</p>;
}

/**
 * The title block every screen opens with: the name of the screen, its one short
 * line, and the controls that act on the whole screen hard right.
 *
 * `className` is for a caller that owns its own vertical rhythm. A margin passed
 * there REPLACES the default rather than fighting it: same-element Tailwind
 * conflicts resolve by stylesheet order, not class order, so `mb-5` has to be
 * left out entirely when the caller sets its own.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex flex-wrap items-end justify-between gap-3 ${
        /(^|\s)mb-/.test(className) ? "" : "mb-5"
      } ${className}`}
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
      </div>
      {action}
    </header>
  );
}
