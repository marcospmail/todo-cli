import React, { useState, useCallback } from "react";
import { render, useInput, useApp, Box, Text } from "ink";
import { basename } from "path";
import {
  loadTodos,
  addTodo,
  toggleTodo,
  removeTodo,
  editTodo,
  setDueDate,
  moveTodo,
} from "../store/todos.ts";
import type { Mode } from "../store/types.ts";
import { isValidDate } from "../store/types.ts";
import { TodoList } from "./TodoList.tsx";
import { AddInput } from "./AddInput.tsx";
import { EditInput } from "./EditInput.tsx";
import { StatusBar } from "./StatusBar.tsx";

function App() {
  const { exit } = useApp();
  const [todos, setTodos] = useState(() => {
    try {
      return loadTodos();
    } catch {
      return [];
    }
  });
  const [cursor, setCursor] = useState(0);
  const [mode, setMode] = useState<Mode>("normal");
  const [inputValue, setInputValue] = useState("");

  const refresh = useCallback(() => {
    try {
      setTodos(loadTodos());
    } catch {
      setTodos([]);
    }
  }, []);

  const clampCursor = useCallback(
    (c: number, length: number) => Math.max(0, Math.min(c, length - 1)),
    []
  );

  useInput((input, key) => {
    if (mode === "add") {
      if (key.escape) {
        setMode("normal");
        setInputValue("");
      }
      return;
    }

    if (mode === "edit") {
      if (key.escape) {
        setMode("normal");
        setInputValue("");
      }
      return;
    }

    if (mode === "due") {
      if (key.escape) {
        setMode("normal");
        setInputValue("");
        setError("");
      }
      return;
    }

    if (mode === "delete") {
      if (input === "y" || input === "Y" || key.return) {
        const todo = todos[cursor];
        if (todo) {
          removeTodo(todo.id);
          refresh();
          setCursor((c) => clampCursor(c, Math.max(1, todos.length - 1)));
        }
        setMode("normal");
      } else {
        setMode("normal");
      }
      return;
    }

    // Normal mode
    if (input === "q" || key.escape) {
      exit();
      return;
    }
    if (key.ctrl && input === "c") {
      exit();
      return;
    }

    if (input === "j" || key.downArrow) {
      setCursor((c) => clampCursor(c + 1, todos.length));
    }
    if (input === "k" || key.upArrow) {
      setCursor((c) => clampCursor(c - 1, todos.length));
    }

    if ((input === " " || key.return) && todos.length > 0) {
      const todo = todos[cursor];
      if (todo) {
        toggleTodo(todo.id);
        const updated = loadTodos();
        setTodos(updated);
        setCursor((c) => clampCursor(c, updated.length));
      }
    }

    if (input === "a") {
      setMode("add");
      setInputValue("");
    }

    if (input === "e" && todos.length > 0) {
      const todo = todos[cursor];
      if (todo) {
        setMode("edit");
        setInputValue(todo.title);
      }
    }

    if (input === "u" && todos.length > 0) {
      const todo = todos[cursor];
      if (todo && !todo.done) {
        moveTodo(todo.id, "up");
        refresh();
        setCursor((c) => clampCursor(c - 1, todos.length));
      }
    }

    if (input === "d" && todos.length > 0) {
      const todo = todos[cursor];
      const undoneCount = todos.filter((t) => !t.done).length;
      if (todo && !todo.done && cursor < undoneCount - 1) {
        moveTodo(todo.id, "down");
        refresh();
        setCursor((c) => clampCursor(c + 1, todos.length));
      }
    }

    if (input === "x" && todos.length > 0) {
      setMode("delete");
    }

    if (input === "D" && todos.length > 0) {
      const todo = todos[cursor];
      if (todo) {
        setMode("due");
        setInputValue(todo.dueDate ?? "");
      }
    }
  });

  const handleAddSubmit = useCallback(
    (value: string) => {
      if (value.trim()) {
        addTodo(value.trim());
        const updated = loadTodos();
        setTodos(updated);
        const undoneCount = updated.filter((t) => !t.done).length;
        setCursor(undoneCount - 1);
      }
      setMode("normal");
      setInputValue("");
    },
    [refresh]
  );

  const handleEditSubmit = useCallback(
    (value: string) => {
      const todo = todos[cursor];
      if (todo && value.trim()) {
        editTodo(todo.id, value.trim());
        refresh();
      }
      setMode("normal");
      setInputValue("");
    },
    [todos, cursor, refresh]
  );

  const [error, setError] = useState("");

  const handleDueSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed && !isValidDate(trimmed)) {
        setError("Invalid date. Use YYYY-MM-DD format.");
        return;
      }
      const todo = todos[cursor];
      if (todo) {
        setDueDate(todo.id, trimmed || null);
        refresh();
      }
      setError("");
      setMode("normal");
      setInputValue("");
    },
    [todos, cursor, refresh]
  );

  const dirName = basename(process.cwd());

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          [{dirName}] Todos
        </Text>
        <Text dimColor> ({todos.length})</Text>
      </Box>

      <TodoList todos={todos} cursor={cursor} />

      {mode === "add" && (
        <AddInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleAddSubmit}
        />
      )}

      {mode === "edit" && (
        <EditInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleEditSubmit}
        />
      )}

      {mode === "due" && (
        <Box flexDirection="column">
          <Box>
            <Text color="blue">Due date: </Text>
            <EditInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleDueSubmit}
            />
          </Box>
          {error && <Text color="red">{error}</Text>}
        </Box>
      )}

      <StatusBar mode={mode} />
    </Box>
  );
}

export function runTui() {
  render(<App />);
}
