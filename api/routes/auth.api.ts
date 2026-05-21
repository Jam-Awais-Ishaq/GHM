import { apiRequest } from "@/api/inspector";
import type {
  AdminTestResponse,
  LogoutResponse,
  MagicLinkResponse,
  VerifyMagicLinkResponse,
} from "@/api/types/auth";

export async function sendMagicLink(email: string): Promise<MagicLinkResponse> {
  return apiRequest<MagicLinkResponse>("/api/auth/magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function verifyMagicLink(token: string): Promise<VerifyMagicLinkResponse> {
  return apiRequest<VerifyMagicLinkResponse>(
    `/api/auth/verify?token=${encodeURIComponent(token)}`,
    { credentials: "include" },
  );
}

export async function logoutBackend(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Uses admin-test to detect an existing backend session (ghm_token cookie on API origin).
 * 200 → admin; 403 → signed-in user; 401 → not signed in.
 */
export async function probeBackendSession(): Promise<{
  role: string;
  userId?: string;
} | null> {
  const url = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/admin-test`;

  let res: Response;
  try {
    res = await fetch(url, { credentials: "include" });
  } catch {
    // Backend offline, CORS blocked, or network error — treat as signed out.
    return null;
  }

  if (res.status === 401) return null;

  if (res.status === 403) {
    return { role: "USER" };
  }

  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as AdminTestResponse | null;
  if (!data?.success || !data.user) return null;

  return { role: data.user.role, userId: data.user.id };
}
