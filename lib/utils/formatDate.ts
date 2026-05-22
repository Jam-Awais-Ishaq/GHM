export function formatRelativeDay(date: Date, now = new Date()): string {
  const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const n0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((n0.getTime() - d0.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(date);
}

/** Listing add date → “Price verified today” / “1 day ago” / “N days ago”. */
export function formatPriceVerifiedLabel(
  createdAt: string | Date,
  now = new Date(),
): string {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Price verified today";

  const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const n0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.max(
    0,
    Math.round((n0.getTime() - d0.getTime()) / 86400000),
  );

  if (diffDays === 0) return "Price verified today";
  if (diffDays === 1) return "Price verified 1 day ago";
  return `Price verified ${diffDays} days ago`;
}
