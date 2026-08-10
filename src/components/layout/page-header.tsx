export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="ob-fade-up">
        <h1 className="font-display text-3xl tracking-tight text-ob-ink sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-ob-ink-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="ob-fade-up-delay">{action}</div> : null}
    </div>
  );
}
