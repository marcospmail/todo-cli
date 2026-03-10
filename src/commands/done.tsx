import React from "react";
import { render, Text, Box } from "ink";
import { toggleTodo } from "../store/todos.ts";

interface DoneProps {
  id: string;
}

function Done({ id }: DoneProps) {
  try {
    const todo = toggleTodo(id);
    const status = todo.done ? "done" : "not done";
    const color = todo.done ? "green" : "yellow";
    return (
      <Box>
        <Text color={color}>
          Marked "{todo.title}" as {status}
        </Text>
      </Box>
    );
  } catch (e) {
    return <Text color="red">{(e as Error).message}</Text>;
  }
}

export function runDone(id: string) {
  render(<Done id={id} />);
}
