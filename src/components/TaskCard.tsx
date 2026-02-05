"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/types";
import clsx from "clsx";

const priorityTone: Record<Task["priority"], string> = {
  Low: "bg-ink/10 text-ink",
  Medium: "bg-accentSoft text-ink",
  High: "bg-amber-200 text-amber-900",
  Critical: "bg-red-200 text-red-900"
};

export default function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "cursor-pointer rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm shadow-card transition",
        isDragging ? "opacity-60" : "hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{task.title}</h3>
          {task.notes ? (
            <p className="mt-1 max-h-9 overflow-hidden text-xs text-ink/60">{task.notes}</p>
          ) : null}
        </div>
        <span className={clsx("rounded-full px-2 py-1 text-[10px] font-semibold", priorityTone[task.priority])}>
          {task.priority}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ink/60">
        {task.owner ? <span>{task.owner}</span> : null}
        {task.due_date ? <span>Due {task.due_date}</span> : null}
        {task.labels?.length ? (
          <span className="rounded-full bg-ink/5 px-2 py-1">
            {task.labels.join(", ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
