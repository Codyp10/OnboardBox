export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[14px] border border-dashed border-ob-stone-300 bg-white/50 px-6 py-10 text-center">
      <h2 className="font-display text-xl text-ob-ink">{title}</h2>
      <p className="mt-2 text-sm text-ob-ink-muted">{description}</p>
    </div>
  );
}
