"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { getNameInitials } from "@/lib/auth/initials";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

type ProfileLinkProps = {
  className?: string;
  roundedClassName?: string;
  /** When set, signed-in users open profile in a sidebar instead of navigating away. */
  onOpenProfile?: () => void;
};

const profileButtonClass =
  "flex h-9 w-9 shrink-0 items-center justify-center bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200/90 max-sm:h-[2.375rem] max-sm:w-[2.375rem] sm:h-10 sm:w-10";

function ProfileInitials({ name }: { name: string }) {
  const initials = getNameInitials(name);
  if (!initials) {
    return <User className="h-5 w-5" strokeWidth={2} aria-hidden />;
  }

  return (
    <span className="text-[11px] font-bold uppercase tracking-tight text-neutral-800 sm:text-xs">
      {initials}
    </span>
  );
}

export function ProfileLink({
  className,
  roundedClassName,
  onOpenProfile,
}: ProfileLinkProps) {
  const { session } = useAuth();

  const loginHref = `${routes.login}?returnTo=${encodeURIComponent(routes.map)}`;
  const avatar = session ? <ProfileInitials name={session.nickname} /> : null;

  if (!session) {
    return (
      <Link
        href={loginHref}
        className={cn(profileButtonClass, roundedClassName, className)}
        aria-label="Sign in"
      >
        <User className="h-5 w-5" strokeWidth={2} />
      </Link>
    );
  }

  if (onOpenProfile) {
    return (
      <button
        type="button"
        onClick={onOpenProfile}
        className={cn(profileButtonClass, roundedClassName, className)}
        aria-label="Open profile"
      >
        {avatar}
      </button>
    );
  }

  return (
    <Link
      href={routes.profile}
      className={cn(profileButtonClass, roundedClassName, className)}
      aria-label="Account"
    >
      {avatar}
    </Link>
  );
}
