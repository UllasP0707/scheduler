import type { ReactNode } from "react";

/**
 * Flat surface: a card on the page background, a hairline border, no shadow.
 * Everything with a box around it in this app is built from this - the panels,
 * the day tiles, the stat strip and the printed sheet.
 */
export function Card({
  children,
  className = "",
  as: Tag = "div",
  printSheet = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  /** This card IS the printed page (see the print block in app/globals.css). */
  printSheet?: boolean;
}) {
  return (
    <Tag className={`rounded-xl border border-border bg-card ${className}`} data-print-sheet={printSheet ? "" : undefined}>
      {children}
    </Tag>
  );
}

/**
 * A card's own title row: the heading, an optional quiet line under it, and one
 * control hard right. Bordered along the bottom, because a panel with sections
 * under it needs the head to be a head rather than the first of them.
 */
export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** A quiet glyph in front of the title, for a panel that is one of several. */
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 border-b border-border px-4 py-3 ${className}`}>
      <div className="flex min-w-0 items-start gap-2.5">
        {icon && <span className="mt-0.5 shrink-0 text-muted">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
