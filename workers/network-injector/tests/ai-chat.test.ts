import { describe, it, expect } from 'vitest';
import { buildScanContext } from '../src/services/ai-chat';
import type { ScanReport } from '@browserscan/types';

describe('AI Chat Service', () => {
  it('builds compact scan context with risk flags', () => {
    const mockReport: Partial<ScanReport> = {
      meta: { scan_id: 'test-123', timestamp: 123, version: '1.0' },
      score: { total: 75, grade: 'B', verdict: 'Good', deductions: [] },
      network: {
        risk: { is_proxy: true, is_vpn: false, is_tor: false, fraud_score: 60 },
        protocols: { tls_ja3: '', tls_version: '', http_version: '', tcp_os_guess: '' },
        leaks: {
          webrtc: { status: 'SAFE', ip: '', region: '' },
          dns: { status: 'SAFE', servers: [] },
        },
      },
      fingerprint: {
        hardware: {
          canvas_hash: 'abc123def456',
          webgl_vendor: 'NVIDIA',
          webgl_renderer: 'GeForce GTX',
          screen: '1920x1080',
          concurrency: 8,
          memory: 8,
        },
        software: {
          fonts_hash: 'xyz789',
          timezone_name: 'America/New_York',
          languages: ['en-US', 'en'],
        },
      },
      consistency: {
        os_check: { status: 'PASS', evidence: '' },
        timezone_check: { status: 'PASS', evidence: '' },
        language_check: { status: 'PASS', evidence: '' },
      },
    };

    const context = buildScanContext(mockReport as ScanReport);

    expect(context.scan_id).toBe('test-123');
    expect(context.trust_score).toBe(75);
    expect(context.grade).toBe('B');
    expect(context.verdict).toBe('Good');
    expect(context.risk_flags).toContain('Proxy detected');
    expect(context.risk_flags).toContain('High fraud score: 60');
  });

  it('detects WebRTC leaks', () => {
    const mockReport: Partial<ScanReport> = {
      meta: { scan_id: 'test-456', timestamp: 456, version: '1.0' },
      score: { total: 80, grade: 'B', verdict: 'Good', deductions: [] },
      network: {
        risk: { is_proxy: false, is_vpn: false, is_tor: false, fraud_score: 10 },
        protocols: { tls_ja3: '', tls_version: '', http_version: '', tcp_os_guess: '' },
        leaks: {
          webrtc: { status: 'LEAK', ip: '1.2.3.4', region: 'US' },
          dns: { status: 'SAFE', servers: [] },
        },
      },
      fingerprint: {
        hardware: {
          canvas_hash: 'test',
          webgl_vendor: 'Intel',
          webgl_renderer: 'HD Graphics',
          screen: '1920x1080',
          concurrency: 4,
          memory: 8,
        },
        software: {
          fonts_hash: 'test',
          timezone_name: 'UTC',
          languages: ['en'],
        },
      },
      consistency: {
        os_check: { status: 'PASS', evidence: '' },
        timezone_check: { status: 'PASS', evidence: '' },
        language_check: { status: 'PASS', evidence: '' },
      },
    };

    const context = buildScanContext(mockReport as ScanReport);

    expect(context.leak_status).toContain('WebRTC leak: 1.2.3.4');
  });

  it('identifies consistency issues', () => {
    const mockReport: Partial<ScanReport> = {
      meta: { scan_id: 'test-789', timestamp: 789, version: '1.0' },
      score: { total: 65, grade: 'C', verdict: 'Fair', deductions: [] },
      network: {
        risk: { is_proxy: false, is_vpn: false, is_tor: false, fraud_score: 0 },
        protocols: { tls_ja3: '', tls_version: '', http_version: '', tcp_os_guess: '' },
        leaks: {
          webrtc: { status: 'SAFE', ip: '', region: '' },
          dns: { status: 'SAFE', servers: [] },
        },
      },
      fingerprint: {
        hardware: {
          canvas_hash: 'test',
          webgl_vendor: 'Test',
          webgl_renderer: 'Test',
          screen: '1920x1080',
          concurrency: 4,
          memory: 8,
        },
        software: {
          fonts_hash: 'test',
          timezone_name: 'America/New_York',
          languages: ['en-US'],
        },
      },
      consistency: {
        os_check: { status: 'FAIL', evidence: 'Windows UA but macOS platform' },
        timezone_check: { status: 'FAIL', evidence: 'EST timezone but Asia IP' },
        language_check: { status: 'PASS', evidence: '' },
      },
    };

    const context = buildScanContext(mockReport as ScanReport);

    expect(context.consistency_issues).toContain('OS mismatch: Windows UA but macOS platform');
    expect(context.consistency_issues).toContain('Timezone mismatch: EST timezone but Asia IP');
  });

  it('formats fingerprint highlights correctly', () => {
    const mockReport: Partial<ScanReport> = {
      meta: { scan_id: 'test-abc', timestamp: 111, version: '1.0' },
      score: { total: 90, grade: 'A', verdict: 'Excellent', deductions: [] },
      network: {
        risk: { is_proxy: false, is_vpn: false, is_tor: false, fraud_score: 0 },
        protocols: { tls_ja3: '', tls_version: '', http_version: '', tcp_os_guess: '' },
        leaks: {
          webrtc: { status: 'SAFE', ip: '', region: '' },
          dns: { status: 'SAFE', servers: [] },
        },
      },
      fingerprint: {
        hardware: {
          canvas_hash: 'abcdef0123456789abcdef0123456789',
          webgl_vendor: 'NVIDIA Corporation',
          webgl_renderer: 'NVIDIA GeForce GTX 1080',
          screen: '2560x1440',
          concurrency: 16,
          memory: 16,
        },
        software: {
          fonts_hash: '123456789abc',
          timezone_name: 'Europe/London',
          languages: ['en-GB', 'en', 'fr'],
        },
      },
      consistency: {
        os_check: { status: 'PASS', evidence: '' },
        timezone_check: { status: 'PASS', evidence: '' },
        language_check: { status: 'PASS', evidence: '' },
      },
    };

    const context = buildScanContext(mockReport as ScanReport);

    expect(context.fingerprint_highlights).toHaveLength(5);
    expect(context.fingerprint_highlights[0]).toContain('Canvas: abcdef0123456789');
    expect(context.fingerprint_highlights[1]).toContain('WebGL: NVIDIA Corporation');
    expect(context.fingerprint_highlights[2]).toContain('Fonts: 123456789abc');
    expect(context.fingerprint_highlights[3]).toContain('Timezone: Europe/London');
    expect(context.fingerprint_highlights[4]).toContain('Languages: en-GB, en, fr');
  });
});
