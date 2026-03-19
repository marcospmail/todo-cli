import React from "react";
import { Text, Box } from "ink";
import type { Mode } from "../store/types.ts";

interface StatusBarProps {
  mode: Mode;
  showHelp: boolean;
}

export function StatusBar({ mode, showHelp }: StatusBarProps) {
  if (mode === "add") {
    return null;
  }
  if (mode === "edit") {
    return null;
  }
  if (mode === "delete") {
    return (
      <Box marginTop={1}>
        <Text color="red">Delete this todo? y/n</Text>
      </Box>
    );
  }
  if (mode === "files") {
    return (
      <Box marginTop={1}>
        <Text dimColor>j/k:move  enter:open  esc:back</Text>
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

  if (!showHelp) {
    return null;
  }

  return (
    <Box marginTop={1}>
      <Text dimColor>
        j/k:move  u/d:reorder  space:toggle  a:add  e:edit  c:copy  ^v:attach  f:files  x:delete  D:due  q:quit  ?:hide
      </Text>
    </Box>
  );
}
