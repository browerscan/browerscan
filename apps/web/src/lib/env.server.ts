import 'server-only';

const rawWorkerOrigin = process.env.WORKER_ORIGIN ?? process.env.NEXT_PUBLIC_WORKER_ORIGIN ?? '';
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://browserscan.org';

export const WORKER_ORIGIN = rawWorkerOrigin.replace(/\/$/, '');
export const PUBLIC_WORKER_ORIGIN = WORKER_ORIGIN; // Alias for compatibility
export const SITE_URL = rawSiteUrl.replace(/\/$/, '');
export const HAS_WORKER_ORIGIN = WORKER_ORIGIN.length > 0;
export const HAS_PUBLIC_WORKER = HAS_WORKER_ORIGIN; // Alias for compatibility
