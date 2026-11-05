/**
 * Server-side Fingerprint Service
 * TLS metadata, consistency checks, and protocol analysis
 */

import type {
  ConsistencyCheck,
  ConsistencySection,
  ProtocolFingerprints,
  HardwareFingerprint,
  SoftwareFingerprint
} from '@browserscan/types';

/**
 * Build an honest profile from metadata exposed at the Cloudflare edge.
 * This is deliberately not labeled JA3/JA4 because Workers do not expose the
 * raw ClientHello fields required to calculate those fingerprints.
 */
export function buildTlsEdgeProfile(
  tlsVersion: string,
  tlsCipher: string,
  httpProtocol: string
): string {
  return [tlsVersion, tlsCipher, httpProtocol]
    .map((value) => value || 'unknown')
    .join(' · ');
}

/**
 * Parse User-Agent for OS detection
 */
export function parseUserAgent(ua: string): {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
} {
  const result = {
    browser: 'Unknown',
    browserVersion: '',
    os: 'Unknown',
    osVersion: '',
    device: 'Desktop'
  };

  // Browser detection
  if (ua.includes('Firefox/')) {
    result.browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    result.browserVersion = match ? match[1] : '';
  } else if (ua.includes('Edg/')) {
    result.browser = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    result.browserVersion = match ? match[1] : '';
  } else if (ua.includes('Chrome/')) {
    result.browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    result.browserVersion = match ? match[1] : '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    result.browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    result.browserVersion = match ? match[1] : '';
  }

  // OS detection
  if (ua.includes('Windows NT 10')) {
    result.os = 'Windows';
    result.osVersion = '10/11';
  } else if (ua.includes('Windows NT 6.3')) {
    result.os = 'Windows';
    result.osVersion = '8.1';
  } else if (ua.includes('Windows NT 6.1')) {
    result.os = 'Windows';
    result.osVersion = '7';
  } else if (ua.includes('Mac OS X')) {
    result.os = 'macOS';
    const match = ua.match(/Mac OS X ([\d_]+)/);
    if (match) {
      result.osVersion = match[1].replace(/_/g, '.');
    }
  } else if (ua.includes('Linux')) {
    result.os = 'Linux';
    if (ua.includes('Android')) {
      result.os = 'Android';
      const match = ua.match(/Android ([\d.]+)/);
      result.osVersion = match ? match[1] : '';
      result.device = 'Mobile';
    }
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    result.os = 'iOS';
    result.device = ua.includes('iPad') ? 'Tablet' : 'Mobile';
    const match = ua.match(/OS ([\d_]+)/);
    if (match) {
      result.osVersion = match[1].replace(/_/g, '.');
    }
  }

  return result;
}

/**
 * Check timezone consistency between IP location and client timezone
 */
export function checkTimezoneConsistency(
  ipTimezone: string,
  clientTimezone: string
): ConsistencyCheck {
  if (!ipTimezone || !clientTimezone) {
    return {
      status: 'WARN',
      evidence: 'Unable to determine timezone consistency'
    };
  }

  // Some IP intel sources (IPBot) report a UTC offset ("-07:00") instead of an
  // IANA name — compare offsets in that case
  if (UTC_OFFSET_RE.test(ipTimezone)) {
    return checkTimezoneOffsetConsistency(ipTimezone, clientTimezone);
  }

  // Extract region from timezone (e.g., "America/New_York" -> "America")
  const ipRegion = ipTimezone.split('/')[0];
  const clientRegion = clientTimezone.split('/')[0];

  // Check for exact match first
  if (ipTimezone === clientTimezone) {
    return {
      status: 'PASS',
      evidence: `Timezone matches: ${clientTimezone}`
    };
  }

  // Check for same region (continent)
  if (ipRegion === clientRegion) {
    return {
      status: 'WARN',
      evidence: `Similar region but different timezone: IP (${ipTimezone}) vs System (${clientTimezone})`
    };
  }

  // Complete mismatch
  return {
    status: 'FAIL',
    evidence: `Timezone mismatch: IP (${ipTimezone}) != System (${clientTimezone})`
  };
}

const UTC_OFFSET_RE = /^[+-]\d{2}:\d{2}$/;

/**
 * Compare an IP-side UTC offset against the client's IANA timezone
 */
function checkTimezoneOffsetConsistency(
  ipOffset: string,
  clientTimezone: string
): ConsistencyCheck {
  const clientOffsetMin = getUtcOffsetMinutes(clientTimezone);
  if (clientOffsetMin === null) {
    return {
      status: 'WARN',
      evidence: 'Unable to determine timezone consistency'
    };
  }

  const ipOffsetMin = parseUtcOffsetMinutes(ipOffset);
  const diff = Math.abs(ipOffsetMin - clientOffsetMin);

  if (diff === 0) {
    return {
      status: 'PASS',
      evidence: `Timezone offset matches: UTC${ipOffset}`
    };
  }
  if (diff <= 60) {
    // Allow one hour of slack for DST boundaries
    return {
      status: 'WARN',
      evidence: `Timezone offset close but not equal: IP (UTC${ipOffset}) vs System (${clientTimezone})`
    };
  }
  return {
    status: 'FAIL',
    evidence: `Timezone mismatch: IP (UTC${ipOffset}) != System (${clientTimezone})`
  };
}

function parseUtcOffsetMinutes(offset: string): number {
  const sign = offset.startsWith('-') ? -1 : 1;
  const [hours, minutes] = offset.slice(1).split(':').map(Number);
  return sign * (hours * 60 + minutes);
}

/**
 * Resolve the current UTC offset of an IANA timezone in minutes
 */
function getUtcOffsetMinutes(timeZone: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset'
    }).formatToParts(new Date());
    const name = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    if (name === 'GMT') return 0;
    const match = name.match(/GMT([+-]\d{2}):(\d{2})/);
    if (!match) return null;
    const sign = match[1].startsWith('-') ? -1 : 1;
    return sign * (Math.abs(Number(match[1])) * 60 + Number(match[2]));
  } catch {
    return null;
  }
}

/**
 * Check language consistency between IP country and browser languages
 */
export function checkLanguageConsistency(
  ipCountryCode: string,
  languages: string[]
): ConsistencyCheck {
  if (!languages || languages.length === 0) {
    return {
      status: 'WARN',
      evidence: 'No language data available'
    };
  }

  // Map countries to expected primary languages
  const countryLanguages: Record<string, string[]> = {
    US: ['en'],
    GB: ['en'],
    CA: ['en', 'fr'],
    AU: ['en'],
    DE: ['de'],
    FR: ['fr'],
    JP: ['ja'],
    CN: ['zh'],
    TW: ['zh'],
    HK: ['zh', 'en'],
    KR: ['ko'],
    ES: ['es'],
    MX: ['es'],
    BR: ['pt'],
    PT: ['pt'],
    IT: ['it'],
    NL: ['nl'],
    RU: ['ru'],
    IN: ['en', 'hi'],
    AR: ['es'],
    SE: ['sv'],
    NO: ['no', 'nb'],
    DK: ['da'],
    FI: ['fi'],
    PL: ['pl'],
    TR: ['tr'],
    IL: ['he', 'en'],
    AE: ['ar', 'en'],
    SA: ['ar'],
    TH: ['th'],
    VN: ['vi'],
    ID: ['id'],
    MY: ['ms', 'en'],
    PH: ['en', 'fil'],
    UA: ['uk', 'ru'],
    CZ: ['cs'],
    GR: ['el']
  };

  const expectedLangs = countryLanguages[ipCountryCode] || [];
  const primaryLang = languages[0]?.split('-')[0]?.toLowerCase();

  // Check if primary language matches expected
  if (expectedLangs.includes(primaryLang)) {
    return {
      status: 'PASS',
      evidence: `Language (${primaryLang}) matches IP country (${ipCountryCode})`
    };
  }

  // Check if any language matches
  const hasMatch = languages.some(lang => {
    const code = lang.split('-')[0].toLowerCase();
    return expectedLangs.includes(code);
  });

  if (hasMatch) {
    return {
      status: 'WARN',
      evidence: `Primary language (${primaryLang}) differs from expected (${expectedLangs.join('/')}), but secondary match found`
    };
  }

  // English is international, so it's often a soft warning
  if (primaryLang === 'en' && ipCountryCode !== 'US' && ipCountryCode !== 'GB') {
    return {
      status: 'WARN',
      evidence: `IP country is ${ipCountryCode} but browser language is English`
    };
  }

  return {
    status: 'FAIL',
    evidence: `Language mismatch: IP (${ipCountryCode}) expects ${expectedLangs.join('/')}, got ${primaryLang}`
  };
}

/**
 * Check OS consistency between UA and WebGL renderer
 */
export function checkOsConsistency(
  uaOs: string,
  webglRenderer: string
): ConsistencyCheck {
  if (!uaOs || !webglRenderer) {
    return {
      status: 'WARN',
      evidence: 'Incomplete data for OS consistency check'
    };
  }

  const renderer = webglRenderer.toLowerCase();
  const os = uaOs.toLowerCase();

  // Check for Apple Silicon on non-macOS
  if (renderer.includes('apple') && !os.includes('mac') && !os.includes('ios')) {
    return {
      status: 'FAIL',
      evidence: `Apple GPU detected (${webglRenderer}) but OS is ${uaOs}`
    };
  }

  // Check for macOS with non-Apple GPU (possible, but uncommon)
  if (os.includes('mac') && !renderer.includes('apple') && !renderer.includes('amd') && !renderer.includes('nvidia') && !renderer.includes('intel')) {
    return {
      status: 'WARN',
      evidence: `macOS with unusual GPU: ${webglRenderer}`
    };
  }

  // Check for Android/iOS WebGL anomalies
  if ((os.includes('android') || os.includes('ios')) && renderer.includes('nvidia')) {
    return {
      status: 'FAIL',
      evidence: `Desktop GPU (NVIDIA) detected on mobile OS (${uaOs})`
    };
  }

  // Check for Windows with Apple GPU
  if (os.includes('windows') && renderer.includes('apple m')) {
    return {
      status: 'FAIL',
      evidence: `Apple Silicon detected on Windows`
    };
  }

  return {
    status: 'PASS',
    evidence: `OS (${uaOs}) matches WebGL renderer (${webglRenderer})`
  };
}

/**
 * Build complete consistency section
 */
export function buildConsistencySection(
  ipTimezone: string,
  clientTimezone: string,
  ipCountryCode: string,
  languages: string[],
  uaOs: string,
  webglRenderer: string
): ConsistencySection {
  return {
    timezone_check: checkTimezoneConsistency(ipTimezone, clientTimezone),
    language_check: checkLanguageConsistency(ipCountryCode, languages),
    os_check: checkOsConsistency(uaOs, webglRenderer)
  };
}

/**
 * Build protocol fingerprints section
 */
export function buildProtocolFingerprints(
  tlsVersion: string,
  tlsCipher: string,
  httpProtocol: string,
  tcpOsGuess?: string
): ProtocolFingerprints {
  return {
    tls_profile: buildTlsEdgeProfile(tlsVersion, tlsCipher, httpProtocol),
    tls_cipher: tlsCipher || 'unknown',
    tls_profile_method: 'cloudflare-edge-metadata',
    tls_version: tlsVersion || 'unknown',
    http_version: httpProtocol || 'HTTP/1.1',
    tcp_os_guess: tcpOsGuess || 'Unknown'
  };
}

/**
 * Generate a random scan ID
 */
export function generateScanId(): string {
  return crypto.randomUUID();
}
