import type { PropsWithChildren } from 'react';

interface PageShellProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </header>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {children}
      </section>
    </main>
  );
}
