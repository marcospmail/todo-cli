import React from "react";
import { render, Text, Box } from "ink";
import { loadTodos } from "../store/todos.ts";
import { formatDueDate } from "../utils.ts";

function List() {
  let todos;
  try {
    todos = loadTodos();
  } catch (e) {
    return <Text color="red">{(e as Error).message}</Text>;
  }

  if (todos.length === 0) {
    return <Text dimColor>No todos. Use `todo add` to create one.</Text>;
  }

  return (
    <Box flexDirection="column">
      {todos.map((todo) => {
        const checkbox = todo.done ? "[x]" : "[ ]";
        const dueInfo = formatDueDate(todo.dueDate);
        return (
          <Text key={todo.id} dimColor={todo.done}>
            <Text dimColor>{todo.id}</Text> {checkbox} {todo.title}
            {dueInfo && (
              <Text color={dueInfo.color}> ({dueInfo.label})</Text>
            )}
          </Text>
        );
      })}
    </Box>
  );
}

export function runList() {
  render(<List />);
}
