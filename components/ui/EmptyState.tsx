import type { ReactNode } from "react";
import { InfoIcon } from "../Icons";

/**
 * What a surface says when it has nothing to show.
 *
 * Room for a quiet icon, one sentence saying what fills the surface, and one
 * action. It is not for an error: an error says what failed and offers a retry;
 * this says the thing is empty, which is a fact, not a fault.
 */
export function EmptyState({
  icon,
  title,
  children,
  action,
  size = "compact",
  className = "",
}: {
  /** A quiet line icon, never an error badge or a loading animation. */
  icon?: ReactNode;
  title: ReactNode;
  /** One sentence: what lands here, and what has to happen first. */
  children?: ReactNode;
  action?: ReactNode;
  size?: "compact" | "page";
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center justify-center gap-3 text-center ${
        size === "page" ? "min-h-64 py-6 sm:py-10" : "py-6"
      } ${className}`}
    >
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center text-muted">
        {icon ?? <InfoIcon size={26} />}
      </span>
      <div className="min-w-0 max-w-full">
        <h3 className={`${size === "page" ? "text-lg sm:text-xl" : "text-sm"} font-semibold tracking-tight text-ink`}>
          {title}
        </h3>
        {children && <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-muted">{children}</p>}
      </div>
      {action && <div className="flex max-w-full flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}
