/**
 * THE WEEKWISE MARK: three rounded columns stepping up, lightest at the back.
 *
 * One shape repeated three times, which is the whole idea - a week is the same
 * unit over and over, and the thing being built is a stack of them. It is drawn
 * BACK TO FRONT, left to right: the tallest column is the brand orange at full
 * strength and the two behind it carry the same alpha as each other, so the pale
 * step between them is compositing rather than a third and fourth colour picked
 * by hand. That is the same construction the crate-manager mark uses, which is
 * why the two apps look related without being the same logo.
 *
 * `size` IS THE HEIGHT. Callers sit in a flex row and get the width for free.
 */
export const MARK_W = 116;
export const MARK_H = 112;

/** The two rear columns share one alpha, written as the byte it renders as. */
const ALPHA = 178 / 255;

/** One column: x, and how much of the full height it stands. */
const COLUMNS: ReadonlyArray<readonly [number, number, string, number]> = [
  [0, 56, "#FFB07A", ALPHA],
  [44, 84, "#F97128", ALPHA],
  [88, 112, "#FF5D00", 1],
];

export function Logo({
  size = 26,
  showWordmark = true,
  className = "",
}: {
  size?: number;
  /** The rail collapses to the mark alone; everywhere else says the name too. */
  showWordmark?: boolean;
  className?: string;
}) {
  const width = (size * MARK_W) / MARK_H;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox={`0 0 ${MARK_W} ${MARK_H}`}
        width={width}
        height={size}
        style={{ width: `${width / 16}rem`, height: `${size / 16}rem` }}
        role="img"
        aria-label="Weekwise"
        className="shrink-0"
      >
        {COLUMNS.map(([x, height, fill, opacity]) => (
          <rect
            key={x}
            x={x}
            y={MARK_H - height}
            width={28}
            height={height}
            rx={9}
            fill={fill}
            fillOpacity={opacity}
          />
        ))}
      </svg>
      {showWordmark && (
        <span className="text-[0.9375rem] font-semibold tracking-tight text-ink">Weekwise</span>
      )}
    </span>
  );
}
