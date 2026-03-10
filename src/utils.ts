export function formatDueDate(
  dueDate: string | null
): { label: string; color: string } | null {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return { label: `overdue by ${abs}d`, color: "red" };
  }
  if (diffDays === 0) {
    return { label: "due today", color: "yellow" };
  }
  if (diffDays === 1) {
    return { label: "tomorrow", color: "yellow" };
  }
  return { label: `in ${diffDays}d`, color: "white" };
}
