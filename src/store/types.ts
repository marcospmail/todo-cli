export interface Todo {
  id: string;
  title: string;
  done: boolean;
  dueDate: string | null;
  createdAt: string;
}

export interface TodoStore {
  todos: Todo[];
}

export type Mode = "normal" | "add" | "edit" | "delete" | "due";

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00");
  if (isNaN(date.getTime())) return false;
  const [y, m, d] = value.split("-").map(Number);
  return date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d;
}
