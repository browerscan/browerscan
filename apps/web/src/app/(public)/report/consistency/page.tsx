'use client';

import Link from 'next/link';
import { ConsistencyMatrix } from '@/components/sections/consistency-matrix';
import { useLiveReport } from '@/lib/use-live-report';

export default function ConsistencyReportPage() {
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
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">Consistency Layer</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Timezone, Language & OS Diff</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Cross-compare system configuration hints with IP-derived intelligence to detect spoofing attempts.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        <Link href="/report/network" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Network</Link>
        <Link href="/report/hardware" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Hardware</Link>
        <Link href="/report/software" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Software</Link>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">Consistency</span>
      </div>

      {/* Consistency Matrix */}
      <ConsistencyMatrix consistency={report.consistency} />

      {/* Detection Rules */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Consistency Checks</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">Pass</span>
            <div>
              <p className="text-sm text-zinc-200">Timezone Match</p>
              <p className="text-xs text-zinc-500">Browser timezone aligns with IP geolocation expected timezone.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">Warn</span>
            <div>
              <p className="text-sm text-zinc-200">Language Mismatch</p>
              <p className="text-xs text-zinc-500">Preferred language differs from IP country&apos;s primary language.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs text-rose-400">Fail</span>
            <div>
              <p className="text-sm text-zinc-200">System Clock Anomaly</p>
              <p className="text-xs text-zinc-500">System time significantly deviates from expected time for claimed timezone.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Why Consistency Matters</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-amber-400">Spoofing Detection</p>
            <p className="mt-1 text-xs text-zinc-500">
              Users attempting to mask their location often forget to align all signals. A VPN to Germany with US timezone screams &quot;fake&quot;.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-rose-400">Bot Identification</p>
            <p className="mt-1 text-xs text-zinc-500">
              Automated tools rarely configure all locale properties correctly. Default or inconsistent values indicate non-human visitors.
            </p>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-dashed border-zinc-800 p-4">
        <p className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-400">Pro Tip:</span> Legitimate privacy tools like VPNs should be configured
          to match the exit node&apos;s locale settings to avoid detection. Time zone, language, and system locale should all align.
        </p>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Consistency Checking: Where Fingerprint Spoofing Falls Apart
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is the reality of browser fingerprinting that most people miss. Having a unique
            fingerprint is not the biggest problem. The biggest problem is having an inconsistent
            fingerprint. Fraud detection systems are not just asking &quot;who are you?&quot; - they are
            asking &quot;does your story make sense?&quot; And most spoofing attempts fail this test miserably.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Think about it like a detective examining a suspect. Individual pieces of evidence might
            be plausible on their own. But when your IP says Germany, your timezone says California,
            your language is set to Chinese, and your OS claims to be Windows while showing Mac fonts -
            that is not a real person. That is someone trying very hard to hide. And ironically, trying
            too hard makes you more suspicious, not less.
          </p>
        </div>

        {/* Fraud Statistics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why Consistency Checking Matters: The Fraud Numbers
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The stakes are enormous. Account takeover fraud reached $2.9 billion in losses in 2024,
            making it the fastest-growing fraud type. When fraudsters try to access accounts, they
            typically fail consistency checks that legitimate users pass without thinking.
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Metric</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">2024 Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Source</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">ATO fraud losses</td>
                  <td className="px-4 py-3 font-mono text-rose-400">$2.9 billion</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Javelin 2025 Study</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Organizations targeted for ATO</td>
                  <td className="px-4 py-3 font-mono text-amber-400">99%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Proofpoint 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Successful account takeovers</td>
                  <td className="px-4 py-3 font-mono text-rose-400">62%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Proofpoint 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">US adults who experienced ATO</td>
                  <td className="px-4 py-3 font-mono text-amber-400">29% (~77M)</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Industry Research</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Attacks using AI/deepfakes</td>
                  <td className="px-4 py-3 font-mono text-violet-400">1 in 3</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Onfido 2024</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Bot-driven login attempts</td>
                  <td className="px-4 py-3 font-mono text-sky-400">48%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Industry Research</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Consistency checking is the first line of defense. When fingerprints do not add up,
            systems can trigger additional verification like 2FA before granting access.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Five Key Consistency Checks
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Professional fraud detection services like PixelScan check hundreds of parameters. But
            five categories matter most. If all five agree with each other, the profile is considered
            realistic. If they do not match, red flags get raised immediately.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">1. Timezone vs IP Location</h3>
              <p className="text-xs text-zinc-500">
                Your IP says Berlin. Your browser timezone says America/Los_Angeles. That is a
                9-hour difference. Real people do not accidentally have this mismatch.
              </p>
            </div>
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">2. Language vs Country</h3>
              <p className="text-xs text-zinc-500">
                IP from Japan, but Accept-Language is en-US only? Possible for expats, but combined
                with other mismatches, it is suspicious.
              </p>
            </div>
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">3. User Agent vs Behavior</h3>
              <p className="text-xs text-zinc-500">
                Claiming to be Chrome 120 but having Firefox&apos;s JavaScript quirks? The User Agent
                is lying, and detection systems know it.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">4. OS vs Hardware</h3>
              <p className="text-xs text-zinc-500">
                User Agent says Windows 11, but canvas fingerprint shows Mac rendering? WebGL says
                Apple GPU? These should never conflict.
              </p>
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-rose-400">5. Browser Version vs Features</h3>
              <p className="text-xs text-zinc-500">
                Claiming Chrome 120 but missing features added in Chrome 90? Or having features from
                Chrome 125? Version spoofing is easily detected.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-500/30 bg-zinc-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-400">Bonus: System Clock</h3>
              <p className="text-xs text-zinc-500">
                If your timezone is UTC+1 but your system clock shows 3 AM when it should be noon,
                something is fundamentally wrong.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How Fraud Detection Uses Consistency
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Modern fraud detection operates on layers. The first layer is basic fingerprinting -
            collecting data points. The second layer is consistency analysis - checking if those
            data points tell a coherent story. The third layer is behavioral analysis - does the
            user act like a human?
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">Detection Flow</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">1</span>
                <div>
                  <p className="text-zinc-300">Collect 300+ data points</p>
                  <p className="text-zinc-500">IP, timezone, language, fonts, canvas, WebGL, audio, navigator properties...</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">2</span>
                <div>
                  <p className="text-zinc-300">Run consistency checks</p>
                  <p className="text-zinc-500">Cross-reference all data points. Flag contradictions and impossible combinations.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">3</span>
                <div>
                  <p className="text-zinc-300">Calculate risk score</p>
                  <p className="text-zinc-500">Each inconsistency adds penalty points. High scores trigger additional verification.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">4</span>
                <div>
                  <p className="text-zinc-300">Make access decision</p>
                  <p className="text-zinc-500">Allow, challenge with 2FA, or block based on risk threshold.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why VPN Users Get Caught
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            VPNs change your IP address. That is all they do. They do not change your timezone, your
            language settings, your fonts, your screen resolution, or any of the hundreds of other
            signals your browser sends. This creates an obvious consistency problem.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is a common scenario: Someone in California connects to a VPN server in Germany to
            appear European. Their IP now says Berlin. But their timezone is still America/Los_Angeles.
            Their language is still en-US. Their fonts are American defaults. Their system clock shows
            it is 3 PM when Berlin time is midnight. To any consistency checker, this person is
            obviously not in Germany.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-rose-400">What VPNs Do Not Change</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• System timezone (still your local time)</li>
                <li>• Browser language preferences</li>
                <li>• Installed fonts and keyboard layouts</li>
                <li>• Screen resolution and color depth</li>
                <li>• WebRTC local IP (without configuration)</li>
                <li>• Canvas and WebGL fingerprints</li>
              </ul>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">How to Stay Consistent</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• Change system timezone to match VPN</li>
                <li>• Update browser language settings</li>
                <li>• Use browser with VPN-aligned locale</li>
                <li>• Disable WebRTC or use browser extension</li>
                <li>• Consider anti-detect browsers for full control</li>
                <li>• Test your configuration before use</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Bot Detection Through Inconsistency
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Bots and automation tools have a consistency problem that is almost impossible to solve.
            Real browsers are incredibly complex - they have quirks, bugs, and behaviors that have
            accumulated over decades of development. Automation frameworks try to mimic this, but
            they always get something wrong.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            48% of login attempts using leaked passwords are bot-driven. These bots need to look like
            real browsers, but they typically run in headless mode, in virtual machines, or in
            environments that do not match their User Agent claims. A browser claiming to run on
            Windows but showing Linux-specific behaviors? A &quot;Chrome&quot; instance missing Chrome&apos;s
            unique JavaScript quirks? Caught.
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">Common Bot Inconsistencies</h3>
            <div className="grid gap-4 md:grid-cols-2 text-xs">
              <div>
                <p className="text-amber-400 font-medium mb-2">Environment Leaks</p>
                <ul className="text-zinc-500 space-y-1">
                  <li>• Headless browser detection flags</li>
                  <li>• Missing plugins that real browsers have</li>
                  <li>• Generic WebGL renderer strings</li>
                  <li>• Automation framework artifacts</li>
                </ul>
              </div>
              <div>
                <p className="text-rose-400 font-medium mb-2">Behavioral Tells</p>
                <ul className="text-zinc-500 space-y-1">
                  <li>• Perfect, machine-like mouse movements</li>
                  <li>• Impossible typing speeds</li>
                  <li>• No scroll momentum or acceleration</li>
                  <li>• Missing micro-interactions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Arms Race: Spoofing vs Detection
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Anti-detect browsers exist specifically to solve the consistency problem. They let you
            create profiles where everything aligns - timezone, language, fonts, hardware fingerprints,
            everything tells the same story. But this is an arms race.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Detection systems now check for things that are impossible to spoof perfectly:
            JavaScript engine behavior differences, CSS rendering quirks, error message formats,
            memory allocation patterns, timing variations. Each browser engine (V8, SpiderMonkey,
            JavaScriptCore) has unique behaviors that cannot be faked by changing surface-level
            properties.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Easy to Spoof</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• User Agent string</li>
                <li>• Timezone offset</li>
                <li>• Language preferences</li>
                <li>• Screen dimensions</li>
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Hard to Spoof</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• Canvas fingerprint</li>
                <li>• WebGL renderer</li>
                <li>• Audio fingerprint</li>
                <li>• Font rendering</li>
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-rose-400">Nearly Impossible</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• JS engine quirks</li>
                <li>• CSS parsing behavior</li>
                <li>• Error message formats</li>
                <li>• Timing characteristics</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Your Consistency Report
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Pass Status</h3>
              <p className="text-xs text-zinc-500">
                Green checks mean your data points align. Timezone matches IP location, language
                makes sense for your region, browser behavior matches User Agent claims.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Warning Status</h3>
              <p className="text-xs text-zinc-500">
                Yellow warnings indicate minor inconsistencies that might be legitimate (expat,
                traveler, multilingual user) but could also indicate spoofing.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Fail Status</h3>
              <p className="text-xs text-zinc-500">
                Red flags mean serious inconsistencies that legitimate users almost never have.
                These would typically trigger additional verification on protected sites.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Overall Score</h3>
              <p className="text-xs text-zinc-500">
                Your consistency score reflects how well your fingerprint data tells a coherent
                story. Higher scores mean you look more like a legitimate user.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
