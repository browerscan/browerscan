/**
 * IP Intelligence Service
 * Multi-source IP lookup with IPInfo as primary, with fallback logic
 */

export interface IpIntelResult {
  ip: string;
  asn: string;
  org: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  isProxy: boolean;
  isVpn: boolean;
  isTor: boolean;
  isHosting: boolean;
  fraudScore: number;
  lat?: number;
  lon?: number;
}

interface IpInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  bogon?: boolean;
  privacy?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
    hosting: boolean;
    service?: string;
  };
}

const DATACENTER_ASNS = [
  'AS13335', // Cloudflare
  'AS16509', // Amazon
  'AS15169', // Google
  'AS14618', // Amazon
  'AS396982', // Google
  'AS8075',  // Microsoft
  'AS20940', // Akamai
  'AS54113', // Fastly
  'AS16276', // OVH
  'AS24940', // Hetzner
  'AS14061', // DigitalOcean
  'AS63949', // Linode
  'AS40065', // Sharktech
  'AS36352', // ColoCrossing
  'AS46562', // Performive
];

const TOR_EXIT_ASNS = [
  'AS9009',  // M247
  'AS60729', // FlokiNET
  'AS197540', // netcup
];

/**
 * Lookup IP using IPInfo API
 */
export async function lookupIpInfo(
  ip: string,
  token: string,
  cache?: KVNamespace
): Promise<IpIntelResult> {
  try {
    const cacheKey = `ipinfo:${ip}`;
    if (cache) {
      const cached = await cache.get<IpIntelResult>(cacheKey, 'json');
      if (cached) {
        return cached;
      }
    }

    const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`, {
      headers: { Accept: 'application/json' },
      cf: { cacheEverything: true, cacheTtl: 900 } // Cache for 15 min
    });

    if (!response.ok) {
      throw new Error(`IPInfo API error: ${response.status}`);
    }

    const data: IpInfoResponse = await response.json();
    const parsed = parseIpInfoResponse(data);

    // Persist in KV cache for faster subsequent lookups
    if (cache) {
      cache.put(cacheKey, JSON.stringify(parsed), { expirationTtl: 900 }).catch(() => {
        // Non-fatal if KV write fails
      });
    }

    return parsed;
  } catch (error) {
    console.error('IPInfo lookup failed:', error);
    return createFallbackResult(ip);
  }
}

/**
 * Parse IPInfo response into standard format
 */
function parseIpInfoResponse(data: IpInfoResponse): IpIntelResult {
  const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
  const asnMatch = data.org?.match(/^(AS\d+)/);
  const asn = asnMatch ? asnMatch[1] : 'UNKNOWN';

  // Calculate fraud score based on various signals
  let fraudScore = 0;

  // Privacy API data (if available)
  const privacy = data.privacy;
  const isProxy = privacy?.proxy || false;
  const isVpn = privacy?.vpn || false;
  const isTor = privacy?.tor || false;
  const isHosting = privacy?.hosting || isDatacenterAsn(asn);

  // Fraud score calculation
  if (isTor) fraudScore += 90;
  else if (isProxy) fraudScore += 70;
  else if (isVpn) fraudScore += 30;
  else if (isHosting) fraudScore += 50;

  // Bogon IPs are suspicious
  if (data.bogon) fraudScore = 99;

  // Known Tor exit ASNs
  if (TOR_EXIT_ASNS.some(a => asn.startsWith(a))) {
    fraudScore = Math.max(fraudScore, 85);
  }

  return {
    ip: data.ip,
    asn,
    org: data.org || 'Unknown',
    country: getCountryName(data.country || 'XX'),
    countryCode: data.country || 'XX',
    region: data.region || 'Unknown',
    city: data.city || 'Unknown',
    timezone: data.timezone || 'UTC',
    isProxy,
    isVpn,
    isTor,
    isHosting,
    fraudScore: Math.min(99, fraudScore),
    lat,
    lon
  };
}

/**
 * Check if ASN belongs to a datacenter
 */
function isDatacenterAsn(asn: string): boolean {
  return DATACENTER_ASNS.some(dc => asn.startsWith(dc));
}

/**
 * Create fallback result when API fails
 */
function createFallbackResult(ip: string): IpIntelResult {
  return {
    ip,
    asn: 'UNKNOWN',
    org: 'Unknown',
    country: 'Unknown',
    countryCode: 'XX',
    region: 'Unknown',
    city: 'Unknown',
    timezone: 'UTC',
    isProxy: false,
    isVpn: false,
    isTor: false,
    isHosting: false,
    fraudScore: 0
  };
}

/**
 * Get country name from ISO code
 */
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    DE: 'Germany',
    FR: 'France',
    JP: 'Japan',
    CN: 'China',
    IN: 'India',
    BR: 'Brazil',
    RU: 'Russia',
    KR: 'South Korea',
    IT: 'Italy',
    ES: 'Spain',
    NL: 'Netherlands',
    SE: 'Sweden',
    NO: 'Norway',
    FI: 'Finland',
    DK: 'Denmark',
    CH: 'Switzerland',
    AT: 'Austria',
    BE: 'Belgium',
    PL: 'Poland',
    CZ: 'Czech Republic',
    PT: 'Portugal',
    IE: 'Ireland',
    NZ: 'New Zealand',
    SG: 'Singapore',
    HK: 'Hong Kong',
    TW: 'Taiwan',
    MX: 'Mexico',
    AR: 'Argentina',
    CL: 'Chile',
    CO: 'Colombia',
    ZA: 'South Africa',
    EG: 'Egypt',
    AE: 'United Arab Emirates',
    IL: 'Israel',
    TR: 'Turkey',
    TH: 'Thailand',
    VN: 'Vietnam',
    MY: 'Malaysia',
    ID: 'Indonesia',
    PH: 'Philippines',
    UA: 'Ukraine',
    RO: 'Romania',
    HU: 'Hungary',
    GR: 'Greece',
    XX: 'Unknown'
  };
  return countries[code] || code;
}

/**
 * Extract Cloudflare request metadata
 */
export function extractCloudflareData(request: Request): {
  ip: string;
  asn: string;
  country: string;
  colo: string;
  tlsVersion: string;
  tlsCipher: string;
  httpProtocol: string;
  city?: string;
  region?: string;
  timezone?: string;
  lat?: number;
  lon?: number;
} {
  const cf = (request as any).cf || {};

  return {
    ip: request.headers.get('cf-connecting-ip') || '0.0.0.0',
    asn: cf.asn ? `AS${cf.asn}` : 'UNKNOWN',
    country: cf.country || 'XX',
    colo: cf.colo || 'UNKNOWN',
    tlsVersion: cf.tlsVersion || 'unknown',
    tlsCipher: cf.tlsCipher || 'unknown',
    httpProtocol: cf.httpProtocol || 'HTTP/1.1',
    city: cf.city,
    region: cf.region,
    timezone: cf.timezone,
    lat: cf.latitude,
    lon: cf.longitude
  };
}
