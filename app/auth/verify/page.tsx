import { Suspense } from "react";

import { AuthVerifyClient } from "@/features/auth/components/AuthVerifyClient";

export const metadata = {
  title: "Signing in",
};

export default function AuthVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#fff9f2]" aria-hidden />}>
      <AuthVerifyClient />
    </Suspense>
  );
}
