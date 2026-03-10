import React from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

interface EditInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function EditInput({ value, onChange, onSubmit }: EditInputProps) {
  return (
    <Box>
      <Text color="yellow">Edit: </Text>
      <TextInput value={value} onChange={onChange} onSubmit={onSubmit} />
    </Box>
  );
}
