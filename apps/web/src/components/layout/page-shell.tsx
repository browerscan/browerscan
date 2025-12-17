import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan</p>
          <h1 className="text-3xl font-semibold text-zinc-50">{title}</h1>
          {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
