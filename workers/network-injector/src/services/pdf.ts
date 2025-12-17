/**
 * PDF Generation Service
 * Creates comprehensive PDF reports from scan data
 *
 * Note: This uses a text-based approach since jsPDF doesn't work in Workers.
 * We'll generate a downloadable HTML report that can be printed to PDF.
 */

import type { ScanReport } from '@browserscan/types';

/**
 * Escape HTML special characters to prevent XSS injection
 */
function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => htmlEscapeMap[char] || char);
}

/**
 * Generate a PDF-ready HTML report
 */
export function generateReportHtml(report: ScanReport): string {
  const timestamp = new Date(report.meta.timestamp * 1000).toISOString();
  const dateFormatted = new Date(report.meta.timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const gradeColor = getGradeColor(report.score.grade);
  const gradeColorLight = getGradeColorLight(report.score.grade);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrowserScan Report - ${report.meta.scan_id}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 12mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background: #fff;
      color: #1a1a1a;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      font-size: 13px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      margin-bottom: 24px;
      border-bottom: 2px solid #09090b;
    }
    .logo {
      font-size: 22px;
      font-weight: 700;
      color: #09090b;
      letter-spacing: -0.02em;
    }
    .logo span { color: #10b981; }
    .report-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f4f4f5;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .meta {
      text-align: right;
      font-size: 11px;
      color: #71717a;
    }
    .meta-id {
      font-family: 'SF Mono', Monaco, 'Consolas', monospace;
      font-size: 12px;
      font-weight: 600;
      color: #09090b;
      margin-bottom: 2px;
    }
    .score-section {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 28px;
      padding: 20px;
      background: ${gradeColorLight};
      border-radius: 12px;
      border: 1px solid ${gradeColor}30;
    }
    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fff;
      border: 4px solid ${gradeColor};
      box-shadow: 0 2px 8px ${gradeColor}20;
      flex-shrink: 0;
    }
    .score-value {
      font-size: 32px;
      font-weight: 700;
      color: ${gradeColor};
      line-height: 1;
    }
    .score-label {
      font-size: 10px;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 2px;
    }
    .score-details {
      flex: 1;
    }
    .score-details h2 {
      font-size: 20px;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 4px;
    }
    .verdict {
      font-size: 15px;
      color: ${gradeColor};
      font-weight: 600;
    }
    .score-meta {
      margin-top: 8px;
      font-size: 11px;
      color: #71717a;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e4e7;
    }
    .section-icon {
      width: 16px;
      height: 16px;
      background: #f4f4f5;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    .data-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .data-grid-3 {
      grid-template-columns: repeat(3, 1fr);
    }
    .data-item {
      padding: 10px 12px;
      background: #fafafa;
      border-radius: 6px;
      border: 1px solid #e4e4e7;
    }
    .data-item-full {
      grid-column: span 2;
    }
    .data-label {
      font-size: 10px;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
      font-weight: 500;
    }
    .data-value {
      font-size: 13px;
      font-weight: 500;
      font-family: 'SF Mono', Monaco, 'Consolas', monospace;
      word-break: break-all;
      color: #18181b;
    }
    .data-value-text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .status-pass { color: #10b981; }
    .status-fail { color: #ef4444; }
    .status-warn { color: #f59e0b; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .status-badge-pass {
      background: #ecfdf5;
      color: #10b981;
    }
    .status-badge-fail {
      background: #fef2f2;
      color: #ef4444;
    }
    .status-badge-warn {
      background: #fffbeb;
      color: #f59e0b;
    }
    .deductions {
      margin-top: 16px;
    }
    .deduction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #fef2f2;
      border-left: 3px solid #ef4444;
      margin-bottom: 6px;
      border-radius: 0 6px 6px 0;
    }
    .deduction-desc {
      font-size: 12px;
      color: #18181b;
    }
    .deduction-score {
      font-weight: 700;
      font-size: 13px;
      color: #ef4444;
      font-family: 'SF Mono', Monaco, monospace;
    }
    .summary-box {
      background: #f4f4f5;
      border-radius: 8px;
      padding: 16px;
      margin-top: 12px;
    }
    .summary-title {
      font-size: 11px;
      font-weight: 600;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    .summary-text {
      font-size: 12px;
      color: #3f3f46;
      line-height: 1.6;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e4e4e7;
      text-align: center;
    }
    .footer-logo {
      font-size: 14px;
      font-weight: 700;
      color: #09090b;
      margin-bottom: 4px;
    }
    .footer-logo span { color: #10b981; }
    .footer-text {
      font-size: 10px;
      color: #a1a1aa;
      margin-top: 4px;
    }
    .footer-url {
      font-size: 11px;
      color: #71717a;
    }
    .page-break {
      page-break-before: always;
    }
    @media print {
      body {
        padding: 0;
        font-size: 12px;
      }
      .score-section { break-inside: avoid; }
      .section { break-inside: avoid; }
      .data-item { break-inside: avoid; }
      .deduction-item { break-inside: avoid; }
      .no-print { display: none; }
    }
    @media screen {
      body {
        background: #f4f4f5;
        padding: 40px;
      }
      .page-container {
        background: #fff;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        max-width: 800px;
        margin: 0 auto;
      }
      .print-button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #10b981;
        color: #fff;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .print-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <div>
        <div class="logo">Browser<span>Scan</span></div>
        <span class="report-badge">Trust Score Report</span>
      </div>
      <div class="meta">
        <div class="meta-id">ID: ${escapeHtml(report.meta.scan_id.slice(0, 12))}</div>
        ${dateFormatted}
      </div>
    </div>

    <div class="score-section">
      <div class="score-circle">
        <div class="score-value">${report.score.total}</div>
        <div class="score-label">Grade ${report.score.grade}</div>
      </div>
      <div class="score-details">
        <h2>Browser Trust Score Analysis</h2>
        <div class="verdict">${escapeHtml(report.score.verdict)}</div>
        <div class="score-meta">
          ${report.score.deductions.length} issue${report.score.deductions.length !== 1 ? 's' : ''} detected
          &bull; Version ${escapeHtml(report.meta.version)}
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title"><span class="section-icon">ID</span> Identity Information</h3>
      <div class="data-grid">
        <div class="data-item">
          <div class="data-label">IP Address</div>
          <div class="data-value">${escapeHtml(report.identity.ip)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">ASN</div>
          <div class="data-value">${escapeHtml(report.identity.asn)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">Location</div>
          <div class="data-value data-value-text">${escapeHtml(report.identity.location)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">Browser</div>
          <div class="data-value data-value-text">${escapeHtml(report.identity.browser)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">Operating System</div>
          <div class="data-value data-value-text">${escapeHtml(report.identity.os)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">Device Type</div>
          <div class="data-value data-value-text">${escapeHtml(report.identity.device)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title"><span class="section-icon">NET</span> Network Analysis</h3>
      <div class="data-grid">
        <div class="data-item">
          <div class="data-label">Proxy Detected</div>
          <div class="data-value">
            <span class="status-badge ${report.network.risk.is_proxy ? 'status-badge-fail' : 'status-badge-pass'}">
              ${report.network.risk.is_proxy ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
        <div class="data-item">
          <div class="data-label">VPN Detected</div>
          <div class="data-value">
            <span class="status-badge ${report.network.risk.is_vpn ? 'status-badge-warn' : 'status-badge-pass'}">
              ${report.network.risk.is_vpn ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
        <div class="data-item">
          <div class="data-label">Tor Exit Node</div>
          <div class="data-value">
            <span class="status-badge ${report.network.risk.is_tor ? 'status-badge-fail' : 'status-badge-pass'}">
              ${report.network.risk.is_tor ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
        <div class="data-item">
          <div class="data-label">Fraud Score</div>
          <div class="data-value">
            <span class="status-badge ${report.network.risk.fraud_score > 75 ? 'status-badge-fail' : report.network.risk.fraud_score > 50 ? 'status-badge-warn' : 'status-badge-pass'}">
              ${report.network.risk.fraud_score}/100
            </span>
          </div>
        </div>
        <div class="data-item">
          <div class="data-label">TLS JA3 Hash</div>
          <div class="data-value">${escapeHtml(report.network.protocols.tls_ja3)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">TLS Version</div>
          <div class="data-value">${escapeHtml(report.network.protocols.tls_version)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">HTTP Protocol</div>
          <div class="data-value">${escapeHtml(report.network.protocols.http_version)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">TCP OS Guess</div>
          <div class="data-value data-value-text">${escapeHtml(report.network.protocols.tcp_os_guess)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title"><span class="section-icon">LEAK</span> Leak Detection</h3>
      <div class="data-grid">
        <div class="data-item">
          <div class="data-label">WebRTC Status</div>
          <div class="data-value">
            <span class="status-badge ${report.network.leaks.webrtc.status === 'LEAK' ? 'status-badge-fail' : 'status-badge-pass'}">
              ${escapeHtml(report.network.leaks.webrtc.status)}
            </span>
            ${report.network.leaks.webrtc.status === 'LEAK' ? `<div style="margin-top:4px;font-size:11px;color:#71717a;">${escapeHtml(report.network.leaks.webrtc.ip || '')}</div>` : ''}
          </div>
        </div>
        <div class="data-item">
          <div class="data-label">DNS Status</div>
          <div class="data-value">
            <span class="status-badge ${report.network.leaks.dns.status === 'LEAK' ? 'status-badge-fail' : 'status-badge-pass'}">
              ${escapeHtml(report.network.leaks.dns.status)}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title"><span class="section-icon">HW</span> Hardware Fingerprint</h3>
      <div class="data-grid">
        <div class="data-item data-item-full">
          <div class="data-label">Canvas Hash</div>
          <div class="data-value">${escapeHtml(report.fingerprint.hardware.canvas_hash)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">WebGL Vendor</div>
          <div class="data-value data-value-text">${escapeHtml(report.fingerprint.hardware.webgl_vendor)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">WebGL Renderer</div>
          <div class="data-value data-value-text">${escapeHtml(report.fingerprint.hardware.webgl_renderer)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">Screen Resolution</div>
          <div class="data-value">${escapeHtml(report.fingerprint.hardware.screen)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">CPU / Memory</div>
          <div class="data-value">${report.fingerprint.hardware.concurrency} cores / ${report.fingerprint.hardware.memory} GB</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title"><span class="section-icon">SW</span> Software Fingerprint</h3>
      <div class="data-grid">
        <div class="data-item data-item-full">
          <div class="data-label">Fonts Hash</div>
          <div class="data-value">${escapeHtml(report.fingerprint.software.fonts_hash)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">Timezone</div>
          <div class="data-value data-value-text">${escapeHtml(report.fingerprint.software.timezone_name)}</div>
        </div>
        <div class="data-item">
          <div class="data-label">Languages</div>
          <div class="data-value data-value-text">${escapeHtml(report.fingerprint.software.languages.join(', '))}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title"><span class="section-icon">CHECK</span> Consistency Checks</h3>
      <div class="data-grid data-grid-3">
        <div class="data-item">
          <div class="data-label">OS Check</div>
          <div class="data-value">
            <span class="status-badge status-badge-${report.consistency.os_check.status === 'PASS' ? 'pass' : report.consistency.os_check.status === 'FAIL' ? 'fail' : 'warn'}">
              ${report.consistency.os_check.status}
            </span>
          </div>
        </div>
        <div class="data-item">
          <div class="data-label">Timezone Check</div>
          <div class="data-value">
            <span class="status-badge status-badge-${report.consistency.timezone_check.status === 'PASS' ? 'pass' : report.consistency.timezone_check.status === 'FAIL' ? 'fail' : 'warn'}">
              ${report.consistency.timezone_check.status}
            </span>
          </div>
        </div>
        <div class="data-item">
          <div class="data-label">Language Check</div>
          <div class="data-value">
            <span class="status-badge status-badge-${report.consistency.language_check.status === 'PASS' ? 'pass' : report.consistency.language_check.status === 'FAIL' ? 'fail' : 'warn'}">
              ${report.consistency.language_check.status}
            </span>
          </div>
        </div>
      </div>
    </div>

    ${report.score.deductions.length > 0 ? `
    <div class="section deductions">
      <h3 class="section-title"><span class="section-icon">-</span> Score Deductions (${report.score.deductions.length})</h3>
      ${report.score.deductions.map(d => `
        <div class="deduction-item">
          <span class="deduction-desc">${escapeHtml(d.desc)}</span>
          <span class="deduction-score">${d.score}</span>
        </div>
      `).join('')}
    </div>
    ` : `
    <div class="summary-box">
      <div class="summary-title">Analysis Summary</div>
      <div class="summary-text">
        No significant issues were detected during this scan. The browser configuration appears
        consistent and trustworthy. This indicates a genuine user environment with no detected
        attempts at fingerprint manipulation or anonymization.
      </div>
    </div>
    `}

    <div class="footer">
      <div class="footer-logo">Browser<span>Scan</span></div>
      <div class="footer-url">browserscan.org</div>
      <div class="footer-text">
        This report certifies the browser fingerprint analysis performed on ${dateFormatted}.<br>
        Report ID: ${escapeHtml(report.meta.scan_id)} | Version: ${escapeHtml(report.meta.version)}
      </div>
    </div>
  </div>

  <button class="print-button no-print" onclick="window.print()">
    Save as PDF
  </button>
</body>
</html>`;
}

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#10b981';
  if (grade.startsWith('B')) return '#22c55e';
  if (grade.startsWith('C')) return '#f59e0b';
  if (grade.startsWith('D')) return '#f97316';
  return '#ef4444';
}

function getGradeColorLight(grade: string): string {
  if (grade.startsWith('A')) return '#ecfdf5';
  if (grade.startsWith('B')) return '#f0fdf4';
  if (grade.startsWith('C')) return '#fffbeb';
  if (grade.startsWith('D')) return '#fff7ed';
  return '#fef2f2';
}

/**
 * Generate PDF filename
 */
export function generatePdfFilename(scanId: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `browserscan-report-${scanId.slice(0, 8)}-${date}.pdf`;
}
