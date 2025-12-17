import Link from 'next/link';
import type { ReactNode } from 'react';

const sections = [
  { href: '/report/network', label: 'Network' },
  { href: '/report/hardware', label: 'Hardware' },
  { href: '/report/software', label: 'Software' },
  { href: '/report/consistency', label: 'Consistency' }
];

export default function ReportLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-10">
      <aside className="sticky top-28 hidden h-fit min-w-48 flex-col gap-2 rounded-2xl border border-zinc-800/80 bg-black/40 p-4 md:flex">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Deep Dive</p>
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5">
            {section.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1 space-y-6">{children}</div>
    </div>
  );
}
