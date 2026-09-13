"use client";

import { CaretUpDownIcon, CheckIcon } from "../Icons";
import { Menu, MenuItem } from "./Menu";

export type SelectOption = { value: string; label: string };

/**
 * The closed select: a BORDERED BOX the height of a field, with the stacked
 * caret hard right.
 *
 * Exported so a call site that needs a width composes this string instead of
 * restating the chrome:
 *
 *     buttonClass={`${selectTriggerClass} w-full`}
 *
 * No outline-none: the trigger is a button, so keyboard focus shows the global
 * focus-visible ring.
 */
export const selectTriggerClass =
  "tap flex h-9 items-center gap-2 rounded-control border border-border bg-card px-3 text-sm font-medium text-ink transition hover:border-muted";

/**
 * A design-system replacement for the native <select>: the same popover as every
 * other dropdown in the app, never the OS-styled list, so a day picker and a
 * theme picker are visibly the same control.
 */
export function SelectMenu({
  value,
  options,
  onChange,
  placeholder = "Select…",
  ariaLabel,
  buttonClass,
  panelClass = "w-48",
  align = "start",
}: {
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  buttonClass?: string;
  panelClass?: string;
  align?: "start" | "end";
}) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Menu
      ariaLabel={ariaLabel}
      align={align}
      buttonClass={buttonClass ?? selectTriggerClass}
      panelClass={`${panelClass} max-h-80 overflow-y-auto p-1.5`}
      button={
        <>
          <span className={`min-w-0 flex-1 truncate text-left ${selected ? "" : "text-muted"}`}>
            {selected?.label ?? placeholder}
          </span>
          {/* The select affordance is a stacked caret, not a lone chevron down.
              Rendered here rather than in the trigger class, so every call site
              gets it whatever box it passes. */}
          <span className="shrink-0 text-muted">
            <CaretUpDownIcon size={13} />
          </span>
        </>
      }
    >
      {(close) =>
        options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              close();
            }}
          >
            <span className="min-w-0 truncate">{option.label}</span>
            {option.value === value && (
              <span className="shrink-0 text-accent-text">
                <CheckIcon size={13} />
              </span>
            )}
          </MenuItem>
        ))
      }
    </Menu>
  );
}
