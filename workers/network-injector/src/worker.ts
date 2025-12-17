import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ScanReport, NetworkSection, LeakStatus, HardwareFingerprint, SoftwareFingerprint, ChatContextSummary } from '@browserscan/types';
import { sampleReport } from './sample-report';
import { calculateScore, addBotDeduction } from './services/scoring';
import { lookupIpInfo, extractCloudflareData } from './services/ip-intel';
import {
  parseUserAgent,
  buildConsistencySection,
  buildProtocolFingerprints,
  generateScanId
} from './services/fingerprint';
import { generateReportHtml, generatePdfFilename } from './services/pdf';
import {
  analyzeBehavior,
  hashIp,
  generateSessionId,
  type BehaviorSession,
  type BehaviorAnalysis,
  type RecaptchaSimulation
} from './services/simulation';
import { performLeakTest, type LeakTestResult } from './services/leak-detector';
import { generateChatResponse, buildScanContext, fetchScanReport } from './services/ai-chat';
import {
  validateBody,
  validateQuery,
  getValidatedBody,
  scanRateLimit,
  toolRateLimit,
  strictRateLimit,
} from './middleware';
import {
  ClientFingerprintSchema,
  IpLookupSchema,
  PortScanSchema,
  LeakTestSchema,
  WebRTCCheckSchema,
  TurnstileVerifySchema,
  RecaptchaSimulationSchema,
  BehaviorSessionSchema,
  ChatRequestSchema,
  type ClientFingerprintInput,
  type IpLookupInput,
  type PortScanInput,
  type LeakTestInput,
  type WebRTCCheckInput,
  type TurnstileVerifyInput,
  type RecaptchaSimulationInput,
  type BehaviorSessionInput,
  type ChatRequestInput,
} from './schemas';

interface Env {
  DB: D1Database;
  REPORTS_BUCKET: R2Bucket;
  RATE_LIMIT_KV?: KVNamespace;
  IPINFO_CACHE_KV?: KVNamespace;
  IPINFO_TOKEN: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  OPENROUTER_API_KEY: string;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware - restrict in production
app.use('*', cors({
  origin: (origin, c) => {
    // Allow any origin in development/test
    if (c.env.ENVIRONMENT !== 'production') {
      return origin || '*';
    }
    // Production: restrict to allowed domains
    const allowedOrigins = [
      'https://browserscan.org',
      'https://www.browserscan.org'
    ];
    return allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================
// Health & Status Endpoints
// ============================================

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    data: {
      env: c.env.ENVIRONMENT ?? 'production',
      timestamp: Date.now(),
      version: '1.0.0'
    },
  });
});

// ============================================
// Scan Endpoints
// ============================================

/**
 * Start a new scan - creates initial record and returns scan_id
 */
app.post('/api/scan/start', scanRateLimit, async (c) => {
  try {
    const scanId = generateScanId();
    const timestamp = Math.floor(Date.now() / 1000);

    // Extract Cloudflare request data
    const cfData = extractCloudflareData(c.req.raw);

    // Initial placeholder - will be updated when client sends fingerprints
    await c.env.DB.prepare(`
      INSERT INTO scans (id, created_at, ip_address, country_code)
      VALUES (?1, ?2, ?3, ?4)
    `).bind(scanId, timestamp, cfData.ip, cfData.country).run();

    return c.json({
      status: 'ok',
      data: {
        scan_id: scanId,
        eta_seconds: 3,
        server_data: {
          ip: cfData.ip,
          country: cfData.country,
          colo: cfData.colo,
          tls_version: cfData.tlsVersion,
          http_protocol: cfData.httpProtocol
        }
      }
    });
  } catch (error) {
    console.error('scan/start error:', error);
    return c.json({ status: 'error', message: 'Failed to start scan' }, 500);
  }
});

/**
 * Collect fingerprints from client and build complete report
 */
app.post('/api/scan/collect', scanRateLimit, validateBody(ClientFingerprintSchema), async (c) => {
  try {
    const body = getValidatedBody<ClientFingerprintInput>(c);
    const { scan_id } = body;

    // Extract server-side data
    const cfData = extractCloudflareData(c.req.raw);
    const userAgent = c.req.header('user-agent') || '';
    const parsedUA = parseUserAgent(userAgent);

    // Lookup IP intelligence
    const ipIntel = await lookupIpInfo(cfData.ip, c.env.IPINFO_TOKEN, c.env.IPINFO_CACHE_KV);

    // Build network section
    const webrtcLeak = detectWebRTCLeak(cfData.ip, body.webrtc_ips);
    const dnsLeak = detectDNSLeak(body.dns_servers);

    const network: NetworkSection = {
      risk: {
        is_proxy: ipIntel.isProxy,
        is_vpn: ipIntel.isVpn,
        is_tor: ipIntel.isTor,
        fraud_score: ipIntel.fraudScore
      },
      protocols: buildProtocolFingerprints(
        cfData.tlsVersion,
        'TLS_AES_128_GCM_SHA256', // Placeholder - actual cipher from cf
        cfData.httpProtocol,
        parsedUA.os
      ),
      leaks: {
        webrtc: webrtcLeak,
        dns: dnsLeak
      }
    };

    // Build fingerprint section
    const hardware: HardwareFingerprint = {
      canvas_hash: body.canvas_hash || 'unknown',
      webgl_vendor: body.webgl_vendor || 'unknown',
      webgl_renderer: body.webgl_renderer || 'unknown',
      screen: body.screen || 'unknown',
      concurrency: body.concurrency || 0,
      memory: body.memory || 0
    };

    const software: SoftwareFingerprint = {
      fonts_hash: body.fonts_hash || 'unknown',
      timezone_name: body.timezone || 'unknown',
      languages: body.languages || []
    };

    // Build consistency section
    const consistency = buildConsistencySection(
      ipIntel.timezone,
      body.timezone,
      ipIntel.countryCode,
      body.languages,
      parsedUA.os,
      body.webgl_renderer
    );

    // Calculate score
    let scoreCard = calculateScore(network, consistency);

    // Check for bot indicators
    if (body.is_webdriver || body.is_headless) {
      scoreCard = addBotDeduction(scoreCard, body.is_webdriver ? 'WebDriver detected' : 'Headless browser detected');
    }

    // Build complete report
    const report: ScanReport = {
      meta: {
        scan_id,
        timestamp: Math.floor(Date.now() / 1000),
        version: '1.0.0',
        server: {
          colo: cfData.colo,
          http_protocol: cfData.httpProtocol,
          tls_version: cfData.tlsVersion,
          ray_id: c.req.header('cf-ray') || undefined,
          ip: cfData.ip
        }
      },
      score: scoreCard,
      identity: {
        ip: cfData.ip,
        asn: ipIntel.asn + ' ' + ipIntel.org,
        location: `${ipIntel.city}, ${ipIntel.country}`,
        browser: `${parsedUA.browser} ${parsedUA.browserVersion}`,
        os: `${parsedUA.os} ${parsedUA.osVersion}`,
        device: parsedUA.device
      },
      network,
      fingerprint: {
        hardware,
        software
      },
      consistency
    };

    // Update database with complete report
    await c.env.DB.prepare(`
      UPDATE scans SET
        trust_score = ?1,
        trust_grade = ?2,
        browser_family = ?3,
        os_family = ?4,
        has_proxy = ?5,
        has_webrtc_leak = ?6,
        is_bot = ?7,
        report_blob = ?8
      WHERE id = ?9
    `).bind(
      scoreCard.total,
      scoreCard.grade,
      parsedUA.browser,
      parsedUA.os,
      network.risk.is_proxy ? 1 : 0,
      webrtcLeak.status === 'LEAK' ? 1 : 0,
      body.is_webdriver || body.is_headless ? 1 : 0,
      JSON.stringify(report),
      scan_id
    ).run();

    return c.json({ status: 'ok', data: report });
  } catch (error) {
    console.error('scan/collect error:', error);
    return c.json({ status: 'error', message: 'Failed to process scan' }, 500);
  }
});

/**
 * Get scan by ID
 */
app.get('/api/scan/:id', async (c) => {
  try {
    const scanId = c.req.param('id');

    const row = await c.env.DB.prepare(
      'SELECT report_blob FROM scans WHERE id = ?'
    ).bind(scanId).first<{ report_blob?: string }>();

    if (!row || !row.report_blob) {
      return c.json({ status: 'error', message: 'Scan not found' }, 404);
    }

    const report = JSON.parse(row.report_blob) as ScanReport;
    c.header('Cache-Control', 'public, max-age=5, s-maxage=30, stale-while-revalidate=30');
    c.header('ETag', scanId);
    return c.json({ status: 'ok', data: report });
  } catch (error) {
    console.error('scan/:id error:', error);
    return c.json({ status: 'error', message: 'Failed to fetch scan' }, 500);
  }
});

/**
 * Get latest scan (for dashboard)
 */
app.get('/api/scan/latest', async (c) => {
  try {
    const row = await c.env.DB.prepare(
      'SELECT report_blob FROM scans WHERE report_blob IS NOT NULL ORDER BY created_at DESC LIMIT 1'
    ).first<{ report_blob?: string }>();

    if (row?.report_blob) {
      const report = JSON.parse(row.report_blob) as ScanReport;
      c.header('Cache-Control', 'public, max-age=5, s-maxage=15, stale-while-revalidate=30');
      c.header('ETag', `latest-${report.meta.scan_id}`);
      return c.json({ status: 'ok', data: report });
    }

    // Return sample report if no scans exist
    return c.json({ status: 'ok', data: sampleReport });
  } catch (error) {
    console.error('scan/latest error:', error);
    return c.json({ status: 'ok', data: sampleReport });
  }
});

/**
 * Generate PDF report
 */
app.post('/api/scan/:id/pdf', async (c) => {
  try {
    const scanId = c.req.param('id');

    const row = await c.env.DB.prepare(
      'SELECT report_blob FROM scans WHERE id = ?'
    ).bind(scanId).first<{ report_blob?: string }>();

    if (!row || !row.report_blob) {
      return c.json({ status: 'error', message: 'Scan not found' }, 404);
    }

    const report = JSON.parse(row.report_blob) as ScanReport;
    const html = generateReportHtml(report);

    // Store HTML in R2 for later access
    const filename = generatePdfFilename(scanId);
    const key = `reports/${new Date().toISOString().slice(0, 7)}/${filename.replace('.pdf', '.html')}`;

    await c.env.REPORTS_BUCKET.put(key, html, {
      httpMetadata: { contentType: 'text/html' },
      customMetadata: { scanId, createdAt: Date.now().toString() }
    });

    // Return HTML directly for now (client can print to PDF)
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${filename.replace('.pdf', '.html')}"`
      }
    });
  } catch (error) {
    console.error('scan/:id/pdf error:', error);
    return c.json({ status: 'error', message: 'Failed to generate report' }, 500);
  }
});

// ============================================
// Tools Endpoints
// ============================================

/**
 * IP Lookup tool
 */
app.post('/api/tools/ip-lookup', toolRateLimit, validateBody(IpLookupSchema), async (c) => {
  try {
    const body = getValidatedBody<IpLookupInput>(c);
    const ip = body.ip || c.req.header('cf-connecting-ip') || '8.8.8.8';

    const intel = await lookupIpInfo(ip, c.env.IPINFO_TOKEN, c.env.IPINFO_CACHE_KV);

    return c.json({
      status: 'ok',
      data: {
        ip: intel.ip,
        asn: intel.asn,
        org: intel.org,
        country: intel.country,
        country_code: intel.countryCode,
        region: intel.region,
        city: intel.city,
        timezone: intel.timezone,
        is_proxy: intel.isProxy,
        is_vpn: intel.isVpn,
        is_tor: intel.isTor,
        is_hosting: intel.isHosting,
        fraud_score: intel.fraudScore,
        coordinates: intel.lat && intel.lon ? { lat: intel.lat, lon: intel.lon } : null
      }
    });
  } catch (error) {
    console.error('ip-lookup error:', error);
    return c.json({ status: 'error', message: 'IP lookup failed' }, 500);
  }
});

/**
 * Port scan tool (checks if common ports are accessible)
 */
app.post('/api/tools/port-scan', toolRateLimit, validateBody(PortScanSchema), async (c) => {
  try {
    const body = getValidatedBody<PortScanInput>(c);
    const ip = body.ip || c.req.header('cf-connecting-ip') || '';
    const ports = body.ports || [22, 80, 443, 3389, 8080];

    // Note: Workers can't do TCP connects, so we return a placeholder
    // Real implementation would use a backend service or external API
    const results = ports.map(port => ({
      port,
      status: 'unknown' as const,
      service: getServiceName(port)
    }));

    return c.json({
      status: 'ok',
      data: {
        target_ip: ip,
        ports: results,
        note: 'Port scanning requires direct TCP connections not available in edge workers'
      }
    });
  } catch (error) {
    console.error('port-scan error:', error);
    return c.json({ status: 'error', message: 'Port scan failed' }, 500);
  }
});

/**
 * Turnstile verification
 */
app.post('/api/tools/turnstile-verify', strictRateLimit, validateBody(TurnstileVerifySchema), async (c) => {
  try {
    const body = getValidatedBody<TurnstileVerifyInput>(c);
    const { token } = body;

    const ip = c.req.header('cf-connecting-ip') || '';

    const formData = new FormData();
    formData.append('secret', c.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });

    const outcome = await result.json<{
      success: boolean;
      challenge_ts?: string;
      hostname?: string;
      'error-codes'?: string[];
    }>();

    return c.json({
      status: 'ok',
      data: {
        success: outcome.success,
        challenge_timestamp: outcome.challenge_ts,
        hostname: outcome.hostname,
        errors: outcome['error-codes']
      }
    });
  } catch (error) {
    console.error('turnstile-verify error:', error);
    return c.json({ status: 'error', message: 'Verification failed' }, 500);
  }
});

// ============================================
// Simulation Endpoints
// ============================================

/**
 * Save reCAPTCHA simulation score
 */
app.post('/api/simulation/recaptcha', toolRateLimit, validateBody(RecaptchaSimulationSchema), async (c) => {
  try {
    const body = getValidatedBody<RecaptchaSimulationInput>(c);
    const { score, action } = body;

    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const ipHash = hashIp(ip, 'recaptcha-salt');
    const timestamp = Math.floor(Date.now() / 1000);
    const id = generateSessionId();

    // Store in D1 (create table if needed via migration)
    try {
      await c.env.DB.prepare(`
        INSERT INTO recaptcha_simulations (id, score, timestamp, ip_hash, action)
        VALUES (?1, ?2, ?3, ?4, ?5)
      `).bind(id, score, timestamp, ipHash, action).run();
    } catch (dbError) {
      // Table might not exist yet, continue anyway
      console.warn('recaptcha simulation DB error (table may not exist):', dbError);
    }

    // Determine verdict based on score
    let verdict: string;
    let riskLevel: string;
    if (score >= 0.7) {
      verdict = 'Likely human';
      riskLevel = 'low';
    } else if (score >= 0.3) {
      verdict = 'Suspicious activity';
      riskLevel = 'medium';
    } else {
      verdict = 'Likely bot';
      riskLevel = 'high';
    }

    return c.json({
      status: 'ok',
      data: {
        id,
        score,
        timestamp,
        action,
        verdict,
        risk_level: riskLevel,
        interpretation: {
          '0.0-0.3': 'Very likely a bot - block or challenge',
          '0.3-0.7': 'Suspicious - additional verification recommended',
          '0.7-1.0': 'Likely legitimate user - allow'
        }
      }
    });
  } catch (error) {
    console.error('simulation/recaptcha error:', error);
    return c.json({ status: 'error', message: 'Simulation failed' }, 500);
  }
});

/**
 * Analyze behavioral telemetry data
 */
app.post('/api/simulation/behavior', toolRateLimit, validateBody(BehaviorSessionSchema), async (c) => {
  try {
    const body = getValidatedBody<BehaviorSessionInput>(c);

    if (body.events.length < 5) {
      return c.json({
        status: 'ok',
        data: {
          session_id: body.session_id || generateSessionId(),
          timestamp: Math.floor(Date.now() / 1000),
          verdict: 'UNKNOWN',
          human_probability: 50,
          bot_probability: 50,
          message: 'Insufficient data for analysis (minimum 5 events required)',
          scores: []
        }
      });
    }

    // Ensure session has required fields
    const session: BehaviorSession = {
      session_id: body.session_id || generateSessionId(),
      events: body.events,
      start_time: body.start_time || body.events[0]?.timestamp || Date.now(),
      end_time: body.end_time || body.events[body.events.length - 1]?.timestamp || Date.now()
    };

    // Analyze the behavior
    const analysis: BehaviorAnalysis = analyzeBehavior(session);

    // Store in D1 (optional, for analytics)
    try {
      const ip = c.req.header('cf-connecting-ip') || 'unknown';
      const ipHash = hashIp(ip, 'behavior-salt');

      await c.env.DB.prepare(`
        INSERT INTO behavior_sessions (
          id, timestamp, ip_hash, verdict, human_probability, bot_probability,
          mouse_entropy, click_entropy, keyboard_entropy, event_count
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
      `).bind(
        analysis.session_id,
        analysis.timestamp,
        ipHash,
        analysis.verdict,
        analysis.human_probability,
        analysis.bot_probability,
        analysis.mouse_entropy,
        analysis.click_entropy,
        analysis.keyboard_entropy,
        session.events.length
      ).run();
    } catch (dbError) {
      // Table might not exist yet, continue anyway
      console.warn('behavior session DB error (table may not exist):', dbError);
    }

    return c.json({ status: 'ok', data: analysis });
  } catch (error) {
    console.error('simulation/behavior error:', error);
    return c.json({ status: 'error', message: 'Analysis failed' }, 500);
  }
});

/**
 * Get behavior session history (for dashboard)
 */
app.get('/api/simulation/behavior/history', async (c) => {
  try {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const ipHash = hashIp(ip, 'behavior-salt');

    const results = await c.env.DB.prepare(`
      SELECT id, timestamp, verdict, human_probability, bot_probability, event_count
      FROM behavior_sessions
      WHERE ip_hash = ?
      ORDER BY timestamp DESC
      LIMIT 10
    `).bind(ipHash).all();

    return c.json({
      status: 'ok',
      data: results.results || []
    });
  } catch (error) {
    console.error('behavior/history error:', error);
    return c.json({ status: 'ok', data: [] });
  }
});

// ============================================
// Leak Test Endpoints
// ============================================

/**
 * Comprehensive leak test (WebRTC, DNS, IPv6)
 */
app.post('/api/tools/leak-test', toolRateLimit, validateBody(LeakTestSchema), async (c) => {
  try {
    const body = getValidatedBody<LeakTestInput>(c);
    const publicIp = c.req.header('cf-connecting-ip') || '127.0.0.1';

    const result: LeakTestResult = await performLeakTest(
      publicIp,
      body.webrtc_ips || [],
      body.dns_servers || [],
      body.ipv6_address ?? null,
      c.env.IPINFO_TOKEN,
      c.env.IPINFO_CACHE_KV
    );

    return c.json({ status: 'ok', data: result });
  } catch (error) {
    console.error('leak-test error:', error);
    return c.json({ status: 'error', message: 'Leak test failed' }, 500);
  }
});

/**
 * Quick WebRTC-only leak check
 */
app.post('/api/tools/webrtc-check', toolRateLimit, validateBody(WebRTCCheckSchema), async (c) => {
  try {
    const body = getValidatedBody<WebRTCCheckInput>(c);
    const publicIp = c.req.header('cf-connecting-ip') || '127.0.0.1';

    // Use inline detection for quick check
    const result = detectWebRTCLeak(publicIp, body.webrtc_ips);

    return c.json({
      status: 'ok',
      data: {
        public_ip: publicIp,
        ...result,
        is_leaked: result.status === 'LEAK'
      }
    });
  } catch (error) {
    console.error('webrtc-check error:', error);
    return c.json({ status: 'error', message: 'WebRTC check failed' }, 500);
  }
});

// ============================================
// Helper Functions
// ============================================

function detectWebRTCLeak(
  publicIp: string,
  webrtcIps: string[]
): { status: LeakStatus; ip: string; region: string } {
  if (!webrtcIps || webrtcIps.length === 0) {
    return { status: 'UNKNOWN', ip: '', region: '' };
  }

  // Filter out local/private IPs
  const publicWebrtcIps = webrtcIps.filter(ip => !isPrivateIp(ip));

  if (publicWebrtcIps.length === 0) {
    return { status: 'SAFE', ip: '', region: '' };
  }

  // Check if any WebRTC IP differs from the public IP
  const leakedIp = publicWebrtcIps.find(ip => ip !== publicIp);

  if (leakedIp) {
    return {
      status: 'LEAK',
      ip: leakedIp,
      region: 'Unknown' // Would need IP lookup to get region
    };
  }

  return { status: 'SAFE', ip: publicIp, region: '' };
}

function detectDNSLeak(
  dnsServers: string[]
): { status: LeakStatus; servers: string[] } {
  if (!dnsServers || dnsServers.length === 0) {
    return { status: 'UNKNOWN', servers: [] };
  }

  // Check for common secure DNS servers
  const secureDns = ['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4', '9.9.9.9'];
  const hasSecure = dnsServers.some(s => secureDns.includes(s));

  if (hasSecure) {
    return { status: 'SAFE', servers: dnsServers };
  }

  // If using ISP DNS, it might leak location
  return { status: 'WARN', servers: dnsServers };
}

function isPrivateIp(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;

  // 10.x.x.x
  if (parts[0] === 10) return true;
  // 172.16.x.x - 172.31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 127.x.x.x (localhost)
  if (parts[0] === 127) return true;

  return false;
}

function getServiceName(port: number): string {
  const services: Record<number, string> = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC',
    6379: 'Redis',
    8080: 'HTTP-ALT',
    8443: 'HTTPS-ALT'
  };
  return services[port] || 'Unknown';
}

// ============================================
// AI Chat Endpoint
// ============================================

/**
 * AI-powered chat for fingerprint analysis
 */
app.post('/api/ai/chat', strictRateLimit, validateBody(ChatRequestSchema), async (c) => {
  try {
    const body = getValidatedBody<ChatRequestInput>(c);
    const { scan_id, message, history } = body;

    // Check if API key is configured
    if (!c.env.OPENROUTER_API_KEY) {
      return c.json({
        status: 'error',
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'AI chat service is not configured'
        }
      }, 503);
    }

    // Fetch scan context if scan_id provided
    let context: ChatContextSummary | undefined;
    if (scan_id) {
      const report = await fetchScanReport(scan_id, c.env.DB);
      if (report) {
        context = buildScanContext(report);
      } else {
        console.warn(`Scan ${scan_id} not found, proceeding without context`);
      }
    }

    // Generate AI response
    const result = await generateChatResponse(
      message,
      history,
      c.env.OPENROUTER_API_KEY,
      context
    );

    return c.json({
      status: 'ok',
      data: {
        response: result.response,
        tokens: result.tokens
      }
    });
  } catch (error) {
    console.error('ai/chat error:', error);

    // Provide user-friendly error messages
    const errorMessage = error instanceof Error
      ? (error.message.includes('OpenRouter')
          ? 'AI service temporarily unavailable. Please try again.'
          : 'Failed to process chat message.')
      : 'An unexpected error occurred.';

    return c.json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage
      }
    }, 500);
  }
});

export default app;
