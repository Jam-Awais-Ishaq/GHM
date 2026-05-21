const STORAGE_KEY = "ghm_access_token";

export function setBackendAccessToken(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function getBackendAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearBackendAccessToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
