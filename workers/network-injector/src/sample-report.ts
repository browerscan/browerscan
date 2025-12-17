import type { ScanReport } from '@browserscan/types';

export const sampleReport: ScanReport = {
  meta: { scan_id: 'demo-worker-scan', timestamp: 1710000000, version: '1.0.0' },
  score: {
    total: 82,
    grade: 'B',
    verdict: 'Moderate Risk',
    deductions: [
      { code: 'WEBRTC_LEAK', score: -12, desc: 'Real IP leaked via WebRTC' },
      { code: 'TZ_MISMATCH', score: -6, desc: 'System timezone differs from IP location' }
    ]
  },
  identity: {
    ip: '64.32.13.210',
    asn: 'AS40065 Sharktech',
    location: 'Los Angeles, US',
    browser: 'Chrome 142',
    os: 'Mac OS X 10.15',
    device: 'Desktop'
  },
  network: {
    risk: { is_proxy: true, is_vpn: false, is_tor: false, fraud_score: 85 },
    protocols: {
      tls_ja3: 'e7d705a3286e19ea42f55823113e2755',
      tls_version: 'TLS 1.3',
      http_version: 'h3',
      tcp_os_guess: 'Linux 5.x'
    },
    leaks: {
      webrtc: { status: 'LEAK', ip: '182.150.247.57', region: 'CN' },
      dns: { status: 'SAFE', servers: ['1.1.1.1'] }
    }
  },
  fingerprint: {
    hardware: {
      canvas_hash: 'a1b2c3d4',
      webgl_vendor: 'Google Inc. (Apple)',
      webgl_renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M4)',
      screen: '3840x2160',
      concurrency: 10,
      memory: 8
    },
    software: {
      fonts_hash: 'f9e8d7c6',
      timezone_name: 'Asia/Shanghai',
      languages: ['en-US', 'zh-CN']
    }
  },
  consistency: {
    os_check: { status: 'PASS', evidence: 'UA (Mac) matches WebGL Renderer (Apple M4)' },
    timezone_check: {
      status: 'FAIL',
      evidence: 'IP (America/Los_Angeles) != System (Asia/Shanghai)'
    },
    language_check: {
      status: 'WARN',
      evidence: 'IP is US but Primary Language is Chinese'
    }
  }
};
