import { cookies } from "next/headers";

export const PENDING_EMAIL_COOKIE = "ghm_pending_email";
const MAX_AGE_SEC = 60 * 15;

export async function setPendingEmail(email: string): Promise<void> {
  const store = await cookies();
  store.set(PENDING_EMAIL_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function getPendingEmail(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(PENDING_EMAIL_COOKIE)?.value;
  return raw?.trim().toLowerCase() || null;
}

export async function clearPendingEmail(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_EMAIL_COOKIE);
}
