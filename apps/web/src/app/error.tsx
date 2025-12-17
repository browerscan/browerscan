'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-amber-500">Error</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Something went wrong</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          We hit an unexpected error while rendering this page. You can try again or head back to the main dashboard.
        </p>
        {error.digest && <p className="mt-2 text-xs text-zinc-500">Reference: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-100 transition hover:border-zinc-500"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
