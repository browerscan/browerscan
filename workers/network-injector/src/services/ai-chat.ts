/**
 * AI Chat Service
 * OpenRouter Llama 3.3 70B integration for fingerprint analysis
 */

import type { ScanReport, ChatMessage, ChatContextSummary } from '@browserscan/types';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const MODEL_ID = 'meta-llama/llama-3.3-70b-instruct:free';
const MAX_TOKENS = 1000; // Limit response length

interface OpenRouterRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Build compact context summary from scan report
 */
export function buildScanContext(report: ScanReport): ChatContextSummary {
  const riskFlags: string[] = [];
  if (report.network.risk.is_proxy) riskFlags.push('Proxy detected');
  if (report.network.risk.is_vpn) riskFlags.push('VPN detected');
  if (report.network.risk.is_tor) riskFlags.push('Tor detected');
  if (report.network.risk.fraud_score > 50) riskFlags.push(`High fraud score: ${report.network.risk.fraud_score}`);

  const leakStatus: string[] = [];
  if (report.network.leaks.webrtc.status === 'LEAK') {
    leakStatus.push(`WebRTC leak: ${report.network.leaks.webrtc.ip}`);
  }
  if (report.network.leaks.dns.status === 'LEAK' || report.network.leaks.dns.status === 'WARN') {
    leakStatus.push(`DNS leak: ${report.network.leaks.dns.servers.join(', ')}`);
  }

  const consistencyIssues: string[] = [];
  if (report.consistency.timezone_check.status === 'FAIL') {
    consistencyIssues.push(`Timezone mismatch: ${report.consistency.timezone_check.evidence}`);
  }
  if (report.consistency.language_check.status === 'FAIL') {
    consistencyIssues.push(`Language mismatch: ${report.consistency.language_check.evidence}`);
  }
  if (report.consistency.os_check.status === 'FAIL') {
    consistencyIssues.push(`OS mismatch: ${report.consistency.os_check.evidence}`);
  }

  const fingerprintHighlights = [
    `Canvas: ${report.fingerprint.hardware.canvas_hash.slice(0, 16)}...`,
    `WebGL: ${report.fingerprint.hardware.webgl_vendor}`,
    `Fonts: ${report.fingerprint.software.fonts_hash.slice(0, 16)}...`,
    `Timezone: ${report.fingerprint.software.timezone_name}`,
    `Languages: ${report.fingerprint.software.languages.join(', ')}`,
  ];

  return {
    scan_id: report.meta.scan_id,
    trust_score: report.score.total,
    grade: report.score.grade,
    verdict: report.score.verdict,
    risk_flags: riskFlags,
    leak_status: leakStatus,
    consistency_issues: consistencyIssues,
    fingerprint_highlights: fingerprintHighlights,
  };
}

/**
 * Generate system prompt with optional scan context
 */
function buildSystemPrompt(context?: ChatContextSummary): string {
  const basePrompt = `You are an expert browser fingerprinting and privacy analyst for BrowserScan.org.
You help users understand their browser fingerprints, privacy risks, and provide actionable advice.

Guidelines:
- Be concise and practical (2-3 paragraphs max)
- Use clear, non-technical language for general users
- Provide specific, actionable recommendations
- If asked about scores, explain what factors contribute to them
- If asked about risks, prioritize by severity
- If no scan data is available, explain general concepts`;

  if (!context) {
    return basePrompt;
  }

  return `${basePrompt}

Current Scan Context:
- Scan ID: ${context.scan_id}
- Trust Score: ${context.trust_score}/100 (Grade: ${context.grade})
- Verdict: ${context.verdict}
- Risk Flags: ${context.risk_flags.length > 0 ? context.risk_flags.join(', ') : 'None'}
- Leaks: ${context.leak_status.length > 0 ? context.leak_status.join(', ') : 'None detected'}
- Consistency Issues: ${context.consistency_issues.length > 0 ? context.consistency_issues.join(', ') : 'All checks passed'}
- Fingerprint: ${context.fingerprint_highlights.join('; ')}

Use this context to provide personalized analysis and recommendations.`;
}

/**
 * Call OpenRouter API with Llama 3.3 70B
 */
export async function generateChatResponse(
  message: string,
  history: ChatMessage[],
  apiKey: string,
  context?: ChatContextSummary
): Promise<{ response: string; tokens?: number }> {
  const systemPrompt = buildSystemPrompt(context);

  // Build messages array for OpenRouter
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: message },
  ];

  const requestBody: OpenRouterRequest = {
    model: MODEL_ID,
    messages,
    max_tokens: MAX_TOKENS,
    temperature: 0.7, // Balance creativity and accuracy
  };

  const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://browserscan.org', // Required by OpenRouter
      'X-Title': 'BrowserScan AI Assistant',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter API error:', error);
    throw new Error(`OpenRouter API failed: ${response.status}`);
  }

  const data: OpenRouterResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from AI model');
  }

  return {
    response: data.choices[0].message.content,
    tokens: data.usage?.total_tokens,
  };
}

/**
 * Fetch scan report from D1 by ID
 */
export async function fetchScanReport(
  scanId: string,
  db: D1Database
): Promise<ScanReport | null> {
  try {
    const row = await db.prepare(
      'SELECT report_blob FROM scans WHERE id = ?'
    ).bind(scanId).first<{ report_blob?: string }>();

    if (!row || !row.report_blob) {
      return null;
    }

    return JSON.parse(row.report_blob) as ScanReport;
  } catch (error) {
    console.error('Failed to fetch scan report:', error);
    return null;
  }
}
