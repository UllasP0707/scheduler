import type { ReactNode } from "react";

/**
 * The table shape every list in this app renders: a flat card that clips its
 * corners, a horizontal scroller inside it for narrow screens, a tinted header
 * strip, hairline row rules and no rule after the last row.
 *
 * Header cells are uppercase and muted. The sheet the week prints on is built
 * from these too, which is why the wrapper is optional: on paper the card, its
 * border and its scroller are all in the way.
 */
export const tableHeadCellClass = "px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted";
export const tableCellClass = "px-3 py-2.5";
const TH = tableHeadCellClass;
const TD = tableCellClass;

export function Table({
  children,
  /** A caption for the table as a whole. Read out first, never shown. */
  caption,
  /**
   * LAY THE COLUMNS OUT FROM THEIR DECLARED WIDTHS, not from what is in them.
   *
   * A table sizes itself to its content by default, so the same table renders at
   * different column widths on two different weeks - the columns a reader scans
   * down shift under the cursor when the data changes. With this on, the caller
   * puts a width on the columns it wants pinned and the rest share what is left.
   */
  fixed = false,
  /** Skip the card frame: the printed sheet is already the card. */
  bare = false,
  className = "",
}: {
  children: ReactNode;
  caption?: string;
  fixed?: boolean;
  bare?: boolean;
  className?: string;
}) {
  const table = (
    // `relative` so the scroller is the containing block for anything absolutely
    // positioned inside it - a header's sr-only label, for one. Without it those
    // boxes resolve against the initial containing block and extend the
    // DOCUMENT's scroll width, which is a sideways wobble on a phone with
    // nothing visible to explain it.
    <div className="relative overflow-x-auto">
      <table className={fixed ? "w-full min-w-[58rem] table-fixed text-sm" : "w-full text-sm"}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
  if (bare) return <div className={className}>{table}</div>;
  return <div className={`overflow-hidden rounded-xl border border-border bg-card ${className}`}>{table}</div>;
}

/** The header strip. Takes its own rows, so a table can have two of them. */
export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-element/40">{children}</thead>;
}

/**
 * One header cell: uppercase, semibold, muted.
 *
 * A caller that wants a QUIET line inside a header puts it in a child span with
 * its own classes rather than appending `font-normal normal-case` here.
 * Same-element Tailwind conflicts resolve by STYLESHEET order, not class order -
 * `.font-normal` is emitted before `.font-semibold`, so an override on this
 * element loses and the cell silently stays bold.
 */
export function Th({
  children,
  align,
  scope = "col",
  rowSpan,
  colSpan,
  className = "",
}: {
  children: ReactNode;
  align?: "right" | "center";
  scope?: "col" | "row";
  rowSpan?: number;
  colSpan?: number;
  className?: string;
}) {
  const alignment = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th scope={scope} rowSpan={rowSpan} colSpan={colSpan} className={`${TH} ${alignment} ${className}`}>
      {children}
    </th>
  );
}

/** A body row. Keeps the staggered entrance every list in the app uses. */
/**
 * A body row.
 *
 * NO ENTRANCE ANIMATION HERE, and that is a fix rather than a preference.
 *
 * It used to carry `stagger-item`, which fades a row in from `translateY(6px)`.
 * The table sits in a `overflow-x-auto` box, and CSS does not let a box scroll
 * on one axis and stay visible on the other - asking for `overflow-x: auto`
 * silently makes `overflow-y: auto` as well. So for the ~300ms of the entrance,
 * the rows hung 6px below the box, a VERTICAL scrollbar appeared, that scrollbar
 * ate its own width out of the content box, the table no longer fitted, and a
 * HORIZONTAL scrollbar appeared under the last column. Both vanished when the
 * animation landed, which is the flicker after Sunday.
 *
 * The other lists in this app keep their stagger: none of them is inside a
 * scroller. If a table ever wants one, the animation has to be opacity-only.
 */
export function Tr({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`border-b border-border last:border-0 ${className}`}>{children}</tr>;
}

/** A body cell. `as="th"` for the cell that names its row (the leading column). */
export function Td({
  children,
  align,
  as = "td",
  colSpan,
  className = "",
}: {
  children?: ReactNode;
  align?: "right" | "center";
  as?: "td" | "th";
  colSpan?: number;
  className?: string;
}) {
  const alignment = align === "right" ? "text-right" : align === "center" ? "text-center" : "";
  const cls = `${TD} ${alignment} ${className}`;
  if (as === "th") {
    return (
      <th scope="row" colSpan={colSpan} className={`${cls} text-left font-normal`}>
        {children}
      </th>
    );
  }
  return (
    <td colSpan={colSpan} className={cls}>
      {children}
    </td>
  );
}
