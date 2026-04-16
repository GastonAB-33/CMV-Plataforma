interface PageTitleProps {
  title: string;
  description?: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
  return (
    <header className="mb-6 space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
    </header>
  );
}
