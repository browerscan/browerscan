import { describe, it, expect, vi, afterEach } from 'vitest';
import { lookupIP, getIpIntel } from '../src/services/ipbot';

const env = {
  IPBOT_API_ORIGIN: 'https://ipbot.example.test',
  IPBOT_API_KEY: 'ipb_test_key'
};

const sampleBody = {
  ip: '8.8.8.8',
  location: {
    country: 'United States of America',
    country_code: 'US',
    region: 'California',
    city: 'Mountain View',
    latitude: 37.386,
    longitude: -122.083,
    timezone: '-07:00'
  },
  network: {
    asn: 'AS15169',
    org: 'Google LLC',
    category: 'internet_infrastructure',
    operator: 'Google'
  },
  score: {
    ip_score: 88,
    risk_score: 12,
    band: 'excellent',
    verdict: 'allow',
    recommended_action: 'allow'
  },
  classification: {
    usage_type: 'public_dns_resolver',
    is_datacenter: false,
    is_proxy: false,
    confidence: 'high',
    threat_level: 'Low'
  }
};

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {}
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...init.headers }
  });
}

class FakeKV {
  store = new Map<string, { value: string; ttl?: number }>();
  async get(key: string) {
    const entry = this.store.get(key);
    return entry ? JSON.parse(entry.value) : null;
  }
  async put(key: string, value: string, opts?: { expirationTtl?: number }) {
    this.store.set(key, { value, ttl: opts?.expirationTtl });
  }
}

const asKV = (kv: FakeKV) => kv as unknown as KVNamespace;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('IPBot Service', () => {
  it('returns null when IPBot is not configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP('8.8.8.8', {});

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls /v1/ip/{ip} with X-API-Key and normalizes the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleBody));
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP('8.8.8.8', env);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://ipbot.example.test/v1/ip/8.8.8.8',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-API-Key': 'ipb_test_key' })
      })
    );
    expect(result).toMatchObject({
      source: 'ipbot',
      ip: '8.8.8.8',
      asn: 'AS15169',
      org: 'Google LLC',
      countryCode: 'US',
      isProxy: false,
      isVpn: false,
      isTor: false,
      isHosting: false,
      fraudScore: 12,
      riskBand: 'excellent',
      verdict: 'allow'
    });
  });

  it('records rate-limit headers without logging the API key', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleBody, {
      headers: {
        'X-RateLimit-Limit': '600',
        'X-RateLimit-Remaining': '599',
        'X-RateLimit-Tier': 'pro'
      }
    })));

    await lookupIP('8.8.8.8', env);

    expect(logSpy).toHaveBeenCalledWith(
      '[ipbot] rate-limit',
      expect.stringContaining('"tier":"pro"')
    );
    expect(logSpy.mock.calls.flat().join(' ')).not.toContain(env.IPBOT_API_KEY);
  });

  it('caches normal results for 24h and serves subsequent lookups from cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleBody));
    vi.stubGlobal('fetch', fetchMock);
    const kv = new FakeKV();

    await lookupIP('8.8.8.8', env, asKV(kv));
    const second = await lookupIP('8.8.8.8', env, asKV(kv));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(kv.store.get('ipbot:8.8.8.8')?.ttl).toBe(86400);
    expect(second?.asn).toBe('AS15169');
  });

  it('caches high-risk results for only 1h', async () => {
    const riskyBody = {
      ...sampleBody,
      ip: '203.0.113.7',
      score: {
        ip_score: 10,
        risk_score: 85,
        band: 'danger',
        verdict: 'block',
        recommended_action: 'block'
      },
      classification: { ...sampleBody.classification, is_proxy: true, proxy_type: 'vpn' }
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(riskyBody)));
    const kv = new FakeKV();

    const result = await lookupIP('203.0.113.7', env, asKV(kv));

    expect(kv.store.get('ipbot:203.0.113.7')?.ttl).toBe(3600);
    expect(result).toMatchObject({ isProxy: true, isVpn: true, fraudScore: 85 });
  });

  it('waits for the KV write before returning the lookup result', async () => {
    let releaseWrite: (() => void) | undefined;
    const writeGate = new Promise<void>((resolve) => {
      releaseWrite = resolve;
    });
    const kv = new FakeKV();
    const putSpy = vi.spyOn(kv, 'put').mockImplementation(async () => {
      await writeGate;
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleBody)));

    let resolved = false;
    const lookup = lookupIP('8.8.8.8', env, asKV(kv)).then((result) => {
      resolved = true;
      return result;
    });

    await vi.waitFor(() => expect(putSpy).toHaveBeenCalledOnce());
    expect(resolved).toBe(false);

    releaseWrite?.();
    await expect(lookup).resolves.toMatchObject({ asn: 'AS15169' });
  });

  it('continues to the IPBot origin when the cache read fails', async () => {
    const kv = new FakeKV();
    vi.spyOn(kv, 'get').mockRejectedValue(new Error('KV unavailable'));
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(sampleBody));
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP('8.8.8.8', env, asKV(kv));

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result?.asn).toBe('AS15169');
  });

  it('retries once after a small Retry-After on 429', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ error: 'Rate limit exceeded' }, { status: 429, headers: { 'Retry-After': '0' } })
      )
      .mockResolvedValueOnce(jsonResponse(sampleBody));
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP('8.8.8.8', env);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result?.asn).toBe('AS15169');
  });

  it('gives up without waiting when Retry-After exceeds the cap', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ error: 'Rate limit exceeded' }, { status: 429, headers: { 'Retry-After': '30' } })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP('8.8.8.8', env);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('supports an HTTP-date Retry-After value', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { error: 'Rate limit exceeded' },
          { status: 429, headers: { 'Retry-After': new Date(Date.now()).toUTCString() } }
        )
      )
      .mockResolvedValueOnce(jsonResponse(sampleBody));
    vi.stubGlobal('fetch', fetchMock);

    const result = await lookupIP('8.8.8.8', env);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result?.asn).toBe('AS15169');
  });

  it('getIpIntel falls back to IPInfo when IPBot is unavailable', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'boom' }, { status: 500 }))
      .mockResolvedValueOnce(
        jsonResponse({
          ip: '8.8.8.8',
          city: 'Mountain View',
          region: 'California',
          country: 'US',
          loc: '37.4,-122.0',
          org: 'AS15169 Google LLC',
          timezone: 'America/Los_Angeles'
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getIpIntel('8.8.8.8', { ...env, IPINFO_TOKEN: 'ipinfo_test' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain('ipinfo.io');
    expect(result.asn).toBe('AS15169');
    expect(result.timezone).toBe('America/Los_Angeles');
  });
});
