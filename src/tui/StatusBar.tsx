import React from "react";
import { Text, Box } from "ink";
import type { Mode } from "../store/types.ts";

interface StatusBarProps {
  mode: Mode;
}

export function StatusBar({ mode }: StatusBarProps) {
  if (mode === "add") {
    return (
      <Box marginTop={1}>
        <Text dimColor>Type title, then Enter to save | Esc to cancel</Text>
      </Box>
    );
  }
  if (mode === "edit") {
    return (
      <Box marginTop={1}>
        <Text dimColor>Edit title, then Enter to save | Esc to cancel</Text>
      </Box>
    );
  }
  if (mode === "delete") {
    return (
      <Box marginTop={1}>
        <Text color="red">Delete this todo? y/n</Text>
      </Box>
    );
  }
  if (mode === "due") {
    return (
      <Box marginTop={1}>
        <Text dimColor>Enter date (YYYY-MM-DD) | Enter to save | Esc to cancel</Text>
      </Box>
    );
  }

  return (
    <Box marginTop={1}>
      <Text dimColor>
        j/k:move  u/d:reorder  space:toggle  a:add  e:edit  x:delete  D:due  q:quit
      </Text>
    </Box>
  );
}
