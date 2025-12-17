import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Handling — How BrowserScan Protects Your Information',
  description: 'Complete transparency on how BrowserScan handles your data. Learn about our minimal collection practices, automatic deletion policies, encryption standards, and commitment to privacy.',
  keywords: ['browser fingerprint privacy', 'data handling policy', 'privacy policy', 'data retention', 'GDPR compliance'],
};

const retentionPolicies = [
  { data: 'Scan Reports', period: '30 days', storage: 'Cloudflare D1 (SQLite)', encrypted: true, purpose: 'Allow users to retrieve their scan results' },
  { data: 'IP Addresses', period: '30 days', storage: 'SHA-256 with rotating salt', encrypted: true, purpose: 'Fraud prevention and rate limiting' },
  { data: 'PDF Reports', period: '7 days', storage: 'Cloudflare R2', encrypted: true, purpose: 'Downloadable report access' },
  { data: 'WebRTC/DNS Leaks', period: '30 days', storage: 'Detection flags only', encrypted: true, purpose: 'Leak detection accuracy' },
  { data: 'Behavioral Data', period: '24 hours', storage: 'In-memory processing', encrypted: false, purpose: 'Bot detection simulation' },
  { data: 'Canvas/WebGL Hashes', period: '30 days', storage: 'SHA-256 hash only', encrypted: true, purpose: 'Fingerprint consistency analysis' },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      {/* Header */}
      <header>
        <Link href="/knowledge" className="text-xs text-zinc-500 hover:text-zinc-400">
          ← Back to Knowledge Base
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">
          Policy Document
        </p>
        <h1 className="text-4xl font-semibold text-zinc-50">
          Privacy Policy & Data Handling
        </h1>
        <p className="mt-3 text-base text-zinc-400 leading-relaxed">
          At BrowserScan, we believe privacy analysis tools should practice what they preach.
          This document explains exactly what data we collect, how we protect it, and when we
          delete it. No legal jargon, no hidden clauses.
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
          <span>Last updated: November 2024</span>
          <span className="h-1 w-1 rounded-full bg-zinc-600" />
          <span>Version: 1.0</span>
        </div>
      </header>

      {/* TL;DR Section */}
      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <h2 className="text-lg font-semibold text-emerald-400">The Short Version</h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-300">
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">1.</span>
            We collect only what is needed to analyze your browser fingerprint
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">2.</span>
            Your IP address is hashed before storage - we never store it in plain text
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">3.</span>
            All data is automatically deleted within 30 days maximum
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">4.</span>
            We do not use third-party analytics, trackers, or advertising
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">5.</span>
            We never sell, share, or monetize your data in any way
          </li>
        </ul>
      </section>

      {/* Core Principles */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">Our Privacy Principles</h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          These principles guide every decision we make about data handling. They are not
          marketing speak - they are technical constraints built into our infrastructure.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-200">Minimal Collection</h3>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              We collect only the specific data points required to analyze your browser
              fingerprint. Nothing more, nothing less. Every field we collect has a
              documented purpose.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-200">Privacy by Design</h3>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              Privacy protection is not an afterthought - it is built into our
              architecture. IP hashing, automatic deletion, and encryption are
              implemented at the infrastructure level.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-200">Automatic Deletion</h3>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              Data does not linger. Our database has built-in TTL (time-to-live)
              policies that automatically purge data according to our retention
              schedule. No manual intervention required.
            </p>
          </div>
        </div>
      </section>

      {/* What We Collect and Why */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">What We Collect and Why</h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Here is every category of data we collect, why we need it, and exactly how
          long we keep it. If a data type is not listed here, we do not collect it.
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-black/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Data Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Retention</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Storage Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Purpose</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400">Encrypted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {retentionPolicies.map((policy) => (
                  <tr key={policy.data} className="hover:bg-zinc-900/30">
                    <td className="px-4 py-4 text-sm font-medium text-zinc-200">{policy.data}</td>
                    <td className="px-4 py-4 text-sm text-amber-400 font-mono">{policy.period}</td>
                    <td className="px-4 py-4 text-xs text-zinc-500">{policy.storage}</td>
                    <td className="px-4 py-4 text-xs text-zinc-500">{policy.purpose}</td>
                    <td className="px-4 py-4 text-center">
                      {policy.encrypted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How We Protect Your Data */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">How We Protect Your Data</h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Security is not just about encryption. Here are the specific technical measures
          we implement to protect your information at every layer.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold">1</div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">IP Address Anonymization</h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  Your IP address is never stored in plain text. The moment your request hits
                  our server, we compute a SHA-256 hash using a rotating salt. This hash cannot
                  be reversed to recover your original IP. We use the hash only for rate limiting
                  and fraud prevention - never for identification or tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 text-sm font-bold">2</div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Fingerprint Hashing</h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  Canvas images, WebGL renderings, and audio context data are never stored as
                  raw files. We compute cryptographic hashes on the client side before transmission.
                  These hashes are sufficient for fingerprint analysis but cannot be used to
                  reconstruct the original data or identify specific content.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 text-sm font-bold">3</div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">End-to-End Encryption</h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  All data is encrypted in transit using TLS 1.3 with modern cipher suites.
                  Data at rest is encrypted using AES-256. Our Cloudflare infrastructure
                  provides additional encryption layers and secure key management. We never
                  transmit or store sensitive data in plain text.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm font-bold">4</div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Leak Data Sanitization</h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  WebRTC and DNS leak detection data is processed in real-time and immediately
                  sanitized. We store only the detection result (leak detected: yes/no) and
                  anonymized metadata. The raw IP addresses discovered during leak testing are
                  never persisted to our database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Not Do */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <h3 className="text-sm font-semibold text-emerald-400">What We Do</h3>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Collect only data necessary for fingerprint analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Hash all IP addresses before storage</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Encrypt all data at rest and in transit</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Automatically delete data per retention schedule</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Respond to data deletion requests within 30 days</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6">
          <h3 className="text-sm font-semibold text-rose-400">What We Never Do</h3>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Sell or share data with third parties</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Use external analytics, trackers, or ads</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Create advertising or marketing profiles</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Store data longer than necessary</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Track users across sessions or websites</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Infrastructure */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100">Our Infrastructure</h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          BrowserScan runs entirely on Cloudflare infrastructure. We chose Cloudflare for
          its security track record, global edge network, and privacy-respecting data
          handling practices.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-zinc-900/50 p-5 text-center border border-zinc-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-200">Cloudflare Workers</h3>
            <p className="mt-1 text-xs text-zinc-500">Serverless edge compute</p>
            <p className="mt-2 text-xs text-zinc-600">Code runs in 300+ cities worldwide</p>
          </div>

          <div className="rounded-xl bg-zinc-900/50 p-5 text-center border border-zinc-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-200">Cloudflare D1</h3>
            <p className="mt-1 text-xs text-zinc-500">SQLite at the edge</p>
            <p className="mt-2 text-xs text-zinc-600">Built-in encryption and TTL policies</p>
          </div>

          <div className="rounded-xl bg-zinc-900/50 p-5 text-center border border-zinc-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-200">Cloudflare R2</h3>
            <p className="mt-1 text-xs text-zinc-500">Object storage</p>
            <p className="mt-2 text-xs text-zinc-600">PDF reports with auto-expiry</p>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Your Rights</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Regardless of where you are located, you have the following rights regarding your data:
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <span className="text-lg text-emerald-400">1</span>
            <div>
              <p className="text-sm font-medium text-zinc-200">Right to Access</p>
              <p className="text-xs text-zinc-500">Request a copy of any data we have about you</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg text-emerald-400">2</span>
            <div>
              <p className="text-sm font-medium text-zinc-200">Right to Deletion</p>
              <p className="text-xs text-zinc-500">Request immediate deletion of your data</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg text-emerald-400">3</span>
            <div>
              <p className="text-sm font-medium text-zinc-200">Right to Portability</p>
              <p className="text-xs text-zinc-500">Export your data in machine-readable format</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg text-emerald-400">4</span>
            <div>
              <p className="text-sm font-medium text-zinc-200">Right to Object</p>
              <p className="text-xs text-zinc-500">Object to any processing of your data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-6">
        <h3 className="text-sm font-semibold text-zinc-200">Data Requests & Questions</h3>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          For data deletion requests, access requests, or any questions about how we handle
          your data, please contact us through our GitHub repository. We respond to all
          legitimate requests within 30 days, and most requests are processed within 72 hours.
        </p>
        <p className="mt-4 text-xs text-zinc-600">
          This privacy policy is written in plain language by humans, not generated by
          legal templates. We believe you deserve to understand exactly what happens
          with your data without needing a law degree.
        </p>
      </section>
    </article>
  );
}
