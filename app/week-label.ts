/**
 * The week as a stepper reads it: "Sep 14 to Sep 20", and no year.
 *
 * A second formatter rather than an option on the one below, because the two
 * answer different questions. This one sits between a back and a forward arrow
 * where the only thing being asked is "which seven days am I looking at", and a
 * year printed there is four characters of noise on a control somebody clicks
 * twice a minute. The full label keeps the year: it is the heading of a sheet
 * that gets printed and pinned to a wall, where next March is a real ambiguity.
 *
 * Both ends always name their month, even inside one month, so the control never
 * changes width class between "Sep 14 - Sep 20" and "Aug 31 - Sep 6".
 */
export function formatWeekRange(value: string) {
  if (!value) return "Loading…";

  const start = new Date(`${value}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const short = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${short(start)} to ${short(end)}`;
}

/**
 * The full week, as the heading of a sheet that gets printed and pinned up.
 *
 * BOTH ENDS NAME THEIR MONTH, always. It used to collapse a same-month week to
 * "Aug 3-9, 2026", which saves four characters and makes the reader work out
 * that the 9 is an August 9 - on a rota, where the whole question is which days
 * these are, that is the wrong trade.
 *
 * THE RANGE IS THE WORD "to", not a dash of any kind. Dashes are banned from
 * this app's copy, and a range is the one place the ban is also a readability
 * win: an en dash between two dates is a hyphen at arm's length, and "Aug 3 to
 * Aug 9" cannot be misread at any distance.
 *
 * The year is said once at the end, unless the week straddles a new year, in
 * which case both ends carry their own.
 */
export function formatWeekLabel(value: string) {
  if (!value) return "Loading this week…";

  const start = new Date(`${value}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    return `${startMonth} ${startDay} to ${endMonth} ${endDay}, ${startYear}`;
  }

  return `${startMonth} ${startDay}, ${startYear} to ${endMonth} ${endDay}, ${endYear}`;
}
