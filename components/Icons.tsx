/**
 * The icon set: one stroke weight, one corner treatment, no emoji.
 *
 * Every icon states its size TWICE, and the second one is the point. The
 * width/height ATTRIBUTES keep the glyph correct with no CSS at all, and the rem
 * style is what makes it follow the page on a big monitor, where app/globals.css
 * moves the root font size and a px attribute would be the one thing in a row of
 * text that did not grow with it. `size` stays px at a root of 16, which is what
 * every call site passes.
 */
export function iconBox(size: number) {
  const rem = `${size / 16}rem`;
  return { width: size, height: size, style: { width: rem, height: rem } };
}

export type IconProps = { size?: number; className?: string };

function Stroke({ size = 14, className, d }: IconProps & { d: string }) {
  return (
    <svg
      {...iconBox(size)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

/* ---- controls ------------------------------------------------------------ */

export const PlusIcon = (p: IconProps) => <Stroke {...p} d="M12 5v14M5 12h14" />;
export const CheckIcon = (p: IconProps) => <Stroke {...p} d="m5 12 5 5L20 7" />;
export const XIcon = (p: IconProps) => <Stroke {...p} d="M18 6 6 18M6 6l12 12" />;
export const ChevronLeftIcon = (p: IconProps) => <Stroke {...p} d="m15 5-7 7 7 7" />;
export const ChevronRightIcon = (p: IconProps) => <Stroke {...p} d="m9 5 7 7-7 7" />;
export const ArrowRightIcon = (p: IconProps) => <Stroke {...p} d="M4 12h15m-6-6 6 6-6 6" />;
/** "This control has values above and below the one you are looking at" - the
 *  affordance on every closed select in the app. */
export const CaretUpDownIcon = (p: IconProps) => <Stroke {...p} d="M8 9 12 5l4 4M8 15l4 4 4-4" />;
export const DownloadIcon = (p: IconProps) => (
  <Stroke {...p} d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
);
export const PrinterIcon = (p: IconProps) => (
  <Stroke {...p} d="M7 8V4h10v4M7 18H5a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M7 14h10v6H7v-6Z" />
);

/* ---- the week ------------------------------------------------------------ */

export const ClockIcon = (p: IconProps) => (
  <Stroke {...p} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3.5 2" />
);
export const UsersIcon = (p: IconProps) => (
  <Stroke {...p} d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20m9.5-16a3.5 3.5 0 0 1 0 6.8M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M13.5 8a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />
);
/** The first shift: the sun coming up over the counter. */
export const SunriseIcon = (p: IconProps) => (
  <Stroke {...p} d="M3 19h18M12 3v4M5.6 9.6 4.2 8.2m14.2 1.4 1.4-1.4M7.5 15a4.5 4.5 0 0 1 9 0h-9Z" />
);
/** The second shift: the sun going down on it. */
export const SunsetIcon = (p: IconProps) => (
  <Stroke {...p} d="M3 19h18M12 8V4M5.6 9.6 4.2 8.2m14.2 1.4 1.4-1.4M7.5 15a4.5 4.5 0 0 1 9 0h-9Z" />
);
/** The handover: the stretch where both shifts are on the floor together. */
export const OverlapIcon = (p: IconProps) => (
  <Stroke {...p} d="M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4" />
);
export const InfoIcon = (p: IconProps) => (
  <Stroke {...p} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-9v4.5M12 7.8h.01" />
);
