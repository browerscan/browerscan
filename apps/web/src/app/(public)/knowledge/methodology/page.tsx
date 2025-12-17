import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browser Fingerprinting Scoring Methodology — Complete Trust Score Algorithm | BrowserScan',
  description: 'Deep-dive technical documentation on how BrowserScan calculates trust scores using multi-layered fingerprinting, network analysis, and behavioral telemetry. Learn the exact deduction rules and detection algorithms.',
  keywords: ['browser fingerprinting methodology', 'trust score algorithm', 'fingerprint detection', 'bot detection scoring', 'privacy analysis'],
};

const rules = [
  { check: 'IP Risk', condition: 'fraud_score > 75 or proxy detected', deduction: 20, category: 'Network', description: 'High-risk IP addresses from known proxy providers, VPN services, or data centers associated with fraudulent activity.' },
  { check: 'WebRTC Leak', condition: 'candidate IP differs from remote', deduction: 25, category: 'Leak', description: 'WebRTC peer connections expose local or different public IP addresses, bypassing VPN protection.' },
  { check: 'DNS Leak', condition: 'DNS resolver location mismatch', deduction: 15, category: 'Leak', description: 'DNS queries routed through ISP servers instead of VPN tunnel, exposing geographic location.' },
  { check: 'Timezone', condition: 'IP timezone mismatches system', deduction: 15, category: 'Consistency', description: 'System timezone configuration does not match expected timezone for IP geolocation.' },
  { check: 'OS Consistency', condition: 'UA OS ≠ TCP/WebGL OS', deduction: 15, category: 'Consistency', description: 'Operating system reported in User-Agent differs from TCP/IP stack or WebGL renderer signatures.' },
  { check: 'Language', condition: 'IP country not in Accept-Language', deduction: 5, category: 'Consistency', description: 'Browser language preferences do not include language typical for IP country.' },
  { check: 'Open Ports', condition: 'Critical ports (22/3389) exposed', deduction: 10, category: 'Network', description: 'SSH, RDP, or other administrative ports reachable from public internet.' },
  { check: 'Bot Check', condition: 'webdriver/headless markers', deduction: 30, category: 'Automation', description: 'Selenium WebDriver, Puppeteer, or headless browser automation signatures detected.' },
  { check: 'Canvas Anomaly', condition: 'Spoofed or blocked canvas', deduction: 10, category: 'Fingerprint', description: 'Canvas fingerprint is blocked, randomized, or inconsistent with hardware profile.' },
  { check: 'WebGL Mismatch', condition: 'GPU vendor inconsistent', deduction: 10, category: 'Fingerprint', description: 'WebGL renderer/vendor strings do not match expected values for reported hardware.' }
];

const categoryColors: Record<string, string> = {
  Network: 'bg-emerald-500/10 text-emerald-400',
  Leak: 'bg-rose-500/10 text-rose-400',
  Consistency: 'bg-amber-500/10 text-amber-400',
  Automation: 'bg-violet-500/10 text-violet-400',
  Fingerprint: 'bg-sky-500/10 text-sky-400'
};

export default function MethodologyPage() {
  return (
    <article className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      {/* Header */}
      <header>
        <Link href="/knowledge" className="text-xs text-zinc-500 hover:text-zinc-400">
          ← Back to Knowledge Base
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">
          Technical Documentation
        </p>
        <h1 className="text-4xl font-semibold text-zinc-50">
          Browser Trust Score Methodology
        </h1>
        <p className="mt-3 text-base text-zinc-400 leading-relaxed">
          BrowserScan uses a deterministic scoring algorithm that evaluates browser fingerprints
          across five key dimensions: network integrity, leak detection, consistency analysis,
          automation detection, and fingerprint authenticity. Here is exactly how it works.
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
          <span>Last updated: November 2024</span>
          <span className="h-1 w-1 rounded-full bg-zinc-600" />
          <span>Algorithm version: 1.0.0</span>
        </div>
      </header>

      {/* Introduction Section */}
      <section className="prose prose-invert max-w-none">
        <h2 className="text-xl font-semibold text-zinc-100">What Is a Browser Trust Score?</h2>
        <p className="text-zinc-400 leading-relaxed">
          A browser trust score is a numerical representation of how &quot;normal&quot; and &quot;authentic&quot;
          your browser appears to websites and online services. Think of it like a credit score,
          but for your browser identity. A score of 100 means your browser looks exactly like a
          regular user with no red flags. Lower scores indicate inconsistencies, privacy tool
          usage, or automation markers that might trigger additional verification or blocks.
        </p>
        <p className="text-zinc-400 leading-relaxed">
          Unlike simple IP reputation checks, BrowserScan performs deep analysis across multiple
          data layers. We examine network-level signals (your IP, ASN, TLS fingerprint),
          browser-level fingerprints (Canvas, WebGL, Audio context, fonts), and behavioral
          patterns (mouse movements, typing rhythm, scroll behavior) to build a comprehensive
          picture of browser authenticity.
        </p>
      </section>

      {/* How Scoring Works */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">How the Scoring Algorithm Works</h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          The BrowserScan Trust Score starts at 100 and applies deductions for each detected
          anomaly. This subtractive approach means a perfect score requires zero issues detected
          across all checks. Each check is independent and deductions stack, so multiple issues
          compound to lower your score significantly.
        </p>

        {/* Score Overview */}
        <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 p-6">
          <div className="grid gap-6 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-400">100</p>
              <p className="mt-1 text-xs text-zinc-500">Starting Score</p>
              <p className="text-xs text-zinc-600">Every session begins here</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-sky-400">A+</p>
              <p className="mt-1 text-xs text-zinc-500">90-100 Points</p>
              <p className="text-xs text-zinc-600">Excellent browser hygiene</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-400">C</p>
              <p className="mt-1 text-xs text-zinc-500">50-69 Points</p>
              <p className="text-xs text-zinc-600">Some issues detected</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-rose-400">F</p>
              <p className="mt-1 text-xs text-zinc-500">&lt;50 Points</p>
              <p className="text-xs text-zinc-600">Significant red flags</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detection Categories Explanation */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-zinc-100">The Five Detection Categories</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <h3 className="font-semibold text-emerald-400">Network Analysis</h3>
            <p className="mt-2 text-sm text-zinc-400">
              We analyze your IP address reputation, ASN ownership, and network characteristics.
              Data center IPs, known proxy providers, and Tor exit nodes are flagged. We also
              check for exposed administrative ports that could indicate compromised systems.
            </p>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
            <h3 className="font-semibold text-rose-400">Leak Detection</h3>
            <p className="mt-2 text-sm text-zinc-400">
              WebRTC and DNS leaks are the most common ways VPNs fail to protect privacy.
              We detect when your real IP or ISP DNS servers are exposed through browser APIs,
              even when you think you are protected by a VPN or proxy.
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <h3 className="font-semibold text-amber-400">Consistency Checks</h3>
            <p className="mt-2 text-sm text-zinc-400">
              We cross-reference multiple data sources to detect inconsistencies. Your timezone,
              language settings, operating system signatures, and geographic indicators should
              all align. Mismatches suggest spoofing or misconfiguration.
            </p>
          </div>

          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
            <h3 className="font-semibold text-violet-400">Automation Detection</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Headless browsers and automation tools like Selenium, Puppeteer, and Playwright
              leave detectable signatures. We check for WebDriver flags, headless markers,
              and other indicators of automated browser sessions.
            </p>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-5 md:col-span-2">
            <h3 className="font-semibold text-sky-400">Fingerprint Authenticity</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Browser fingerprints should be internally consistent. Canvas rendering, WebGL
              capabilities, audio context characteristics, and font lists should match what
              we expect from your reported hardware and operating system. Anti-fingerprinting
              tools that randomize these values create detectable anomalies.
            </p>
          </div>
        </div>
      </section>

      {/* Detection Rules Table */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">Complete Deduction Rules</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Below is the complete list of checks BrowserScan performs. Each rule is evaluated
          independently and multiple violations stack. The condition column shows the exact
          trigger for each deduction.
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-black/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Check</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Trigger Condition</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400">Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {rules.map((rule) => (
                  <tr key={rule.check} className="hover:bg-zinc-900/30">
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-zinc-200">{rule.check}</p>
                      <p className="mt-1 text-xs text-zinc-500">{rule.description}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${categoryColors[rule.category]}`}>
                        {rule.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-500 font-mono">{rule.condition}</td>
                    <td className="px-4 py-4 text-right text-lg font-bold text-rose-400">-{rule.deduction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Data Collection Process */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">How We Collect Data</h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          BrowserScan uses a multi-stage collection process that combines server-side
          enrichment with client-side fingerprinting. Here is the exact flow:
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-zinc-900/50 p-5 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">1</span>
              <p className="text-sm font-medium text-emerald-400">Edge Enrichment</p>
            </div>
            <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
              Your request hits our Cloudflare Worker which extracts ASN, country, city,
              TLS fingerprint (JA3), and HTTP version before any JavaScript runs.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-5 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-400">2</span>
              <p className="text-sm font-medium text-sky-400">Client Fingerprinting</p>
            </div>
            <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
              Browser JavaScript collects Canvas hash, WebGL renderer, Audio context,
              Font enumeration, WebRTC candidates, screen dimensions, and timezone.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-5 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400">3</span>
              <p className="text-sm font-medium text-violet-400">Server Processing</p>
            </div>
            <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
              Our API correlates client and server data, queries IP intelligence services,
              runs all detection rules, calculates score, and persists to D1 database.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-5 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">4</span>
              <p className="text-sm font-medium text-amber-400">Report Delivery</p>
            </div>
            <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
              Complete report JSON is returned to the frontend for real-time display.
              Optionally, PDF reports are generated and stored in R2 for download.
            </p>
          </div>
        </div>
      </section>

      {/* Grade Scale */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">Grade Scale Breakdown</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Your final score maps to a letter grade. Here is what each grade means:
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-black/40 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-10 text-xl font-bold text-emerald-400">A+</span>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
              </div>
            </div>
            <div className="w-48 text-right">
              <span className="text-sm text-zinc-200">95-100</span>
              <p className="text-xs text-zinc-500">Perfect or near-perfect browser</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-10 text-xl font-bold text-emerald-400">A</span>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-full w-[90%] rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="w-48 text-right">
              <span className="text-sm text-zinc-200">90-94</span>
              <p className="text-xs text-zinc-500">Minor issues, very trustworthy</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-10 text-xl font-bold text-sky-400">B</span>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-full w-[80%] rounded-full bg-sky-500" />
              </div>
            </div>
            <div className="w-48 text-right">
              <span className="text-sm text-zinc-200">70-89</span>
              <p className="text-xs text-zinc-500">Some flags, generally acceptable</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-10 text-xl font-bold text-amber-400">C</span>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-full w-[60%] rounded-full bg-amber-500" />
              </div>
            </div>
            <div className="w-48 text-right">
              <span className="text-sm text-zinc-200">50-69</span>
              <p className="text-xs text-zinc-500">Multiple issues detected</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-10 text-xl font-bold text-rose-400">F</span>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-zinc-800">
                <div className="h-full w-[35%] rounded-full bg-rose-500" />
              </div>
            </div>
            <div className="w-48 text-right">
              <span className="text-sm text-zinc-200">&lt;50</span>
              <p className="text-xs text-zinc-500">Major red flags, likely blocked</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Affects Your Score */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-100">What Affects Your Score?</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h3 className="text-sm font-semibold text-emerald-400">Things That Help</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2"><span className="text-emerald-400">+</span>Residential IP from a major ISP</li>
              <li className="flex gap-2"><span className="text-emerald-400">+</span>Consistent timezone and language</li>
              <li className="flex gap-2"><span className="text-emerald-400">+</span>Standard browser with no extensions blocking fingerprinting</li>
              <li className="flex gap-2"><span className="text-emerald-400">+</span>WebRTC disabled or properly configured VPN</li>
              <li className="flex gap-2"><span className="text-emerald-400">+</span>No automation framework detected</li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h3 className="text-sm font-semibold text-rose-400">Things That Hurt</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2"><span className="text-rose-400">-</span>Data center or VPN IP address</li>
              <li className="flex gap-2"><span className="text-rose-400">-</span>WebRTC leak exposing real IP</li>
              <li className="flex gap-2"><span className="text-rose-400">-</span>Timezone mismatch with IP location</li>
              <li className="flex gap-2"><span className="text-rose-400">-</span>Canvas/WebGL fingerprint blocking</li>
              <li className="flex gap-2"><span className="text-rose-400">-</span>Selenium or Puppeteer detected</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Algorithm Transparency */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">Algorithm Transparency</h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          We believe in transparency. Our scoring algorithm is deterministic, meaning the same
          browser configuration will always produce the same score. There is no machine learning
          or probabilistic modeling involved - just straightforward rule-based evaluation.
        </p>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          When we update the algorithm, we version it and document changes. This ensures
          reproducibility and allows you to understand exactly why your score changed between
          scans. The current algorithm version is displayed in every report.
        </p>

        <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-5">
          <h4 className="text-sm font-medium text-zinc-300">About the Team</h4>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            BrowserScan is built by a team of security researchers and privacy advocates with
            backgrounds in browser fingerprinting research, bot detection systems, and web
            security. Our methodology draws on published academic research and real-world
            experience building anti-fraud systems.
          </p>
        </div>
      </section>

      {/* Technical Notes */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h3 className="text-sm font-semibold text-zinc-200">Technical Notes</h3>
        <ul className="mt-3 space-y-2 text-xs text-zinc-500">
          <li>
            <strong className="text-zinc-400">Data Sources:</strong> IP intelligence from
            ipinfo.io, MaxMind GeoLite2, and proprietary fraud databases.
          </li>
          <li>
            <strong className="text-zinc-400">TLS Fingerprinting:</strong> JA3 hash computed
            from TLS handshake by Cloudflare edge.
          </li>
          <li>
            <strong className="text-zinc-400">Canvas Hashing:</strong> SHA-256 of rendered
            canvas toDataURL output.
          </li>
          <li>
            <strong className="text-zinc-400">WebGL Detection:</strong> WEBGL_debug_renderer_info
            extension queried for GPU vendor/renderer.
          </li>
          <li>
            <strong className="text-zinc-400">Automation Detection:</strong> navigator.webdriver,
            headless markers, and CDP command exposure checks.
          </li>
        </ul>
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-8 text-center">
        <h3 className="text-xl font-semibold text-zinc-100">Ready to Check Your Browser?</h3>
        <p className="text-sm text-zinc-400 max-w-md">
          Run a free scan to see your trust score and get detailed analysis of your
          browser fingerprint across all detection categories.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          Run Free Scan
        </Link>
      </div>
    </article>
  );
}
