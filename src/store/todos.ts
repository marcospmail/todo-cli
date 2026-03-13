import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";
import type { Todo, TodoStore } from "./types.ts";

const TODO_FILE = ".todos.json";

function getTodoPath(): string {
  return join(process.cwd(), TODO_FILE);
}

export function loadTodos(): Todo[] {
  const path = getTodoPath();
  if (!existsSync(path)) {
    return [];
  }
  try {
    const raw = readFileSync(path, "utf-8");
    const data: TodoStore = JSON.parse(raw);
    return data.todos;
  } catch {
    throw new Error(
      `Corrupt ${TODO_FILE} file. Delete it and try again: rm ${path}`
    );
  }
}

export function saveTodos(todos: Todo[]): void {
  const undone = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);
  const store: TodoStore = { todos: [...undone, ...done] };
  writeFileSync(getTodoPath(), JSON.stringify(store, null, 2) + "\n");
}

export function moveTodo(id: string, direction: "up" | "down"): void {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id.startsWith(id));
  if (index === -1) throw new Error(`Todo not found: ${id}`);
  const todo = todos[index]!;
  if (todo.done) return;

  const undoneCount = todos.filter((t) => !t.done).length;

  if (direction === "up" && index > 0 && !todos[index - 1]!.done) {
    [todos[index], todos[index - 1]] = [todos[index - 1]!, todos[index]!];
  } else if (direction === "down" && index < undoneCount - 1) {
    [todos[index], todos[index + 1]] = [todos[index + 1]!, todos[index]!];
  }

  saveTodos(todos);
}

export function addTodo(title: string, dueDate: string | null = null): Todo {
  const todos = loadTodos();
  const todo: Todo = {
    id: nanoid(6),
    title,
    done: false,
    dueDate,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  saveTodos(todos);
  return todo;
}

export function toggleTodo(id: string): Todo {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id.startsWith(id));
  if (!todo) {
    throw new Error(`Todo not found: ${id}`);
  }
  todo.done = !todo.done;
  saveTodos(todos);
  return todo;
}

export function removeTodo(id: string): Todo {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id.startsWith(id));
  if (index === -1) {
    throw new Error(`Todo not found: ${id}`);
  }
  const [removed] = todos.splice(index, 1);
  saveTodos(todos);
  return removed!;
}

export function editTodo(id: string, title: string): Todo {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id.startsWith(id));
  if (!todo) {
    throw new Error(`Todo not found: ${id}`);
  }
  todo.title = title;
  saveTodos(todos);
  return todo;
}

export function setDueDate(id: string, dueDate: string | null): Todo {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id.startsWith(id));
  if (!todo) {
    throw new Error(`Todo not found: ${id}`);
  }
  todo.dueDate = dueDate;
  saveTodos(todos);
  return todo;
}
