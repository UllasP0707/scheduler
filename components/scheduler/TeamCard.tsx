"use client";

import { useState, type FormEvent } from "react";
import type { WeekData } from "@/lib/schedule";
import { PlusIcon, UsersIcon, XIcon } from "../Icons";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Field, Textarea } from "../ui/Field";
import { Avatar, Pill } from "../ui/Pill";

/**
 * Who is working this week.
 *
 * The box takes SEVERAL names at once, split on commas or newlines, because the
 * way this list actually gets filled is somebody pasting a rota out of a message
 * - and typing eight names into eight fields is seven interactions nobody asked
 * for. Duplicates are dropped quietly, including duplicates inside one paste.
 *
 * The team belongs to the WEEK, not to the app: next week can be a different
 * five people, and last week keeps the five it had.
 *
 * The form sits BESIDE the list from `lg` up rather than above it. This panel is
 * the wide half of the planner (the page is one width across both screens), and
 * a 60-character textarea stretched across it with the names in a single column
 * underneath wastes the room it was given.
 */
export function TeamCard({
  week,
  hoursByPerson,
  onAdd,
  onRemove,
  className = "",
}: {
  week: WeekData;
  hoursByPerson: Record<string, number>;
  onAdd: (raw: string) => void;
  onRemove: (personId: string) => void;
  className?: string;
}) {
  const [nameInput, setNameInput] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onAdd(nameInput);
    setNameInput("");
  };

  return (
    <Card as="section" className={className}>
      <CardHeader
        title="Your team"
        subtitle="Everybody working this week."
        icon={<UsersIcon size={16} />}
        action={
          <Pill tone="muted" className="tnum">
            {week.people.length}
          </Pill>
        }
      />

      <div className="grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <form
          onSubmit={submit}
          className="flex flex-col gap-3 border-b border-border p-4 lg:border-b-0 lg:border-r"
        >
          <Field label="Add names" hint="Paste several names separated by commas.">
            <Textarea
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="e.g. Maya, Jordan, Sam"
              rows={3}
              className="resize-y"
            />
          </Field>
          <Button type="submit" variant="primary" className="w-full">
            <PlusIcon size={14} />
            Add to this week
          </Button>
        </form>

        {week.people.length === 0 ? (
          <div className="px-4">
            <EmptyState icon={<UsersIcon size={24} />} title="Your team will appear here">
              Add the people working this week to get started.
            </EmptyState>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {week.people.map((person) => (
              <li key={person.id} className="stagger-item flex items-center gap-2.5 px-4 py-2.5">
                <Avatar name={person.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{person.name}</span>
                  <span className="block text-xs tabular-nums text-muted">
                    {hoursByPerson[person.id] || 0} hrs scheduled
                  </span>
                </span>
                <Button
                  variant="ghost-danger"
                  size="sm"
                  onClick={() => onRemove(person.id)}
                  aria-label={`Remove ${person.name}`}
                  title={`Remove ${person.name}`}
                >
                  <XIcon size={14} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
