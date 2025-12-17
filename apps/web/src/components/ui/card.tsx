import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean;
}

export function Card({ className, spotlight = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'card-spotlight rounded-2xl border border-zinc-800/80 bg-black/40 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5',
        !spotlight && 'card-spotlight:before:hidden',
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs uppercase tracking-[0.3em] text-zinc-500', className)} {...props} />
  );
}
