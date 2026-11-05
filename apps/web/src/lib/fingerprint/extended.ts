/**
 * Extended Fingerprint Collectors
 * Deterministic, permissionless signals that add entropy and cross-checks
 * without prompting the user: math engine signature, platform/vendor, touch
 * support, display geometry, timezone offset, and media-device kind counts.
 */

import type { ExtendedFingerprint } from '@browserscan/types';

/**
 * Math engine signature — floating-point results differ across JS engines and
 * platforms, giving a stable, high-entropy, deterministic signal.
 */
function mathSignature(): string {
  const ops = [
    Math.acos(0.123456789),
    Math.acosh(1.123456789),
    Math.asin(0.123456789),
    Math.asinh(1.123456789),
    Math.atan(0.123456789),
    Math.atanh(0.123456789),
    Math.cbrt(100),
    Math.cosh(10),
    Math.sin(1e10),
    Math.sinh(1),
    Math.tan(1e10),
    Math.tanh(0.123456789),
    Math.exp(1),
    Math.expm1(1),
    Math.log1p(10),
    Math.pow(Math.PI, -100),
  ];
  return ops.map((n) => n.toString()).join(',');
}

/**
 * Count available media-device kinds. Labels require permission, but kinds and
 * counts are exposed without prompting — a useful, non-invasive signal.
 */
async function getMediaDeviceCounts(): Promise<ExtendedFingerprint['media_devices'] | undefined> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return undefined;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const counts = { audioinput: 0, audiooutput: 0, videoinput: 0 };
    for (const d of devices) {
      if (d.kind === 'audioinput') counts.audioinput += 1;
      else if (d.kind === 'audiooutput') counts.audiooutput += 1;
      else if (d.kind === 'videoinput') counts.videoinput += 1;
    }
    return counts;
  } catch {
    return undefined;
  }
}

export async function getExtendedFingerprint(): Promise<ExtendedFingerprint> {
  const nav = navigator as Navigator & { vendor?: string };
  const media = await getMediaDeviceCounts();

  return {
    math_hash: hashString(mathSignature()),
    platform: nav.platform || undefined,
    vendor: nav.vendor || undefined,
    touch_points: typeof nav.maxTouchPoints === 'number' ? nav.maxTouchPoints : undefined,
    color_depth: typeof screen !== 'undefined' ? screen.colorDepth : undefined,
    pixel_ratio: typeof window !== 'undefined' ? window.devicePixelRatio : undefined,
    timezone_offset: new Date().getTimezoneOffset(),
    ...(media ? { media_devices: media } : {}),
  };
}

/**
 * Simple string hash (matches the pattern used by the other collectors).
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
