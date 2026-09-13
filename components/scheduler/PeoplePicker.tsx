"use client";

import type { Person } from "@/lib/schedule";
import { CaretUpDownIcon, CheckIcon, PlusIcon } from "../Icons";
import { Menu } from "../ui/Menu";

/**
 * Who is on one shift, on one day.
 *
 * THE CELL IS THE CONTROL. There is no separate "+ Add" sitting under the names:
 * an empty cell shows the add box, and a filled one shows the names, which are
 * themselves the way back into the list. Two controls doing one job is what it
 * looked like before, and the second one was pure furniture in a grid that has
 * fourteen of these cells on it.
 *
 * So the trigger has two faces, and only ever one at a time:
 *
 *   empty   a bordered "+ Add" box, muted, the size of a cell control
 *   filled  the assigned names as accent chips, with no box of their own
 *
 * THE PANEL HAS A CONTEXT LINE at the top, saying which shift and which hours
 * are being filled. A dropdown of seven names with nothing above them makes the
 * reader hold "this is Thursday's second shift" in their head while they read.
 *
 * MULTI-SELECT, so the panel stays open between ticks (`closeOnItemClick` off) -
 * the common case is putting two people on the same Friday evening, and a menu
 * that shut after the first would cost a second open for the second name. Each
 * row is a `menuitemcheckbox` and says its own state.
 *
 * ON PAPER IT IS NOT A CONTROL AT ALL. `data-people-picker` is what the print
 * block in app/globals.css strips the box off, leaving the names exactly where
 * they were in the cell; the caret goes with the rest of the chrome, and an
 * unfilled shift swaps its "+ Add" for the word "Unassigned" - a blank cell on a
 * rota reads as a printing fault rather than as nobody being on it.
 */
export function PeoplePicker({
  people,
  assigned,
  label,
  context,
  hoursByPerson,
  onToggle,
}: {
  people: readonly Person[];
  assigned: readonly string[];
  /** What this control is for, spoken: "First shift on Thursday". */
  label: string;
  /** The line above the list: "First shift · 10 AM to 4 PM". */
  context: string;
  /** Each person's weekly total, shown under their name so the reader can see
   *  who is already loaded before adding one more shift to them. */
  hoursByPerson: Record<string, number>;
  onToggle: (personId: string) => void;
}) {
  const chosen = people.filter((person) => assigned.includes(person.id));

  return (
    <div data-people-picker>
      <Menu
        ariaLabel={`${label} - choose who works it`}
        closeOnItemClick={false}
        panelClass="w-60 overflow-hidden p-0"
        buttonClass={
          chosen.length
            ? "tap block w-full cursor-pointer text-left transition hover:opacity-80"
            : "tap flex w-full cursor-pointer items-center justify-center gap-1 rounded-control border border-border bg-card px-2 py-1 text-xs font-medium text-muted transition hover:border-muted hover:text-ink"
        }
        button={
          chosen.length ? (
            <span className="flex flex-col gap-1">
              {chosen.map((person) => (
                <span
                  key={person.id}
                  className="truncate rounded-chip bg-accent-soft px-1.5 py-1 text-center text-xs font-medium text-accent-text"
                >
                  {person.name}
                </span>
              ))}
            </span>
          ) : (
            <>
              <span data-print-hide className="flex items-center gap-1">
                <PlusIcon size={11} />
                Add
                <CaretUpDownIcon size={11} />
              </span>
              <span data-print-only className="w-full text-center text-xs text-muted">Unassigned</span>
            </>
          )
        }
      >
        {() => (
          <>
            <div className="border-b border-border px-3 py-2 text-xs text-muted">{context}</div>
            {people.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted">Add your team on Build the week first.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto p-1.5">
                {people.map((person) => {
                  const on = assigned.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={on}
                      onClick={() => onToggle(person.id)}
                      className="tap flex w-full cursor-pointer items-center gap-2 rounded-chip px-2.5 py-1.5 text-left transition hover:bg-element"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{person.name}</span>
                        <span className="block text-xs tabular-nums text-muted">
                          {hoursByPerson[person.id] ?? 0} hrs this week
                        </span>
                      </span>
                      {on && (
                        <span className="shrink-0 text-accent-text">
                          <CheckIcon size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Menu>
    </div>
  );
}
