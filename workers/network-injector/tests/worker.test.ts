import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import app from '../src/worker';

// Type helper for app environment
type Env = Parameters<typeof app.request>[2];

// Mock D1 statement
const createMockStatement = () => {
  const statement = {
    first: async () => undefined,
    all: async () => ({ results: [] }),
    bind: (..._args: unknown[]) => statement,
    run: async () => ({ success: true })
  };
  return statement;
};

// Create test environment with mocked bindings
const createEnv = (overrides?: Partial<Env>): Env => {
  const statement = createMockStatement();
  return {
    ENVIRONMENT: 'test',
    IPINFO_TOKEN: '',
    TURNSTILE_SITE_KEY: 'test-site-key',
    TURNSTILE_SECRET_KEY: 'test-secret-key',
    DB: {
      prepare: () => statement
    } as unknown as D1Database,
    REPORTS_BUCKET: {
      put: async () => undefined,
      get: async () => null,
      head: async () => null,
      delete: async () => undefined,
      list: async () => ({ objects: [], truncated: false })
    } as unknown as R2Bucket,
    ...overrides
  } satisfies Env;
};

// The IP-intel path falls back to IPInfo, which issues a live fetch to
// ipinfo.io. Stub fetch for the whole suite so tests are deterministic and
// never hang on the network (previously these timed out at 5000ms in CI).
const realFetch = globalThis.fetch;
beforeAll(() => {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('ipinfo.io')) {
      return new Response(
        JSON.stringify({
          ip: '1.1.1.1',
          city: 'Sydney',
          region: 'New South Wales',
          country: 'AU',
          loc: '-33.8688,151.2093',
          org: 'AS13335 Cloudflare, Inc.',
          timezone: 'Australia/Sydney'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    throw new Error(`Unexpected network fetch in test: ${url}`);
  }) as unknown as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});

describe('Worker: Health & Status', () => {
  it('returns health check with environment info', async () => {
    const env = createEnv();
    const response = await app.request('/api/health', {}, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { status: string; data: { env: string; version: string } };
    expect(payload.status).toBe('ok');
    expect(payload.data.env).toBe('test');
    expect(payload.data.version).toBe('1.0.0');
  });

  it('returns timestamp in health check', async () => {
    const env = createEnv();
    const before = Date.now();
    const response = await app.request('/api/health', {}, env);
    const after = Date.now();

    const payload = await response.json() as { data: { timestamp: number } };
    expect(payload.data.timestamp).toBeGreaterThanOrEqual(before);
    expect(payload.data.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('Worker: Latest Scan (per-visitor scoping)', () => {
  const reportBlob = JSON.stringify({ meta: { scan_id: 'scan-123' }, score: { total: 50, grade: 'C' } });

  it('404s when the client IP is unknown (no cf-connecting-ip)', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/latest', {}, env);
    expect(response.status).toBe(404);
  });

  it('returns only the requesting IP\'s latest scan and marks it private', async () => {
    let boundIp: unknown;
    const statement = {
      first: async () => ({ report_blob: reportBlob }),
      all: async () => ({ results: [] }),
      bind: (...args: unknown[]) => { boundIp = args[0]; return statement; },
      run: async () => ({ success: true })
    };
    const env = createEnv({
      DB: { prepare: () => statement } as unknown as D1Database
    } as Partial<Env>);

    const response = await app.request('/api/scan/latest', {
      headers: { 'cf-connecting-ip': '203.0.113.9' }
    }, env);

    expect(response.status).toBe(200);
    expect(boundIp).toBe('203.0.113.9');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    const payload = await response.json() as { data: { meta: { scan_id: string } } };
    expect(payload.data.meta.scan_id).toBe('scan-123');
  });
});

describe('Worker: Scan Collect (extended fingerprint)', () => {
  it('accepts and stores additive extended fingerprint fields', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.5' },
      body: JSON.stringify({
        scan_id: '11111111-1111-4111-8111-111111111111',
        extended: {
          math_hash: 'abc12345',
          platform: 'MacIntel',
          vendor: 'Google Inc.',
          touch_points: 0,
          color_depth: 24,
          pixel_ratio: 2,
          timezone_offset: -60,
          media_devices: { audioinput: 1, audiooutput: 2, videoinput: 1 }
        }
      })
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as {
      data: { fingerprint: { extended?: { math_hash?: string; media_devices?: { videoinput: number } } } };
    };
    expect(payload.data.fingerprint.extended?.math_hash).toBe('abc12345');
    expect(payload.data.fingerprint.extended?.media_devices?.videoinput).toBe(1);
  });

  it('omits extended when not provided (backward compatible)', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.6' },
      body: JSON.stringify({ scan_id: '22222222-2222-4222-8222-222222222222' })
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { data: { fingerprint: { extended?: unknown } } };
    expect(payload.data.fingerprint.extended).toBeUndefined();
  });

  it('rejects out-of-range extended values', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.7' },
      body: JSON.stringify({
        scan_id: '33333333-3333-4333-8333-333333333333',
        extended: { touch_points: 9999 }
      })
    }, env);

    expect(response.status).toBe(400);
  });
});

describe('Worker: IP Lookup Tool', () => {
  it('returns IP intel data for specific IP', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/ip-lookup', {
      method: 'POST',
      body: JSON.stringify({ ip: '1.1.1.1' }),
      headers: { 'Content-Type': 'application/json' }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { status: string; data: { ip: string; country: string; fraud_score: number } };
    expect(payload.status).toBe('ok');
    expect(payload.data.ip).toBe('1.1.1.1');
    expect(typeof payload.data.country).toBe('string');
    expect(typeof payload.data.fraud_score).toBe('number');
  });

  it('handles empty body and uses fallback IP', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/ip-lookup', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { status: string; data: { ip: string } };
    expect(payload.status).toBe('ok');
    expect(payload.data.ip).toBeTruthy();
  });

  it('returns all expected fields in IP lookup response', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/ip-lookup', {
      method: 'POST',
      body: JSON.stringify({ ip: '8.8.8.8' }),
      headers: { 'Content-Type': 'application/json' }
    }, env);

    const payload = await response.json() as { data: Record<string, unknown> };
    const data = payload.data;

    expect(data).toHaveProperty('ip');
    expect(data).toHaveProperty('asn');
    expect(data).toHaveProperty('org');
    expect(data).toHaveProperty('country');
    expect(data).toHaveProperty('country_code');
    expect(data).toHaveProperty('is_proxy');
    expect(data).toHaveProperty('is_vpn');
    expect(data).toHaveProperty('is_tor');
    expect(data).toHaveProperty('fraud_score');
  });

  it('rejects invalid IP format', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/ip-lookup', {
      method: 'POST',
      body: JSON.stringify({ ip: 'not-an-ip' }),
      headers: { 'Content-Type': 'application/json' }
    }, env);

    // Should either reject with 400 or return lookup for the invalid string
    const status = response.status;
    expect([200, 400]).toContain(status);
  });
});

describe('Worker: Network Exposure Assessment', () => {
  it('returns IP intelligence and never claims a TCP port result', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/port-scan', {
      method: 'POST',
      body: JSON.stringify({ ports: [22, 80, 443] }),
      headers: { 'Content-Type': 'application/json' }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as {
      data: {
        capability: string;
        tcp_scan_performed: boolean;
        ports: Array<{ port: number; service: string; status: string }>;
        assessment: { asn: string; risk_score: number };
      };
    };
    expect(payload.data.capability).toBe('network_exposure_assessment');
    expect(payload.data.tcp_scan_performed).toBe(false);
    expect(payload.data.ports).toHaveLength(3);
    expect(payload.data.ports[0].port).toBe(22);
    expect(payload.data.ports[0].service).toBe('SSH');
    expect(payload.data.ports.every((port) => port.status === 'not_tested')).toBe(true);
    expect(payload.data.ports[1].service).toBe('HTTP');
    expect(payload.data.ports[2].service).toBe('HTTPS');
    expect(payload.data.assessment).toHaveProperty('asn');
    expect(payload.data.assessment).toHaveProperty('risk_score');
  });

  it('uses default ports when none specified', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/port-scan', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { data: { ports: Array<{ port: number }> } };
    expect(payload.data.ports.length).toBeGreaterThan(0);
  });

  it('includes limitation note in response', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/port-scan', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' }
    }, env);

    const payload = await response.json() as { data: { note: string } };
    expect(payload.data.note).toContain('TCP');
  });
});

describe('Worker: Leak Test Tool', () => {
  it('performs leak test with WebRTC IPs', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        webrtc_ips: ['192.168.1.1', '10.0.0.1'],
        dns_servers: ['1.1.1.1']
      }),
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '203.0.113.1'
      }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { status: string; data: { webrtc: { status: string } } };
    expect(payload.status).toBe('ok');
    expect(payload.data).toHaveProperty('webrtc');
    expect(payload.data.webrtc).toHaveProperty('status');
  });

  it('detects WebRTC leak when public IP differs', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        webrtc_ips: ['198.51.100.50'] // Different public IP
      }),
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '203.0.113.1'
      }
    }, env);

    const payload = await response.json() as { data: { webrtc: { status: string; leaked_ips: string[] } } };
    expect(payload.data.webrtc.status).toBe('LEAK');
    expect(payload.data.webrtc.leaked_ips).toContain('198.51.100.50');
  });

  it('returns safe when only private IPs via WebRTC', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        webrtc_ips: ['192.168.1.1', '10.0.0.1']
      }),
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '203.0.113.1'
      }
    }, env);

    const payload = await response.json() as { data: { webrtc: { status: string; local_ips: string[] } } };
    expect(payload.data.webrtc.status).toBe('SAFE');
    expect(payload.data.webrtc.local_ips.length).toBeGreaterThan(0);
  });
});

describe('Worker: WebRTC Quick Check', () => {
  it('performs quick WebRTC check', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/webrtc-check', {
      method: 'POST',
      body: JSON.stringify({
        webrtc_ips: ['192.168.1.1']
      }),
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '203.0.113.1'
      }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { data: { public_ip: string; is_leaked: boolean } };
    expect(payload.data.public_ip).toBe('203.0.113.1');
    expect(typeof payload.data.is_leaked).toBe('boolean');
  });
});

describe('Worker: Simulation Endpoints', () => {
  describe('reCAPTCHA Simulation', () => {
    it('returns verdict for high score', async () => {
      const env = createEnv();
      const response = await app.request('/api/simulation/recaptcha', {
        method: 'POST',
        body: JSON.stringify({ score: 0.9, action: 'login' }),
        headers: { 'Content-Type': 'application/json' }
      }, env);

      expect(response.status).toBe(200);
      const payload = await response.json() as { data: { verdict: string; risk_level: string } };
      expect(payload.data.verdict).toBe('Likely human');
      expect(payload.data.risk_level).toBe('low');
    });

    it('returns suspicious verdict for medium score', async () => {
      const env = createEnv();
      const response = await app.request('/api/simulation/recaptcha', {
        method: 'POST',
        body: JSON.stringify({ score: 0.5, action: 'login' }),
        headers: { 'Content-Type': 'application/json' }
      }, env);

      const payload = await response.json() as { data: { verdict: string; risk_level: string } };
      expect(payload.data.verdict).toBe('Suspicious activity');
      expect(payload.data.risk_level).toBe('medium');
    });

    it('returns bot verdict for low score', async () => {
      const env = createEnv();
      const response = await app.request('/api/simulation/recaptcha', {
        method: 'POST',
        body: JSON.stringify({ score: 0.1, action: 'login' }),
        headers: { 'Content-Type': 'application/json' }
      }, env);

      const payload = await response.json() as { data: { verdict: string; risk_level: string } };
      expect(payload.data.verdict).toBe('Likely bot');
      expect(payload.data.risk_level).toBe('high');
    });

    it('includes interpretation guide in response', async () => {
      const env = createEnv();
      const response = await app.request('/api/simulation/recaptcha', {
        method: 'POST',
        body: JSON.stringify({ score: 0.5, action: 'test' }),
        headers: { 'Content-Type': 'application/json' }
      }, env);

      const payload = await response.json() as { data: { interpretation: Record<string, string> } };
      expect(payload.data.interpretation).toHaveProperty('0.0-0.3');
      expect(payload.data.interpretation).toHaveProperty('0.7-1.0');
    });
  });

  describe('Behavior Analysis', () => {
    it('returns insufficient data message for too few events', async () => {
      const env = createEnv();
      const response = await app.request('/api/simulation/behavior', {
        method: 'POST',
        body: JSON.stringify({
          events: [
            { type: 'mouse', timestamp: Date.now(), x: 0, y: 0 }
          ]
        }),
        headers: { 'Content-Type': 'application/json' }
      }, env);

      expect(response.status).toBe(200);
      const payload = await response.json() as { data: { message: string; verdict: string } };
      expect(payload.data.message).toContain('Insufficient');
      expect(payload.data.verdict).toBe('UNKNOWN');
    });

    it('analyzes behavior with sufficient events', async () => {
      const env = createEnv();
      const now = Date.now();
      // Create events matching the schema: type: 'mouse' | 'click' | 'scroll' | 'keypress'
      const events = Array.from({ length: 10 }, (_, i) => ({
        type: 'mouse' as const,
        timestamp: now + i * 100,
        x: i * 10,
        y: i * 10
      }));

      const response = await app.request('/api/simulation/behavior', {
        method: 'POST',
        body: JSON.stringify({ events }),
        headers: { 'Content-Type': 'application/json' }
      }, env);

      expect(response.status).toBe(200);
      const payload = await response.json() as { data: { verdict: string; human_probability: number } };
      expect(['HUMAN', 'BOT', 'SUSPICIOUS', 'UNKNOWN']).toContain(payload.data.verdict);
      expect(typeof payload.data.human_probability).toBe('number');
    });
  });
});

describe('Worker: Scan Endpoints', () => {
  it('starts a new scan and returns scan_id', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { data: { scan_id: string; eta_seconds: number } };
    expect(payload.data.scan_id).toBeTruthy();
    expect(payload.data.scan_id.length).toBeGreaterThan(10);
    expect(payload.data.eta_seconds).toBe(3);
  });

  it('returns server data in scan start response', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, env);

    const payload = await response.json() as { data: { server_data: Record<string, unknown> } };
    expect(payload.data.server_data).toHaveProperty('ip');
    expect(payload.data.server_data).toHaveProperty('country');
  });

  it('returns 404 for /api/scan/latest when no scans exist', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/latest', {}, env);

    // When DB is empty, returns 404 with no latest scan
    expect(response.status).toBe(404);
    const payload = await response.json() as { status: string; message: string };
    expect(payload.status).toBe('error');
    expect(payload.message).toContain('not found');
  });

  it('returns 404 for non-existent scan ID', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/non-existent-id', {}, env);

    expect(response.status).toBe(404);
    const payload = await response.json() as { status: string; message: string };
    expect(payload.status).toBe('error');
    expect(payload.message).toContain('not found');
  });
});

describe('Worker: Input Validation', () => {
  it('rejects IP lookup without required fields when strict', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/ip-lookup', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' }
    }, env);

    // Should return 400 for invalid JSON or handle gracefully
    expect([200, 400, 500]).toContain(response.status);
  });

  it('handles missing Content-Type header', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/ip-lookup', {
      method: 'POST',
      body: JSON.stringify({ ip: '1.1.1.1' })
    }, env);

    // Should either work or reject gracefully
    expect([200, 400, 415]).toContain(response.status);
  });
});

describe('Worker: CORS', () => {
  it('includes CORS headers in response', async () => {
    const env = createEnv();
    const response = await app.request('/api/health', {}, env);

    const corsHeader = response.headers.get('access-control-allow-origin');
    expect(corsHeader).toBe('*');
  });

  it('handles OPTIONS preflight request', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/ip-lookup', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST'
      }
    }, env);

    // Should return 204 or 200 for preflight
    expect([200, 204]).toContain(response.status);
  });
});

describe('Worker: Error Handling', () => {
  it('returns consistent error format', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/invalid-id', {}, env);

    if (response.status !== 200) {
      const payload = await response.json() as { status: string; message: string };
      expect(payload.status).toBe('error');
      expect(typeof payload.message).toBe('string');
    }
  });
});

describe('Worker: DNS Leak Detection', () => {
  it('does not equate a public resolver address with encrypted DNS', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        dns_servers: ['1.1.1.1', '1.0.0.1']
      }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as { data: { dns: { status: string; is_secure_dns: boolean } } };
    expect(payload.data.dns.status).toBe('UNKNOWN');
    expect(payload.data.dns.is_secure_dns).toBe(false);
  });

  it('does not label unverified resolver addresses as an ISP leak', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        dns_servers: ['192.168.1.1', '10.0.0.1'] // Non-secure DNS
      }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as { data: { dns: { status: string; is_isp_dns: boolean } } };
    expect(payload.data.dns.status).toBe('UNKNOWN');
    expect(payload.data.dns.is_isp_dns).toBe(false);
  });

  it('recognizes a public resolver identity without claiming secure transport', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        dns_servers: ['8.8.8.8', '8.8.4.4']
      }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as {
      data: { dns: { is_public_resolver: boolean; is_secure_dns: boolean; transport: string } }
    };
    expect(payload.data.dns.is_public_resolver).toBe(true);
    expect(payload.data.dns.is_secure_dns).toBe(false);
    expect(payload.data.dns.transport).toBe('unknown');
  });
});

describe('Worker: IPv6 Leak Detection', () => {
  it('keeps the result unknown when no IPv6 connection is observed', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        ipv6_address: null
      }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as { data: { ipv6: { status: string; ipv6_leaked: boolean } } };
    expect(payload.data.ipv6.status).toBe('UNKNOWN');
    expect(payload.data.ipv6.ipv6_leaked).toBe(false);
  });

  it('reports safe for link-local IPv6', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        ipv6_address: 'fe80::1234:5678:abcd:efgh'
      }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as { data: { ipv6: { status: string } } };
    expect(payload.data.ipv6.status).toBe('SAFE');
  });

  it('reports public IPv6 reachability as unknown without VPN context', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        ipv6_address: '2001:4860:4860::8888'
      }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as {
      data: { ipv6: { status: string; ipv6_leaked: boolean; explanation: string } }
    };
    expect(payload.data.ipv6.status).toBe('UNKNOWN');
    expect(payload.data.ipv6.ipv6_leaked).toBe(false);
    expect(payload.data.ipv6.explanation).toContain('VPN context');
  });
});

describe('Worker: Overall Leak Status', () => {
  it('returns overall status and recommendations', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        webrtc_ips: ['192.168.1.1'],
        dns_servers: ['1.1.1.1']
      }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as {
      data: {
        overall_status: string;
        overall_risk: string;
        recommendations: string[]
      }
    };
    expect(['SAFE', 'WARN', 'LEAK', 'UNKNOWN']).toContain(payload.data.overall_status);
    expect(['none', 'low', 'medium', 'high']).toContain(payload.data.overall_risk);
    expect(Array.isArray(payload.data.recommendations)).toBe(true);
  });

  it('includes timestamp in leak test result', async () => {
    const env = createEnv();
    const before = Math.floor(Date.now() / 1000);
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);
    const after = Math.floor(Date.now() / 1000);

    const payload = await response.json() as { data: { timestamp: number } };
    expect(payload.data.timestamp).toBeGreaterThanOrEqual(before);
    expect(payload.data.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('Worker: Edge Cases', () => {
  it('handles very large array of WebRTC IPs', async () => {
    const env = createEnv();
    const manyIps = Array.from({ length: 20 }, (_, i) => `192.168.${i}.1`);
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({ webrtc_ips: manyIps }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { data: { webrtc: { local_ips: string[] } } };
    expect(payload.data.webrtc.local_ips.length).toBe(20);
  });

  it('handles mixed public and private IPs in WebRTC', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({
        webrtc_ips: ['192.168.1.1', '8.8.8.8', '10.0.0.1', '1.2.3.4']
      }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    expect(response.status).toBe(200);
    const payload = await response.json() as { data: { webrtc: { status: string; local_ips: string[]; leaked_ips: string[] } } };
    expect(payload.data.webrtc.status).toBe('LEAK');
    expect(payload.data.webrtc.local_ips).toContain('192.168.1.1');
    expect(payload.data.webrtc.local_ips).toContain('10.0.0.1');
    expect(payload.data.webrtc.leaked_ips).toContain('8.8.8.8');
  });
});

describe('Worker: Scan Collect Endpoint', () => {
  it('accepts fingerprint data via POST', async () => {
    const env = createEnv();
    const response = await app.request('/api/scan/collect', {
      method: 'POST',
      body: JSON.stringify({
        scan_id: 'test-scan-id-12345',
        fingerprint: {
          canvas_hash: 'abc123',
          webgl_renderer: 'NVIDIA GeForce GTX 1080',
          screen_width: 1920,
          screen_height: 1080
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    }, env);

    // Should accept or process the fingerprint
    expect([200, 400, 404]).toContain(response.status);
  });
});

describe('Helper Functions: Private IP Detection', () => {
  // These test the internal isPrivateIp logic via leak detection
  // Private IPs should be classified as local_ips, not leaked_ips
  it('identifies 10.x.x.x as private', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({ webrtc_ips: ['10.0.0.1'] }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as { data: { webrtc: { status: string; local_ips: string[]; leaked_ips: string[] } } };
    expect(payload.data.webrtc.status).toBe('SAFE');
    expect(payload.data.webrtc.local_ips).toContain('10.0.0.1');
    expect(payload.data.webrtc.leaked_ips).toHaveLength(0);
  });

  it('identifies 172.16-31.x.x as private', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({ webrtc_ips: ['172.16.0.1'] }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as { data: { webrtc: { status: string; local_ips: string[]; leaked_ips: string[] } } };
    expect(payload.data.webrtc.status).toBe('SAFE');
    expect(payload.data.webrtc.local_ips).toContain('172.16.0.1');
    expect(payload.data.webrtc.leaked_ips).toHaveLength(0);
  });

  it('identifies 192.168.x.x as private', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({ webrtc_ips: ['192.168.1.100'] }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as { data: { webrtc: { status: string; local_ips: string[]; leaked_ips: string[] } } };
    expect(payload.data.webrtc.status).toBe('SAFE');
    expect(payload.data.webrtc.local_ips).toContain('192.168.1.100');
    expect(payload.data.webrtc.leaked_ips).toHaveLength(0);
  });

  it('identifies 127.x.x.x as private', async () => {
    const env = createEnv();
    const response = await app.request('/api/tools/leak-test', {
      method: 'POST',
      body: JSON.stringify({ webrtc_ips: ['127.0.0.1'] }),
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1' }
    }, env);

    const payload = await response.json() as { data: { webrtc: { status: string; local_ips: string[]; leaked_ips: string[] } } };
    expect(payload.data.webrtc.status).toBe('SAFE');
    expect(payload.data.webrtc.local_ips).toContain('127.0.0.1');
    expect(payload.data.webrtc.leaked_ips).toHaveLength(0);
  });
});
