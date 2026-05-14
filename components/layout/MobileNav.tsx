"use client";

import {
  BarChart3,
  Flame,
  Heart,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

const ACCENT = "#FF5722";

const items = [
  { href: routes.map, label: "Map", Icon: MapPin },
  { href: routes.home, label: "Rankings", Icon: BarChart3 },
  { href: routes.hotDeals, label: "Hot deals", Icon: Flame },
  { href: routes.community, label: "Community", Icon: MessageCircle },
  { href: routes.saved, label: "Saved", Icon: Heart },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 flex pb-0 pt-0",
        "max-sm:justify-stretch max-sm:px-0",
        "sm:justify-center sm:pl-[max(0.75rem,env(safe-area-inset-left))] sm:pr-[max(0.75rem,env(safe-area-inset-right))]",
      )}
      aria-label="Primary"
    >
      <div
        className={cn(
          "flex w-full min-w-0 items-stretch justify-between gap-0.5",
          /* Mobile: full-width tab bar, icons only (labels via aria-label on links) */
          "max-sm:max-w-none max-sm:border-x-0 max-sm:border-b-0 max-sm:border-t max-sm:border-neutral-200/90 max-sm:bg-white max-sm:px-1 max-sm:pb-[env(safe-area-inset-bottom)] max-sm:pt-2 max-sm:shadow-[0_-6px_20px_rgba(0,0,0,0.06)] max-sm:backdrop-blur-none max-sm:pl-[max(0.25rem,env(safe-area-inset-left))] max-sm:pr-[max(0.25rem,env(safe-area-inset-right))]",
          /* sm+: unchanged floating pill */
          "sm:max-w-[min(28rem,calc(100vw-env(safe-area-inset-left)-env(safe-area-inset-right)-1.5rem))] sm:rounded-2xl sm:border sm:border-white/90 sm:bg-white/98 sm:px-2 sm:pb-[env(safe-area-inset-bottom)] sm:pt-2.5 sm:shadow-[0_10px_40px_rgba(0,0,0,0.12)] sm:backdrop-blur-md sm:gap-1",
        )}
      >
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl py-1 text-[10px] font-semibold transition-colors sm:py-1.5",
                active ? "" : "text-neutral-400 hover:text-neutral-600",
              )}
              style={active ? { color: ACCENT } : undefined}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-[22px] w-[22px]" aria-hidden strokeWidth={active ? 2.5 : 2} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
