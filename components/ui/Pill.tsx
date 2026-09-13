import type { ReactNode } from "react";

export type PillTone = "accent" | "success" | "warning" | "danger" | "info" | "muted" | "brand";

const TONE: Record<PillTone, string> = {
  accent: "bg-accent-soft text-accent-text",
  success: "bg-positive-soft text-positive",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  muted: "bg-element text-muted",
  brand: "bg-brand-soft text-brand",
};

/** A small semantic status pill (colour AND text, never colour alone). */
export function Pill({
  tone = "muted",
  children,
  className = "",
  title,
}: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * The round mark that stands in for a person: their first initial on a soft
 * accent tile. Not a photo and never will be - this app stores nothing about
 * anybody but a name they typed.
 */
export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text ${className}`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
