'use client';

import Link from 'next/link';
import { SoftwarePanel } from '@/components/sections/software-panel';
import { ConsistencyMatrix } from '@/components/sections/consistency-matrix';
import { useLiveReport } from '@/lib/use-live-report';

export default function SoftwareReportPage() {
  const { data: report, isLoading } = useLiveReport();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-zinc-800"></div>
          <div className="h-4 w-full max-w-md rounded bg-zinc-800"></div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
          <p className="text-zinc-400">No scan data available. Please run a scan first.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-sky-400 hover:text-sky-300">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/report" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Report</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">Software Layer</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Fonts, Locale & Navigator</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Locale configuration analysis, language preference matrix, font hash enumeration, and browser properties.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        <Link href="/report/network" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Network</Link>
        <Link href="/report/hardware" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Hardware</Link>
        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">Software</span>
        <Link href="/report/consistency" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Consistency</Link>
      </div>

      {/* Software Panel */}
      <SoftwarePanel report={report} />

      {/* Consistency Preview */}
      <ConsistencyMatrix consistency={report.consistency} />

      {/* Info Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Software Detection Explained</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-violet-400">Font Enumeration</p>
            <p className="mt-1 text-xs text-zinc-500">
              Installed fonts create unique signatures. Custom fonts, font variations, and rendering differences identify systems.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-amber-400">Locale Signals</p>
            <p className="mt-1 text-xs text-zinc-500">
              Timezone, language preferences, and regional settings reveal geographic location and user configuration.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-400">Navigator API</p>
            <p className="mt-1 text-xs text-zinc-500">
              Browser properties like user agent, platform, plugins, and feature flags identify browser versions.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Software Fingerprinting: The Digital Clues You Leave Behind
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me explain something that most people miss. When we talk about browser fingerprinting,
            everyone focuses on the fancy stuff - canvas rendering, WebGL shaders, audio processing.
            But some of the most powerful fingerprinting comes from the boring stuff. Your installed
            fonts. Your timezone. Your language settings. Your browser plugins. These mundane details
            combine to create a surprisingly unique signature.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            According to the EFF&apos;s Panopticlick study of approximately one million visitors, 83.6%
            of browsers had a unique fingerprint. Among those with Flash or Java enabled, that number
            jumped to 94.2%. The researchers found that a typical browser fingerprint contains at least
            18.1 bits of entropy - meaning if you pick a browser at random, only one in 286,777 others
            would share its exact fingerprint.
          </p>
        </div>

        {/* Entropy Statistics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Entropy: How Much Do Your Settings Reveal?
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Entropy is measured in bits. Think of it like this: 1 bit of entropy means there are 2
            possibilities (like a coin flip). 10 bits means 1,024 possibilities. 18 bits means over
            262,000 possibilities. The more bits of entropy a data point contributes, the more it
            narrows down who you might be.
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Fingerprint Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Entropy (Bits)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Unique Combinations</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Browser Plugins</td>
                  <td className="px-4 py-3 font-mono text-rose-400">15.4 bits</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">~43,000 variations</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Installed Fonts</td>
                  <td className="px-4 py-3 font-mono text-amber-400">13.9 bits</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">~15,000 variations</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">User Agent String</td>
                  <td className="px-4 py-3 font-mono text-sky-400">10.0 bits</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">~1,024 variations</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Canvas Fingerprint</td>
                  <td className="px-4 py-3 font-mono text-violet-400">5.7 bits</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">~52 variations</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Timezone</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">3-4 bits</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">~24 variations</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Source: Eckersley&apos;s Panopticlick Study (EFF). Note that 30+ bits of entropy would be
            enough to uniquely identify every person on Earth. Most browsers exceed 18 bits.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Font Fingerprinting: Your Fonts Are Snitching On You
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is something wild: 34% of people can be identified just by the fonts installed on
            their system. Not by their browsing history, not by cookies - just fonts. Every time you
            install a new application, it often adds fonts. Adobe Creative Suite? That adds dozens.
            Microsoft Office? More fonts. That game you installed? Probably came with custom fonts too.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Websites detect your fonts using a clever technique. They create invisible text elements
            with fallback fonts and measure the exact pixel dimensions. If Arial renders at 14.32 pixels
            wide, but your text renders at 14.28 pixels, they know you have a different font installed.
            By testing hundreds of font names, they can map your entire font library without any
            permission prompts.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">High Entropy Fonts</h3>
              <p className="text-xs text-zinc-500">
                Adobe fonts, professional typography packages, design software bundles, and regional
                fonts (CJK, Arabic, Hebrew) contribute the most entropy. Having Helvetica Neue from
                Adobe CC immediately narrows you down.
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Low Entropy Fonts</h3>
              <p className="text-xs text-zinc-500">
                System default fonts (Arial, Times New Roman, Verdana) are shared by billions. Sticking
                to default fonts reduces your font fingerprint entropy significantly.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Timezone: A 24-Hour Problem
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Your timezone seems innocent enough. There are only about 24 major timezones, right?
            Wrong. JavaScript reports your timezone offset in minutes from UTC. This includes quirky
            offsets like India (UTC+5:30), Nepal (UTC+5:45), and Australian Central (UTC+9:30). Even
            within the same UTC offset, the specific timezone name (America/New_York vs America/Detroit)
            can be detected.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            More importantly, timezone is a consistency check. If your IP says you are in Germany but
            your browser timezone says America/Los_Angeles, that is a red flag. Fraud detection systems
            heavily weight timezone mismatches because legitimate users rarely have this inconsistency.
            VPN users often forget to change their system timezone when switching server locations.
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">Timezone Detection Methods</h3>
            <div className="grid gap-4 md:grid-cols-3 text-xs">
              <div>
                <p className="text-amber-400 font-medium mb-2">getTimezoneOffset()</p>
                <p className="text-zinc-500">
                  Returns minutes from UTC. Simple but reveals your raw offset (e.g., -480 for PST).
                </p>
              </div>
              <div>
                <p className="text-sky-400 font-medium mb-2">Intl.DateTimeFormat()</p>
                <p className="text-zinc-500">
                  Returns the IANA timezone name like &quot;America/New_York&quot;. More specific than offset.
                </p>
              </div>
              <div>
                <p className="text-emerald-400 font-medium mb-2">Date Formatting</p>
                <p className="text-zinc-500">
                  Locale-specific date formatting reveals regional preferences and DST handling.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Language Preferences: Speaking Your Identity
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Your browser sends an Accept-Language header with every request. It looks something like
            &quot;en-US,en;q=0.9,es;q=0.8,fr;q=0.7&quot;. This reveals not just your primary language but your
            fallback preferences and their priority weights. A native Spanish speaker living in the US
            might have &quot;es-MX,es;q=0.9,en-US;q=0.8&quot; - very different from a native English speaker.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The navigator.languages array exposes this same information to JavaScript. Combined with
            navigator.language (singular), scripts can detect mismatches that indicate spoofing attempts.
            If your HTTP header says &quot;en-US&quot; but JavaScript returns &quot;zh-CN&quot;, something is wrong.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Accept-Language Header</h3>
              <p className="text-xs text-zinc-500">
                Sent with HTTP requests. Shows language preferences with quality factors.
                Example: en-US,en;q=0.9 means English (US) preferred, then generic English at 90% weight.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">navigator.languages</h3>
              <p className="text-xs text-zinc-500">
                JavaScript array of preferred languages in order. Should match Accept-Language.
                Mismatches indicate VPN, proxy, or browser spoofing attempts.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            User Agent: The Biggest Lie Your Browser Tells
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The User Agent string is both the most visible fingerprint and the most unreliable. Every
            browser sends one. It looks something like: &quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64)
            AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36&quot;. Notice how Chrome
            claims to be Mozilla, AppleWebKit, KHTML, AND Safari? That is for backwards compatibility
            with servers that only served content to specific browsers.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The User Agent contributes about 10 bits of entropy - enough to narrow you down to roughly
            1,000 possibilities. But here is the catch: it is trivially easy to spoof. Any browser
            extension can change it. This is why sophisticated fingerprinting does not rely on User
            Agent alone. Instead, they check if your User Agent matches your actual browser behavior.
            Claiming to be Chrome 120 while having Firefox&apos;s JavaScript quirks? Busted.
          </p>
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
            <h3 className="mb-2 text-sm font-medium text-rose-400">Why User Agent Spoofing Often Fails</h3>
            <ul className="space-y-1 text-xs text-zinc-500">
              <li>• JavaScript engine differences (V8 vs SpiderMonkey vs JavaScriptCore)</li>
              <li>• CSS feature support mismatches</li>
              <li>• DOM API implementation quirks</li>
              <li>• Navigator properties inconsistencies</li>
              <li>• Error message format differences between engines</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Navigator Object: More Than Meets the Eye
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            JavaScript&apos;s navigator object is a goldmine of information. Beyond user agent and language,
            it exposes: platform (Win32, MacIntel, Linux x86_64), whether cookies are enabled, whether
            Do Not Track is set, the number of CPU cores, device memory, network connection type, and
            even battery status on some browsers. Each property adds entropy to your fingerprint.
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">What It Reveals</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Privacy Risk</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">navigator.platform</td>
                  <td className="px-4 py-3 text-xs">OS and architecture</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Medium</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">navigator.plugins</td>
                  <td className="px-4 py-3 text-xs">Installed browser plugins</td>
                  <td className="px-4 py-3 text-xs text-rose-400">High (15.4 bits)</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">navigator.doNotTrack</td>
                  <td className="px-4 py-3 text-xs">DNT preference (ironic)</td>
                  <td className="px-4 py-3 text-xs text-amber-400">Low-Medium</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">navigator.maxTouchPoints</td>
                  <td className="px-4 py-3 text-xs">Touch screen capability</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Medium</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">navigator.connection</td>
                  <td className="px-4 py-3 text-xs">Network type and speed</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Low</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How to Reduce Your Software Fingerprint
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The goal is not to have no fingerprint - that is impossible. The goal is to have a common
            fingerprint shared by millions. Here are practical steps:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Use Default Settings</h3>
              <p className="text-xs text-zinc-500">
                Stock browser configurations are shared by millions. Every customization makes you more
                unique. Resist the urge to install fancy fonts or unusual plugins.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Match Your Location</h3>
              <p className="text-xs text-zinc-500">
                If using VPN, ensure your timezone and language match your apparent location. Timezone
                mismatches are major red flags for fraud detection.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Tor Browser</h3>
              <p className="text-xs text-zinc-500">
                Forces uniform settings across all users. Same timezone (UTC), same fonts, same
                navigator values. All Tor users look identical to fingerprinting scripts.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Firefox with RFP</h3>
              <p className="text-xs text-zinc-500">
                Resist Fingerprinting mode (privacy.resistFingerprinting) spoofs many values to common
                defaults. Reduces uniqueness significantly while maintaining usability.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Your Software Report
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Font Hash</h3>
              <p className="text-xs text-zinc-500">
                A hash of your detected fonts. Common hashes (default OS fonts only) are shared by many.
                Unique hashes indicate custom fonts that make you more identifiable.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Timezone Analysis</h3>
              <p className="text-xs text-zinc-500">
                Shows your detected timezone and whether it matches your IP geolocation. Mismatches
                are flagged as potential VPN or proxy usage.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Language Matrix</h3>
              <p className="text-xs text-zinc-500">
                Compares HTTP Accept-Language with JavaScript navigator.languages. Inconsistencies
                indicate browser modification or spoofing attempts.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Navigator Properties</h3>
              <p className="text-xs text-zinc-500">
                Key navigator values that contribute to your fingerprint. Unusual values or combinations
                increase your uniqueness and tracking potential.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
