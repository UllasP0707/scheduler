import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * The one button in the app:
 *
 *   primary       accent fill, the single affirmative action of a screen
 *   soft          accent-soft fill, the affirmative action of a form on a card
 *   secondary     hairline border, the quiet neighbour of a primary
 *   danger        danger fill, only ever behind a confirm
 *   ghost         plain text, a row action that must not compete with the row
 *   ghost-danger  plain text in danger, a destructive row action
 *
 * Blue is the working colour and orange is the brand mark, so there is no orange
 * variant and there will not be one. No variant sets its own focus ring either:
 * keyboard focus is the global neutral :focus-visible ring from globals.css.
 */
export type ButtonVariant = "primary" | "soft" | "secondary" | "danger" | "ghost" | "ghost-danger";
export type ButtonSize = "sm" | "md";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent font-semibold text-on-accent transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
  soft: "bg-accent-soft font-semibold text-accent-text transition hover:opacity-90 disabled:opacity-50",
  secondary: "border border-border bg-card font-semibold transition hover:bg-element active:scale-95 disabled:opacity-50",
  danger: "bg-danger font-semibold text-white transition active:scale-95 disabled:opacity-50",
  ghost: "font-medium text-muted transition hover:text-ink disabled:opacity-50",
  "ghost-danger": "font-medium text-danger transition hover:opacity-80 disabled:opacity-50",
};

/** Ghost variants are text, not a box: they take the type scale and nothing else. */
const isGhost = (variant: ButtonVariant): boolean => variant === "ghost" || variant === "ghost-danger";

const TEXT: Record<ButtonSize, string> = { sm: "text-xs", md: "text-sm" };
const PAD: Record<ButtonSize, string> = { sm: "px-2.5 py-1.5", md: "px-3 py-2" };

/**
 * ONE SHAPE: the box. Every control in this design is a rounded rectangle, so
 * the shape is not a choice a call site gets to make. Fully round is for badges,
 * which are not buttons.
 */
const RADIUS = "rounded-control";

/**
 * ONE FLOOR ON A PHONE: 44px. `md` is 36px tall and `sm` is 28px, which is a
 * comfortable cursor target and an uncomfortable thumb target. The `tap` class
 * (globals.css) is a min-height, so the desktop sizes above are untouched and
 * only a narrow or touch viewport grows the box. Ghost variants get it too: they
 * look unchanged, but a bare "Remove" beside a name is exactly the control that
 * has to be hittable while standing at a counter.
 */
const TAP = "tap";

/** The class string for a button-looking element that cannot be this component. */
export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", className = ""): string {
  const box = isGhost(variant) ? "" : `${RADIUS} ${PAD[size]}`;
  return `inline-flex items-center justify-center gap-1.5 ${box} ${TAP} ${TEXT[size]} ${VARIANT[variant]} ${className}`.replace(
    /\s+/g,
    " ",
  );
}

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  disabled = false,
  type = "button",
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children" | "disabled" | "type">) {
  const cls = buttonClass(variant, size, className);

  return (
    <button type={type} disabled={disabled} className={cls} {...rest}>
      {children}
    </button>
  );
}

