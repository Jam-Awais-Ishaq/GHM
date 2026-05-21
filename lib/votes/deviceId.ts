const DEVICE_ID_KEY = "ghm-device-id";

/** Stable anonymous id for one-vote-per-device meal voting. */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return `dev-${Date.now()}`;
  }
}
