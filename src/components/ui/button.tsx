import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-ob-teal-900 text-white hover:bg-ob-teal-700 focus-visible:ring-ob-teal-700",
  secondary:
    "bg-white text-ob-ink border border-ob-stone-300 hover:bg-ob-stone-100",
  ghost: "bg-transparent text-ob-teal-700 hover:bg-ob-teal-100",
  danger: "bg-ob-danger text-white hover:opacity-90",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
