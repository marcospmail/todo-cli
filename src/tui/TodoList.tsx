import React from "react";
import { Box, Text } from "ink";
import type { Todo } from "../store/types.ts";
import { TodoItem } from "./TodoItem.tsx";

interface TodoListProps {
  todos: Todo[];
  cursor: number;
}

export function TodoList({ todos, cursor }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <Box marginTop={1}>
        <Text dimColor>No todos yet.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {todos.map((todo, i) => (
        <TodoItem key={todo.id} todo={todo} selected={i === cursor} />
      ))}
    </Box>
  );
}
