import { cn } from "@/lib/utils/cn";

const TONES: Record<string, string> = {
  success: "bg-ob-teal-100 text-ob-success",
  warning: "bg-[#F4E4CF] text-ob-warning",
  danger: "bg-[#F3DADA] text-ob-danger",
  neutral: "bg-ob-stone-100 text-ob-ink-muted",
  info: "bg-ob-teal-100 text-ob-teal-900",
};

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[10px] px-2.5 py-1 text-xs font-semibold tracking-wide",
        TONES[tone],
      )}
    >
      {label}
    </span>
  );
}
