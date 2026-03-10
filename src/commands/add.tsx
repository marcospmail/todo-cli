import React from "react";
import { render, Text, Box } from "ink";
import { addTodo } from "../store/todos.ts";

interface AddProps {
  title: string;
  due?: string;
}

function Add({ title, due }: AddProps) {
  const todo = addTodo(title, due ?? null);
  return (
    <Box flexDirection="column">
      <Text color="green">Added todo:</Text>
      <Text>
        <Text dimColor>[{todo.id}]</Text> {todo.title}
        {todo.dueDate && <Text color="yellow"> (due: {todo.dueDate})</Text>}
      </Text>
    </Box>
  );
}

export function runAdd(title: string, due?: string) {
  render(<Add title={title} due={due} />);
}
