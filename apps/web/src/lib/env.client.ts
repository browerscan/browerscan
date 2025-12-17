export const PUBLIC_WORKER_ORIGIN = (process.env.NEXT_PUBLIC_WORKER_ORIGIN ?? '').replace(/\/$/, '');
export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://browserscan.org').replace(/\/$/, '');
export const PUBLIC_TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
export const HAS_PUBLIC_WORKER = PUBLIC_WORKER_ORIGIN.length > 0;
