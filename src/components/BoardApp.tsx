"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { STATUSES, type Task, type Status, type Owner } from "@/lib/types";
import TaskDrawer from "@/components/TaskDrawer";
import BoardColumn from "@/components/BoardColumn";
import { addDays, isWithinInterval, parseISO } from "date-fns";

const owners: Owner[] = ["Mickey", "Shivani"];

export default function BoardApp() {
  const supabase = createSupabaseBrowserClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [ownerFilter, setOwnerFilter] = useState<"all" | Owner>("all");
  const [labelFilter, setLabelFilter] = useState<string>("");
  const [dueSoon, setDueSoon] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("status")
      .order("position");

    if (!error && data) {
      setTasks(data as Task[]);
      setErrorMessage(null);
    }
    if (error) {
      setErrorMessage(error.message);
    }
    setLoading(false);
  }, [supabase]);

  const verifyAllowedUser = useCallback(async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.email) return;

    const { data } = await supabase
      .from("allowed_users")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (!data) {
      setNotAllowed(true);
      await supabase.auth.signOut();
    }
  }, [supabase]);

  useEffect(() => {
    verifyAllowedUser();
    fetchTasks();

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, supabase, verifyAllowedUser]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (ownerFilter !== "all" && task.owner !== ownerFilter) return false;
      if (labelFilter && !task.labels?.some((label) => label.includes(labelFilter))) return false;
      if (dueSoon) {
        if (!task.due_date) return false;
        const due = parseISO(task.due_date);
        const now = new Date();
        if (!isWithinInterval(due, { start: now, end: addDays(now, 7) })) return false;
      }
      if (search) {
        const term = search.toLowerCase();
        const hay = `${task.title} ${task.notes ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [tasks, ownerFilter, labelFilter, dueSoon, search]);

  const columns = useMemo(() => {
    return STATUSES.map((status) => ({
      status,
      tasks: filteredTasks
        .filter((task) => task.status === status)
        .sort((a, b) => a.position - b.position)
    }));
  }, [filteredTasks]);

  const persistPositions = async (updated: Task[]) => {
    const updates = updated.map((task, index) => ({
      id: task.id,
      status: task.status,
      position: index
    }));

    await Promise.all(
      updates.map((update) =>
        supabase.from("tasks").update(update).eq("id", update.id)
      )
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((task) => task.id === overId);

    const targetStatus: Status = (overTask?.status ?? (overId as Status)) || activeTask.status;

    const nextTasks = [...tasks];

    const columnTasks = nextTasks
      .filter((task) => task.status === activeTask.status)
      .sort((a, b) => a.position - b.position);

    const targetTasks = nextTasks
      .filter((task) => task.status === targetStatus)
      .sort((a, b) => a.position - b.position);

    if (activeTask.status === targetStatus) {
      const oldIndex = columnTasks.findIndex((task) => task.id === activeId);
      const newIndex = columnTasks.findIndex((task) => task.id === overId);
      const reordered = arrayMove(columnTasks, oldIndex, newIndex).map((task, index) => ({
        ...task,
        position: index
      }));

      const merged = nextTasks.map((task) => {
        const replacement = reordered.find((item) => item.id === task.id);
        return replacement ?? task;
      });

      setTasks(merged);
      await persistPositions(reordered);
      return;
    }

    const activeIndex = columnTasks.findIndex((task) => task.id === activeId);
    const moving = columnTasks[activeIndex];

    const updatedActiveColumn = columnTasks
      .filter((task) => task.id !== activeId)
      .map((task, index) => ({ ...task, position: index }));

    const insertIndex = overTask
      ? targetTasks.findIndex((task) => task.id === overTask.id)
      : targetTasks.length;

    const updatedTargetColumn = [
      ...targetTasks.slice(0, insertIndex),
      { ...moving, status: targetStatus },
      ...targetTasks.slice(insertIndex)
    ].map((task, index) => ({ ...task, position: index }));

    const updated = nextTasks.map((task) => {
      const replacement = [...updatedActiveColumn, ...updatedTargetColumn].find(
        (item) => item.id === task.id
      );
      return replacement ?? task;
    });

    setTasks(updated);
    await Promise.all([
      persistPositions(updatedActiveColumn),
      persistPositions(updatedTargetColumn)
    ]);
  };

  const createTask = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: "New task",
        notes: "",
        owner: user?.email?.includes("shiv") ? "Shivani" : "Mickey",
        due_date: null,
        priority: "Medium",
        labels: [],
        checklist: [],
        status: "Backlog",
        position: tasks.filter((task) => task.status === "Backlog").length
      })
      .select()
      .single();

    if (!error && data) {
      setSelectedTask(data as Task);
      setShowDrawer(true);
    }
  };

  const handleSave = async (updated: Task) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        title: updated.title,
        notes: updated.notes,
        owner: updated.owner,
        due_date: updated.due_date,
        priority: updated.priority,
        labels: updated.labels,
        checklist: updated.checklist,
        status: updated.status,
        position: updated.position
      })
      .eq("id", updated.id);

    if (!error) {
      setSelectedTask(null);
      setShowDrawer(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setSelectedTask(null);
    setShowDrawer(false);
  };

  if (notAllowed) {
    return (
      <div className="rounded-2xl bg-white/80 p-6 text-sm text-ink/70 shadow-panel">
        Your email is not on the invite list. Please ask Mickey or Shivani to add
        you in the Supabase `allowed_users` table.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/60">Wedding</p>
          <h1 className="text-3xl font-semibold">Project Tracker</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={createTask}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-parchment"
          >
            New task
          </button>
        </div>
      </header>

      <section className="grid gap-3 rounded-3xl bg-white/70 p-4 shadow-panel md:grid-cols-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
          Owner
          <select
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value as "all" | Owner)}
            className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
          Label contains
          <input
            value={labelFilter}
            onChange={(event) => setLabelFilter(event.target.value)}
            placeholder="e.g. venue"
            className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="title or notes"
            className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/60">
          <input
            type="checkbox"
            checked={dueSoon}
            onChange={(event) => setDueSoon(event.target.checked)}
            className="h-4 w-4 rounded border-ink/20 text-accent"
          />
          Due in next 7 days
        </label>
      </section>

      <section className="flex gap-4 overflow-x-auto pb-4">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {columns.map((column) => (
            <BoardColumn
              key={column.status}
              status={column.status}
              tasks={column.tasks}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setShowDrawer(true);
              }}
            />
          ))}
        </DndContext>
      </section>

      {loading ? (
        <p className="text-sm text-ink/60">Loading tasks...</p>
      ) : null}
      {errorMessage ? (
        <p className="text-sm text-alert">
          {errorMessage}. This often means you are not signed in or your email
          is not on the allowed list.
        </p>
      ) : null}

      {selectedTask && (
        <TaskDrawer
          open={showDrawer}
          task={selectedTask}
          onClose={() => setShowDrawer(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
