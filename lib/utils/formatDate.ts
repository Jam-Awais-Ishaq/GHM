export function formatRelativeDay(date: Date, now = new Date()): string {
  const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const n0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((n0.getTime() - d0.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(date);
}
