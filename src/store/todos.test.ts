import { describe, it, expect, beforeEach, afterAll } from "bun:test";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  loadTodos,
  saveTodos,
  addTodo,
  toggleTodo,
  removeTodo,
  editTodo,
  setDueDate,
} from "./todos.ts";

const originalCwd = process.cwd();
let tempDir: string;

function setupTempDir(): void {
  tempDir = mkdtempSync(join(tmpdir(), "todo-test-"));
  process.chdir(tempDir);
}

function cleanupTempDir(): void {
  process.chdir(originalCwd);
  rmSync(tempDir, { recursive: true, force: true });
}

afterAll(() => {
  process.chdir(originalCwd);
});

describe("loadTodos", () => {
  beforeEach(() => {
    setupTempDir();
  });

  it("returns empty array when no .todos.json exists", () => {
    const todos = loadTodos();
    expect(todos).toEqual([]);
    cleanupTempDir();
  });

  it("returns todos from existing file", () => {
    const store = {
      todos: [
        {
          id: "abc123",
          title: "Test todo",
          done: false,
          dueDate: null,
          createdAt: "2026-03-10T12:00:00.000Z",
        },
      ],
    };
    writeFileSync(join(tempDir, ".todos.json"), JSON.stringify(store));

    const todos = loadTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0]!.title).toBe("Test todo");
    cleanupTempDir();
  });

  it("throws on corrupt JSON", () => {
    writeFileSync(join(tempDir, ".todos.json"), "not valid json {{{");

    expect(() => loadTodos()).toThrow("Corrupt .todos.json file");
    cleanupTempDir();
  });

  it("returns undefined todos when JSON structure is wrong", () => {
    writeFileSync(join(tempDir, ".todos.json"), '"just a string"');

    // JSON.parse succeeds but .todos is undefined on a string
    const result = loadTodos();
    expect(result).toBeUndefined();
    cleanupTempDir();
  });
});

describe("saveTodos", () => {
  beforeEach(() => {
    setupTempDir();
  });

  it("creates .todos.json with correct structure", () => {
    const todos = [
      {
        id: "abc123",
        title: "Test",
        done: false,
        dueDate: null,
        createdAt: "2026-03-10T12:00:00.000Z",
      },
    ];
    saveTodos(todos);

    expect(existsSync(join(tempDir, ".todos.json"))).toBe(true);
    const todos2 = loadTodos();
    expect(todos2).toHaveLength(1);
    expect(todos2[0]!.title).toBe("Test");
    cleanupTempDir();
  });
});

describe("addTodo", () => {
  beforeEach(() => {
    setupTempDir();
  });

  it("creates .todos.json and returns new todo", () => {
    const todo = addTodo("Buy milk");

    expect(todo.title).toBe("Buy milk");
    expect(todo.done).toBe(false);
    expect(todo.dueDate).toBeNull();
    expect(todo.id).toBeString();
    expect(todo.id).toHaveLength(6);
    expect(todo.createdAt).toBeString();
    expect(existsSync(join(tempDir, ".todos.json"))).toBe(true);
    cleanupTempDir();
  });

  it("creates todo with due date", () => {
    const todo = addTodo("Doctor appointment", "2026-03-15");

    expect(todo.title).toBe("Doctor appointment");
    expect(todo.dueDate).toBe("2026-03-15");
    cleanupTempDir();
  });

  it("appends to existing todos", () => {
    addTodo("First");
    addTodo("Second");

    const todos = loadTodos();
    expect(todos).toHaveLength(2);
    expect(todos[0]!.title).toBe("First");
    expect(todos[1]!.title).toBe("Second");
    cleanupTempDir();
  });
});

describe("toggleTodo", () => {
  beforeEach(() => {
    setupTempDir();
  });

  it("toggles done from false to true", () => {
    const created = addTodo("Toggle me");
    const toggled = toggleTodo(created.id);

    expect(toggled.done).toBe(true);
    expect(toggled.id).toBe(created.id);
    cleanupTempDir();
  });

  it("toggles done from true back to false", () => {
    const created = addTodo("Toggle twice");
    toggleTodo(created.id);
    const toggled = toggleTodo(created.id);

    expect(toggled.done).toBe(false);
    cleanupTempDir();
  });

  it("finds todo by partial id prefix", () => {
    const created = addTodo("Partial match");
    const prefix = created.id.substring(0, 3);
    const toggled = toggleTodo(prefix);

    expect(toggled.done).toBe(true);
    expect(toggled.id).toBe(created.id);
    cleanupTempDir();
  });

  it("throws for non-existent id", () => {
    addTodo("Something");

    expect(() => toggleTodo("zzz999")).toThrow("Todo not found: zzz999");
    cleanupTempDir();
  });
});

describe("removeTodo", () => {
  beforeEach(() => {
    setupTempDir();
  });

  it("removes and returns the todo", () => {
    const created = addTodo("Remove me");
    const removed = removeTodo(created.id);

    expect(removed.id).toBe(created.id);
    expect(removed.title).toBe("Remove me");

    const todos = loadTodos();
    expect(todos).toHaveLength(0);
    cleanupTempDir();
  });

  it("removes only the targeted todo", () => {
    addTodo("Keep me");
    const toRemove = addTodo("Remove me");
    addTodo("Keep me too");

    removeTodo(toRemove.id);

    const todos = loadTodos();
    expect(todos).toHaveLength(2);
    expect(todos.find((t) => t.id === toRemove.id)).toBeUndefined();
    cleanupTempDir();
  });

  it("throws for non-existent id", () => {
    expect(() => removeTodo("nonexistent")).toThrow(
      "Todo not found: nonexistent"
    );
    cleanupTempDir();
  });
});

describe("editTodo", () => {
  beforeEach(() => {
    setupTempDir();
  });

  it("updates the title", () => {
    const created = addTodo("Old title");
    const edited = editTodo(created.id, "New title");

    expect(edited.id).toBe(created.id);
    expect(edited.title).toBe("New title");

    const todos = loadTodos();
    expect(todos[0]!.title).toBe("New title");
    cleanupTempDir();
  });

  it("preserves other fields when editing", () => {
    const created = addTodo("Original", "2026-04-01");
    toggleTodo(created.id);
    const edited = editTodo(created.id, "Updated");

    expect(edited.done).toBe(true);
    expect(edited.dueDate).toBe("2026-04-01");
    expect(edited.createdAt).toBe(created.createdAt);
    cleanupTempDir();
  });

  it("throws for non-existent id", () => {
    expect(() => editTodo("nope", "Whatever")).toThrow("Todo not found: nope");
    cleanupTempDir();
  });
});

describe("setDueDate", () => {
  beforeEach(() => {
    setupTempDir();
  });

  it("sets a due date", () => {
    const created = addTodo("Deadline task");
    const updated = setDueDate(created.id, "2026-12-25");

    expect(updated.dueDate).toBe("2026-12-25");

    const todos = loadTodos();
    expect(todos[0]!.dueDate).toBe("2026-12-25");
    cleanupTempDir();
  });

  it("clears a due date with null", () => {
    const created = addTodo("Has deadline", "2026-06-01");
    const updated = setDueDate(created.id, null);

    expect(updated.dueDate).toBeNull();
    cleanupTempDir();
  });

  it("changes an existing due date", () => {
    const created = addTodo("Reschedule", "2026-03-15");
    const updated = setDueDate(created.id, "2026-04-20");

    expect(updated.dueDate).toBe("2026-04-20");
    cleanupTempDir();
  });

  it("throws for non-existent id", () => {
    expect(() => setDueDate("missing", "2026-01-01")).toThrow(
      "Todo not found: missing"
    );
    cleanupTempDir();
  });
});
