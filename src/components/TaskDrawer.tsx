"use client";

import { useEffect, useMemo, useState } from "react";
import type { Task, Owner, Priority, Status, ChecklistItem } from "@/lib/types";
import { PRIORITIES, STATUSES } from "@/lib/types";
import { format } from "date-fns";

const owners: Owner[] = ["Mickey", "Shivani"];

function normalizeChecklist(list: ChecklistItem[]) {
  return list.map((item) => ({
    ...item,
    label: item.label.trim()
  }));
}

export default function TaskDrawer({
  open,
  task,
  onClose,
  onSave,
  onDelete
}: {
  open: boolean;
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Task>({ ...task });

  const labelsInput = useMemo(() => draft.labels.join(", "), [draft.labels]);

  useEffect(() => {
    setDraft({ ...task });
  }, [task]);

  const update = (changes: Partial<Task>) => {
    setDraft((prev) => ({ ...prev, ...changes }));
  };

  const addChecklistItem = () => {
    update({
      checklist: [
        ...draft.checklist,
        { id: crypto.randomUUID(), label: "", completed: false }
      ]
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-ink/20 p-6">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-y-auto rounded-3xl bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Task details</p>
            <h2 className="text-2xl font-semibold">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
            Title
            <input
              value={draft.title}
              onChange={(event) => update({ title: event.target.value })}
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
            Notes
            <textarea
              value={draft.notes ?? ""}
              onChange={(event) => update({ notes: event.target.value })}
              rows={4}
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
              Owner
              <select
                value={draft.owner ?? ""}
                onChange={(event) => update({ owner: event.target.value as Owner })}
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
              Due date
              <input
                type="date"
                value={draft.due_date ?? ""}
                onChange={(event) => update({ due_date: event.target.value || null })}
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
              Priority
              <select
                value={draft.priority}
                onChange={(event) => update({ priority: event.target.value as Priority })}
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
              Status
              <select
                value={draft.status}
                onChange={(event) => update({ status: event.target.value as Status })}
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
            Labels (comma-separated)
            <input
              value={labelsInput}
              onChange={(event) =>
                update({
                  labels: event.target.value
                    .split(",")
                    .map((label) => label.trim())
                    .filter(Boolean)
                })
              }
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
            />
          </label>

          <div className="rounded-2xl border border-ink/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">Checklist</p>
              <button
                onClick={addChecklistItem}
                className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold"
              >
                Add item
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {draft.checklist.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(event) => {
                      const updated = [...draft.checklist];
                      updated[index] = { ...item, completed: event.target.checked };
                      update({ checklist: updated });
                    }}
                  />
                  <input
                    value={item.label}
                    onChange={(event) => {
                      const updated = [...draft.checklist];
                      updated[index] = { ...item, label: event.target.value };
                      update({ checklist: updated });
                    }}
                    className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() =>
                      update({
                        checklist: draft.checklist.filter((_, itemIndex) => itemIndex !== index)
                      })
                    }
                    className="text-xs text-ink/50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {draft.checklist.length === 0 && (
                <p className="text-xs text-ink/50">No checklist items yet.</p>
              )}
            </div>
          </div>

          <div className="grid gap-2 text-xs text-ink/50">
            <p>Created {format(new Date(task.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
            <p>Updated {format(new Date(task.updated_at), "MMM d, yyyy 'at' h:mm a")}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button
            onClick={() => onDelete(task.id)}
            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600"
          >
            Delete task
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave({ ...draft, checklist: normalizeChecklist(draft.checklist) })}
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-parchment"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
