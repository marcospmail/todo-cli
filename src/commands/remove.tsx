import React from "react";
import { render, Text, Box } from "ink";
import { removeTodo } from "../store/todos.ts";

interface RemoveProps {
  id: string;
}

function Remove({ id }: RemoveProps) {
  try {
    const todo = removeTodo(id);
    return (
      <Box>
        <Text color="red">Removed: "{todo.title}"</Text>
      </Box>
    );
  } catch (e) {
    return <Text color="red">{(e as Error).message}</Text>;
  }
}

export function runRemove(id: string) {
  render(<Remove id={id} />);
}
