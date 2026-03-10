import React from "react";
import { render, Text, Box } from "ink";
import { editTodo } from "../store/todos.ts";

interface EditProps {
  id: string;
  title: string;
}

function EditCmd({ id, title }: EditProps) {
  try {
    const todo = editTodo(id, title);
    return (
      <Box>
        <Text color="green">Updated [{todo.id}]: "{todo.title}"</Text>
      </Box>
    );
  } catch (e) {
    return <Text color="red">{(e as Error).message}</Text>;
  }
}

export function runEdit(id: string, title: string) {
  render(<EditCmd id={id} title={title} />);
}
