import { cn } from '@/lib/utils';

type Tone = 'safe' | 'risk' | 'warn' | 'info';

const toneClasses: Record<Tone, string> = {
  safe: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]',
  risk: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]',
  warn: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
  info: 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]'
};

const toneLabels: Record<Tone, string> = {
  safe: 'Safe',
  risk: 'Risk detected',
  warn: 'Warning',
  info: 'Information'
};

interface StatusDotProps {
  tone?: Tone;
  animated?: boolean;
  label?: string;
}

export function StatusDot({ tone = 'info', animated = true, label }: StatusDotProps) {
  const ariaLabel = label || toneLabels[tone];

  return (
    <span
      className="relative flex h-3 w-3 items-center justify-center"
      role="status"
      aria-label={ariaLabel}
    >
      {animated ? (
        <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', toneClasses[tone])} aria-hidden="true" />
      ) : null}
      <span className={cn('relative inline-flex h-3 w-3 rounded-full', toneClasses[tone])} aria-hidden="true" />
    </span>
  );
}
