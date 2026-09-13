"use client";

import type { ComponentPropsWithRef, ReactNode } from "react";

/**
 * The text-entry primitives. One field look, declared once: a hairline border on
 * the card surface, a muted placeholder, and a border that goes muted on focus.
 *
 * `outline-none` is deliberate: a field already says it has focus by darkening
 * its border, so the global :focus-visible ring would be a second, louder answer
 * to the same question. Button-shaped controls do NOT opt out and keep the ring.
 */
export const FIELD_CLASS =
  "tap rounded-control border border-border bg-card px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-muted";

/** A multi-line field: the only text entry left in the app, now that the week is
 *  stepped rather than typed into a date box. */
export function Textarea({ className = "", ref, ...rest }: ComponentPropsWithRef<"textarea">) {
  return <textarea ref={ref} {...rest} className={`${FIELD_CLASS} ${className}`} />;
}

/**
 * Label above control, with room for a hint and an error underneath.
 *
 * It renders the <label> AROUND the control, so the association needs no id and
 * there is no id to get wrong.
 */
export function Field({
  label,
  hint,
  error,
  className = "",
  children,
}: {
  label: ReactNode;
  /** Quiet help that is always true. Hidden while an error is showing. */
  hint?: ReactNode;
  /** What went wrong, in the reader's words. Replaces the hint. */
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-medium text-muted ${className}`}>
      {label}
      {children}
      {error ? (
        <span className="font-normal text-danger">{error}</span>
      ) : hint ? (
        <span className="font-normal">{hint}</span>
      ) : null}
    </label>
  );
}
