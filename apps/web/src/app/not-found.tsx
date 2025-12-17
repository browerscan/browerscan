import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">Page not found</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          The resource you are looking for either moved or never existed. Please head back to the dashboard or
          explore our tools and simulations.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-100 transition hover:border-zinc-500"
        >
          Go home
        </Link>
        <Link
          href="/tools"
          className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Browse tools
        </Link>
      </div>
    </div>
  );
}
