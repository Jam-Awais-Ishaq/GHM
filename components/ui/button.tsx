import * as React from "react";

import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "bg-[#FF5722] text-white hover:bg-[#e64a19]",
  outline: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
  ghost: "text-neutral-700 hover:bg-neutral-100",
} as const;

const sizes = {
  default: "h-11 px-5",
  sm: "h-9 px-4 text-xs",
  icon: "h-10 w-10 rounded-full p-0",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
