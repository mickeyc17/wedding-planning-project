export type Owner = "Mickey" | "Shivani";
export type Status =
  | "Backlog"
  | "This Month"
  | "In Progress"
  | "Waiting"
  | "Done";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  owner: Owner | null;
  due_date: string | null;
  priority: Priority;
  labels: string[];
  checklist: ChecklistItem[];
  status: Status;
  position: number;
  created_at: string;
  updated_at: string;
};

export const STATUSES: Status[] = [
  "Backlog",
  "This Month",
  "In Progress",
  "Waiting",
  "Done"
];

export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
