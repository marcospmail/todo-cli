import React from "react";
import { Text, Box } from "ink";
import type { Todo } from "../store/types.ts";
import { formatDueDate } from "../utils.ts";

interface TodoItemProps {
  todo: Todo;
  selected: boolean;
}

export function TodoItem({ todo, selected }: TodoItemProps) {
  const checkbox = todo.done ? "[x]" : "[ ]";
  const dueInfo = formatDueDate(todo.dueDate);

  return (
    <Box>
      <Text
        inverse={selected}
        dimColor={todo.done}
        strikethrough={todo.done}
      >
        {selected ? ">" : " "} {checkbox} {todo.title}
      </Text>
      {dueInfo && (
        <Text color={dueInfo.color} dimColor={todo.done}>
          {" "}
          ({dueInfo.label})
        </Text>
      )}
    </Box>
  );
}
