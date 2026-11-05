import { describe, it, expect } from 'vitest';
import {
  buildProtocolFingerprints,
  checkTimezoneConsistency
} from '../src/services/fingerprint';

describe('checkTimezoneConsistency', () => {
  it('passes on exact IANA match', () => {
    const result = checkTimezoneConsistency('America/New_York', 'America/New_York');
    expect(result.status).toBe('PASS');
  });

  it('fails on IANA continent mismatch', () => {
    const result = checkTimezoneConsistency('Europe/Berlin', 'America/New_York');
    expect(result.status).toBe('FAIL');
  });

  it('passes when a UTC offset matches the client timezone offset', () => {
    // Compute the client zone's current offset so the test is DST-proof
    const name = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'longOffset'
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')!.value; // e.g. GMT-07:00
    const offset = name.replace('GMT', '');

    const result = checkTimezoneConsistency(offset, 'America/Los_Angeles');
    expect(result.status).toBe('PASS');
  });

  it('fails when a UTC offset is far from the client timezone offset', () => {
    const result = checkTimezoneConsistency('+08:00', 'America/New_York');
    expect(result.status).toBe('FAIL');
  });

  it('warns when the client timezone is invalid', () => {
    const result = checkTimezoneConsistency('-07:00', 'Not/AZone');
    expect(result.status).toBe('WARN');
  });
});

describe('buildProtocolFingerprints', () => {
  it('reports the actual edge cipher without claiming JA3 or JA4', () => {
    const protocols = buildProtocolFingerprints(
      'TLSv1.3',
      'AEAD-AES256-GCM-SHA384',
      'HTTP/3',
      'macOS'
    );

    expect(protocols).toMatchObject({
      tls_profile: 'TLSv1.3 · AEAD-AES256-GCM-SHA384 · HTTP/3',
      tls_cipher: 'AEAD-AES256-GCM-SHA384',
      tls_profile_method: 'cloudflare-edge-metadata'
    });
    expect(protocols.tls_ja3).toBeUndefined();
  });
});
