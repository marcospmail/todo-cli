import React from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

interface AddInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function AddInput({ value, onChange, onSubmit }: AddInputProps) {
  return (
    <Box>
      <Text color="green">New todo: </Text>
      <TextInput value={value} onChange={onChange} onSubmit={onSubmit} />
    </Box>
  );
}
