import React, { useState, useCallback, useEffect, useRef } from "react";
import { render, useInput, useApp, Box, Text } from "ink";
import { basename, join } from "path";
import { existsSync } from "fs";
import {
  loadTodos,
  addTodo,
  toggleTodo,
  removeTodo,
  editTodo,
  setDueDate,
  moveTodo,
  attachFile,
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
  const [showHelp, setShowHelp] = useState(false);
  const [flash, setFlash] = useState("");
  const [fileCursor, setFileCursor] = useState(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  const showFlash = useCallback((msg: string) => {
    setFlash(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(""), 1500);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

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

    if (mode === "files") {
      const todo = todos[cursor];
      const files = todo?.files ?? [];
      if (key.escape || key.backspace) {
        setMode("normal");
        setFileCursor(0);
      } else if (input === "j" || key.downArrow) {
        setFileCursor((c) => Math.min(c + 1, files.length - 1));
      } else if (input === "k" || key.upArrow) {
        setFileCursor((c) => Math.max(c - 1, 0));
      } else if (key.return && todo && files[fileCursor]) {
        const filePath = join(process.cwd(), ".todos", "attachments", todo.id, files[fileCursor]!);
        Bun.spawnSync(["open", filePath]);
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

    if (input === "c" && todos.length > 0) {
      const todo = todos[cursor];
      if (todo) {
        Bun.spawnSync(["pbcopy"], { stdin: Buffer.from(todo.title) });
        showFlash("Copied!");
      }
    }

    if (key.ctrl && input === "v" && todos.length > 0) {
      const todo = todos[cursor];
      if (todo) {
        const result = Bun.spawnSync([
          "osascript",
          "-e",
          'set theFiles to the clipboard as «class furl»',
          "-e",
          'POSIX path of theFiles',
        ]);
        let filePath = result.stdout.toString().trim();
        if (!filePath) {
          filePath = Bun.spawnSync(["pbpaste"]).stdout.toString().trim();
        }
        if (filePath && existsSync(filePath)) {
          try {
            const name = attachFile(todo.id, filePath);
            refresh();
            showFlash(`Attached: ${name}`);
          } catch {
            showFlash("Failed to attach file");
          }
        } else {
          showFlash("No file in clipboard");
        }
      }
    }

    if (input === "f" && todos.length > 0) {
      const todo = todos[cursor];
      if (todo && todo.files.length > 0) {
        setMode("files");
        setFileCursor(0);
      } else {
        showFlash("No files attached");
      }
    }

    if (input === "?") {
      setShowHelp((v) => !v);
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

      {mode !== "add" && mode !== "edit" && mode !== "files" && (
        <TodoList todos={todos} cursor={cursor} />
      )}

      {mode === "files" && todos[cursor] && (
        <Box flexDirection="column">
          <Text bold>{todos[cursor]!.title}</Text>
          <Box flexDirection="column" marginTop={1}>
            {todos[cursor]!.files.map((file, i) => (
              <Text key={file} bold={i === fileCursor} color={i === fileCursor ? "cyan" : undefined}>
                {i === fileCursor ? ">" : " "} {file}
              </Text>
            ))}
          </Box>
        </Box>
      )}

      {flash && <Text color="green">{flash}</Text>}

      {mode === "add" && (
        <AddInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleAddSubmit}
        />
      )}

      {mode === "edit" && todos[cursor] && (
        <Box flexDirection="column">
          <Text dimColor>{todos[cursor]!.title}</Text>
          <EditInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleEditSubmit}
          />
        </Box>
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

      <StatusBar mode={mode} showHelp={showHelp} />
    </Box>
  );
}

export function runTui() {
  render(<App />);
}
