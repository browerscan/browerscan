/**
 * Server-side Fingerprint Service
 * JA3 calculation, consistency checks, and protocol analysis
 */

import type {
  ConsistencyCheck,
  ConsistencySection,
  ProtocolFingerprints,
  HardwareFingerprint,
  SoftwareFingerprint
} from '@browserscan/types';

/**
 * Calculate pseudo-JA3 fingerprint from available TLS data
 * Note: True JA3 requires raw TLS Client Hello which isn't available in Workers
 */
export function calculateJA3Proxy(
  tlsVersion: string,
  tlsCipher: string,
  httpProtocol: string
): string {
  // Create a consistent fingerprint from available data
  const fingerprint = `${tlsVersion}|${tlsCipher}|${httpProtocol}`;
  return hashString(fingerprint);
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
    tls_ja3: calculateJA3Proxy(tlsVersion, tlsCipher, httpProtocol),
    tls_version: tlsVersion || 'unknown',
    http_version: httpProtocol || 'HTTP/1.1',
    tcp_os_guess: tcpOsGuess || 'Unknown'
  };
}

/**
 * Simple string hash function (for fingerprint ID generation)
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to hex and pad
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex + hex.split('').reverse().join(''); // 16-char pseudo-hash
}

/**
 * Generate a random scan ID
 */
export function generateScanId(): string {
  return crypto.randomUUID();
}
