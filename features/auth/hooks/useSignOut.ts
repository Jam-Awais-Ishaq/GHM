"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { logoutBackend } from "@/api/routes/auth.api";
import { routes } from "@/config/routes";
import { clearLocalSession } from "@/features/auth/actions/auth";
import { clearBackendAccessToken } from "@/lib/auth/backendAccessToken";

export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = useCallback(async () => {
    setPending(true);
    try {
      await logoutBackend().catch(() => undefined);
      clearBackendAccessToken();
      await clearLocalSession();
      router.push(routes.login);
      router.refresh();
    } finally {
      setPending(false);
    }
  }, [router]);

  return { signOut, pending };
}
