'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLiveReport } from '@/lib/use-live-report';

export default function PdfGenPage() {
  const { data: report } = useLiveReport();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generatePdf() {
    if (!report) return;

    setGenerating(true);
    try {
      const response = await fetch(`/api/scan/${report.meta.scan_id}/pdf`, {
        method: 'POST'
      });

      if (response.ok) {
        // Open the HTML report in new tab for printing
        const html = await response.text();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setGenerated(true);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/tools" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Tools</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Tools</p>
        <h1 className="text-3xl font-semibold text-zinc-50">PDF Report Generator</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Export your browser fingerprint analysis as a professional PDF report suitable for audits and documentation.
        </p>
      </div>

      {/* Report Preview Card */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-zinc-500">Current Scan Report</p>
              <p className="mt-1 font-mono text-sm text-zinc-300">#{report.meta.scan_id.slice(0, 12)}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-zinc-100">{report.score.total}</p>
              <p className={`text-sm font-medium ${
                report.score.grade.startsWith('A') ? 'text-emerald-400' :
                report.score.grade.startsWith('B') ? 'text-sky-400' :
                report.score.grade.startsWith('C') ? 'text-amber-400' : 'text-rose-400'
              }`}>
                Grade {report.score.grade}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-black/30 p-4">
              <p className="text-xs text-zinc-500">Identity</p>
              <p className="mt-1 font-mono text-xs text-zinc-300 truncate">{report.identity.ip}</p>
              <p className="text-xs text-zinc-500 truncate">{report.identity.browser}</p>
            </div>
            <div className="rounded-xl bg-black/30 p-4">
              <p className="text-xs text-zinc-500">Location</p>
              <p className="mt-1 text-sm text-zinc-300">{report.identity.location}</p>
            </div>
            <div className="rounded-xl bg-black/30 p-4">
              <p className="text-xs text-zinc-500">Timestamp</p>
              <p className="mt-1 text-sm text-zinc-300">
                {new Date(report.meta.timestamp * 1000).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={generatePdf}
              disabled={generating}
              className="flex-1 rounded-xl border border-sky-500/40 bg-sky-500/10 py-3 text-sm font-medium text-sky-400 transition hover:bg-sky-500/20 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate PDF Report'}
            </button>
          </div>

          {generated && (
            <p className="mt-4 text-center text-sm text-emerald-400">
              Report opened in new tab. Use your browser&apos;s print function to save as PDF.
            </p>
          )}
        </motion.div>
      )}

      {/* Report Contents */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">What&apos;s Included</h3>
        <ul className="mt-4 space-y-3 text-sm text-zinc-400">
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            Trust score with detailed breakdown
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            IP intelligence and geolocation data
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            Browser and device fingerprints
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            WebRTC and DNS leak detection results
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            Consistency check analysis
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            Risk assessment and recommendations
          </li>
        </ul>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why Download Your Browser Fingerprint Report?
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me tell you why this matters. According to the EFF&apos;s Panopticlick project, 94% of tested
            browsers are uniquely identifiable by fingerprinting traits alone. That means your browser is
            basically a name tag that follows you across the internet. A PDF report captures exactly what
            makes your browser unique at this specific moment in time.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The report includes everything: your trust score and how we calculated it, every fingerprint
            attribute we detected, leak test results, and consistency checks. Unlike a screenshot, this
            is structured data you can actually use. Compare fingerprints before and after privacy tool
            changes. Document your testing environment for security audits. Track how browser updates
            affect your uniqueness over time.
          </p>
        </div>

        {/* Fingerprint Statistics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Browser Fingerprinting: The Numbers
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Understanding why fingerprint reports matter requires understanding the scale of fingerprinting:
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Metric</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Percentage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Source</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Browsers uniquely identifiable</td>
                  <td className="px-4 py-3 font-mono text-rose-400">94%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">EFF Panopticlick</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Desktop unique fingerprints</td>
                  <td className="px-4 py-3 font-mono text-amber-400">35.7%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Academic Research 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Mobile unique fingerprints</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">18.5%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Academic Research 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Users concerned about tracking</td>
                  <td className="px-4 py-3 font-mono text-sky-400">70%+</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">User Survey 2024</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Users who understand fingerprinting</td>
                  <td className="px-4 py-3 font-mono text-amber-400">43%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">User Survey 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Notice the gap: 70% of people are concerned about tracking, but only 43% understand how fingerprinting
            works. This report helps bridge that gap by showing you exactly what trackers see.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Use Cases for Browser Fingerprint Reports
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Security Audits</h3>
              <p className="text-xs text-zinc-500">
                Penetration testers document the fingerprint of their testing browser to prove what
                tools and configurations were in use during assessments. The report becomes part of
                the audit trail.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Development Testing</h3>
              <p className="text-xs text-zinc-500">
                When building bot detection or fraud prevention systems, developers compare fingerprint
                reports from different browser configurations to understand what signals distinguish
                legitimate users from automated scripts.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Privacy Analysis</h3>
              <p className="text-xs text-zinc-500">
                Privacy researchers export reports to compare how different browsers, extensions, and
                configurations affect fingerprint uniqueness. The PDF makes it easy to document findings
                for publications or presentations.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Compliance Documentation</h3>
              <p className="text-xs text-zinc-500">
                Organizations may need to document the fingerprint characteristics of corporate browsers
                for security compliance. The PDF provides a standardized format for these records.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What Gets Captured in the Report
          </h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="grid gap-4 text-xs md:grid-cols-2">
              <div>
                <p className="mb-2 font-medium text-zinc-200">Identity Section</p>
                <ul className="space-y-1 text-zinc-500">
                  <li>• Public IP address and geolocation</li>
                  <li>• ISP and ASN information</li>
                  <li>• Browser name and version</li>
                  <li>• Operating system details</li>
                  <li>• Device type classification</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-medium text-zinc-200">Score Section</p>
                <ul className="space-y-1 text-zinc-500">
                  <li>• Overall trust score (0-100)</li>
                  <li>• Letter grade (A through F)</li>
                  <li>• Individual deduction items</li>
                  <li>• Risk factor explanations</li>
                  <li>• Verdict summary</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-medium text-zinc-200">Hardware Section</p>
                <ul className="space-y-1 text-zinc-500">
                  <li>• Canvas fingerprint hash</li>
                  <li>• WebGL renderer information</li>
                  <li>• Screen resolution and color depth</li>
                  <li>• CPU cores and device memory</li>
                  <li>• Audio context fingerprint</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-medium text-zinc-200">Network Section</p>
                <ul className="space-y-1 text-zinc-500">
                  <li>• VPN/proxy detection results</li>
                  <li>• TLS fingerprint (JA3/JA4)</li>
                  <li>• WebRTC leak status</li>
                  <li>• DNS leak test results</li>
                  <li>• IPv6 exposure check</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How PDF Generation Works
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            When you click generate, we create a print-optimized HTML document from your scan data.
            This document opens in a new browser tab. Your browser&apos;s built-in print function then
            converts it to PDF. This approach works everywhere without requiring server-side PDF
            rendering or external dependencies.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The print stylesheet is designed for paper output. Colors are adjusted for readability
            on white backgrounds. Layout adapts to standard page sizes. Headers and footers include
            scan metadata for reference. The result is a professional document suitable for formal
            reporting.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Data Privacy and Reports
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The PDF is generated locally in your browser. Your fingerprint data is not sent to external
            servers for PDF rendering. When you save the PDF, it exists only on your device. We do not
            retain copies of generated reports. The scan data used to create the report follows our
            standard data retention policy: temporary storage for the duration of your session.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Be mindful of who you share reports with. They contain detailed information about your
            browser configuration that could be used for targeting. Redact sensitive sections if
            sharing publicly. The IP address in particular may reveal your approximate location
            unless you were using a VPN during the scan.
          </p>
        </div>
      </section>
    </div>
  );
}
