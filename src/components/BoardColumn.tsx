"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Status, Task } from "@/lib/types";
import TaskCard from "@/components/TaskCard";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function BoardColumn({
  status,
  tasks,
  onTaskClick
}: {
  status: Status;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="min-w-[280px] flex-1 rounded-3xl bg-white/80 p-4 shadow-card"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink/70">
          {status}
        </h2>
        <span className="rounded-full bg-accentSoft px-2 py-1 text-xs font-semibold text-ink">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>
      {tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink/10 px-3 py-6 text-xs text-ink/50">
          Drag tasks here
        </div>
      )}
    </div>
  );
}
