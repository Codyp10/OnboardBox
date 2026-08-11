import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

/** Interaction containers only — avoid decorative card stacking. */
export function Panel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-ob-stone-300/80 bg-white/80 p-5 shadow-[0_1px_0_rgba(28,25,22,0.04)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
