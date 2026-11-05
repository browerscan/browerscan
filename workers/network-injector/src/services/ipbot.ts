/**
 * IPBot IP Intelligence Service
 * Primary IP lookup via the IPBot v1 API (score-first schema) with KV caching,
 * light 429 backoff and rate-limit header observability.
 * Falls back to IPInfo (ip-intel.ts) when unconfigured or unavailable.
 */

import { lookupIpInfo, type IpIntelResult } from './ip-intel';

export interface IpBotEnv {
  IPBOT_API_ORIGIN?: string;
  IPBOT_API_KEY?: string;
}

export interface IpBotRateLimit {
  limit?: number;
  remaining?: number;
  reset?: number;
  tier?: string;
}

export interface IpBotIntelResult extends IpIntelResult {
  source: 'ipbot';
  riskBand?: string;
  verdict?: string;
  recommendedAction?: string;
  networkCategory?: string;
}

interface IpBotResponse {
  ip: string;
  location?: {
    country?: string;
    country_code?: string;
    region?: string;
    city?: string;
    postal?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  network?: {
    asn?: string;
    org?: string;
    category?: string;
    operator?: string;
  };
  score?: {
    ip_score: number;
    risk_score: number;
    band: string;
    verdict: string;
    recommended_action: string;
  };
  classification?: {
    usage_type?: string;
    is_datacenter?: boolean;
    is_proxy?: boolean;
    is_vpn?: boolean;
    is_tor?: boolean;
    is_cloud?: boolean;
    is_known_abuser?: boolean;
    proxy_type?: string;
    threat_level?: string;
  };
}

const CACHE_TTL_DEFAULT = 86400; // 24h for normal IPs
const CACHE_TTL_HIGH_RISK = 3600; // 1h so risky IPs re-check sooner
const HIGH_RISK_SCORE = 60;
const RETRY_AFTER_CAP_MS = 2000; // never block a request longer than this on 429

/**
 * Lookup IP using the IPBot v1 API: GET {IPBOT_API_ORIGIN}/v1/ip/{ip}
 * Returns null when IPBot is not configured or the lookup fails,
 * so callers can fall back to another source.
 */
export async function lookupIP(
  ip: string,
  env: IpBotEnv,
  cache?: KVNamespace
): Promise<IpBotIntelResult | null> {
  const origin = env.IPBOT_API_ORIGIN;
  const apiKey = env.IPBOT_API_KEY;
  if (!origin || !apiKey) {
    return null;
  }

  try {
    const cacheKey = `ipbot:${ip}`;
    if (cache) {
      try {
        const cached = await cache.get<IpBotIntelResult>(cacheKey, 'json');
        if (cached) {
          return cached;
        }
      } catch {
        console.warn('[ipbot] cache read failed; continuing with origin lookup');
      }
    }

    const response = await fetchWithBackoff(
      `${origin.replace(/\/$/, '')}/v1/ip/${encodeURIComponent(ip)}`,
      apiKey
    );
    if (!response) {
      return null;
    }

    recordRateLimit(response);

    if (!response.ok) {
      throw new Error(`IPBot API error: ${response.status}`);
    }

    const data: IpBotResponse = await response.json();
    const parsed = parseIpBotResponse(ip, data);

    if (cache) {
      const ttl = isHighRisk(data) ? CACHE_TTL_HIGH_RISK : CACHE_TTL_DEFAULT;
      try {
        await cache.put(cacheKey, JSON.stringify(parsed), { expirationTtl: ttl });
      } catch {
        console.warn('[ipbot] cache write failed');
      }
    }

    return parsed;
  } catch (error) {
    console.error('IPBot lookup failed:', error);
    return null;
  }
}

/**
 * Combined IP intelligence entrypoint: IPBot first, IPInfo fallback.
 */
export async function getIpIntel(
  ip: string,
  env: IpBotEnv & { IPINFO_TOKEN: string },
  cache?: KVNamespace
): Promise<IpIntelResult> {
  const ipbot = await lookupIP(ip, env, cache);
  if (ipbot) {
    return ipbot;
  }
  return lookupIpInfo(ip, env.IPINFO_TOKEN, cache);
}

/**
 * Fetch with a single light retry on 429, honoring small Retry-After values.
 * Returns null when rate-limited beyond what we are willing to wait for.
 */
async function fetchWithBackoff(url: string, apiKey: string): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey
      }
    });

    if (response.status !== 429) {
      return response;
    }

    recordRateLimit(response);
    const retryAfterMs = parseRetryAfterMs(response.headers.get('Retry-After'));
    if (attempt > 0 || retryAfterMs > RETRY_AFTER_CAP_MS) {
      console.warn(`IPBot rate limited (429), giving up: retry-after=${retryAfterMs}ms`);
      return null;
    }
    await new Promise((resolve) => setTimeout(resolve, retryAfterMs));
  }
  return null;
}

function parseRetryAfterMs(value: string | null): number {
  if (!value) return 1000;

  const seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const retryAt = Date.parse(value);
  if (!Number.isFinite(retryAt)) {
    return RETRY_AFTER_CAP_MS + 1;
  }
  return Math.max(0, retryAt - Date.now());
}

/**
 * Parse and log X-RateLimit-* headers for observability (visible in wrangler tail).
 */
function recordRateLimit(response: Response): IpBotRateLimit {
  const num = (name: string): number | undefined => {
    const value = response.headers.get(name);
    return value !== null && value !== '' ? Number(value) : undefined;
  };
  const rateLimit: IpBotRateLimit = {
    limit: num('X-RateLimit-Limit'),
    remaining: num('X-RateLimit-Remaining'),
    reset: num('X-RateLimit-Reset'),
    tier: response.headers.get('X-RateLimit-Tier') ?? undefined
  };

  if (rateLimit.limit !== undefined || rateLimit.tier !== undefined) {
    console.log('[ipbot] rate-limit', JSON.stringify(rateLimit));
    if (
      rateLimit.limit !== undefined &&
      rateLimit.remaining !== undefined &&
      rateLimit.remaining < rateLimit.limit * 0.1
    ) {
      console.warn(`[ipbot] rate-limit budget low: ${rateLimit.remaining}/${rateLimit.limit}`);
    }
  }
  return rateLimit;
}

/**
 * High-risk results get the short cache TTL so status changes surface faster.
 */
function isHighRisk(data: IpBotResponse): boolean {
  const score = data.score;
  if (
    score &&
    (score.risk_score >= HIGH_RISK_SCORE ||
      score.verdict === 'challenge' ||
      score.verdict === 'block' ||
      score.band === 'poor' ||
      score.band === 'danger')
  ) {
    return true;
  }
  const c = data.classification;
  return !!(c && (c.is_tor || c.is_known_abuser));
}

/**
 * Normalize the IPBot v1 response into the shared IpIntelResult shape.
 */
function parseIpBotResponse(ip: string, data: IpBotResponse): IpBotIntelResult {
  const location = data.location || {};
  const network = data.network || {};
  const score = data.score;
  const c = data.classification || {};

  const isProxy = c.is_proxy || false;
  const isVpn = c.is_vpn ?? c.proxy_type === 'vpn';
  const isTor = c.is_tor ?? c.proxy_type === 'tor';
  const isHosting =
    c.is_datacenter ||
    c.is_cloud ||
    network.category === 'datacenter' ||
    network.category === 'cloud' ||
    false;

  return {
    source: 'ipbot',
    ip: data.ip || ip,
    asn: network.asn || 'UNKNOWN',
    org: network.org || network.operator || 'Unknown',
    country: location.country || 'Unknown',
    countryCode: location.country_code || 'XX',
    region: location.region || 'Unknown',
    city: location.city || 'Unknown',
    timezone: location.timezone || 'UTC',
    isProxy,
    isVpn,
    isTor,
    isHosting,
    fraudScore: Math.min(99, score?.risk_score ?? 0),
    lat: location.latitude,
    lon: location.longitude,
    riskBand: score?.band,
    verdict: score?.verdict,
    recommendedAction: score?.recommended_action,
    networkCategory: network.category
  };
}
