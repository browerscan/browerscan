import Link from 'next/link';

export const metadata = {
  title: 'Deep Report — BrowserScan',
  description: 'Comprehensive browser fingerprint analysis with network, hardware, software, and consistency intelligence.'
};

const reportSections = [
  {
    href: '/report/network',
    title: 'Network Intelligence',
    desc: 'ASN analysis, JA3/JA4 fingerprints, TLS protocol stacks, and leak telemetry from edge detection.',
    icon: '🌐',
    color: 'border-emerald-500/30 hover:border-emerald-500/50'
  },
  {
    href: '/report/hardware',
    title: 'Hardware Fingerprints',
    desc: 'Canvas signatures, WebGL renderer analysis, GPU vendor detection, and sensor data collection.',
    icon: '🖥️',
    color: 'border-sky-500/30 hover:border-sky-500/50'
  },
  {
    href: '/report/software',
    title: 'Software Surface',
    desc: 'Font enumeration, locale configuration, language matrix, and navigator properties analysis.',
    icon: '📦',
    color: 'border-violet-500/30 hover:border-violet-500/50'
  },
  {
    href: '/report/consistency',
    title: 'Consistency Analysis',
    desc: 'Cross-reference timezone, language, and OS signals with IP-derived geolocation intelligence.',
    icon: '🔍',
    color: 'border-amber-500/30 hover:border-amber-500/50'
  }
];

export default function ReportIndexPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Dashboard</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Analysis</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Deep Detection Report</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Navigate through forensic evidence layers supporting your browser trust score.
          Each section reveals different detection signals used in fingerprint analysis.
        </p>
      </div>

      {/* Section Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {reportSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`block rounded-2xl border bg-black/40 p-6 transition hover:-translate-y-1 hover:bg-black/60 ${section.color}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{section.icon}</span>
              <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-100">{section.title}</h3>
            <p className="mt-2 text-sm text-zinc-500">{section.desc}</p>
          </Link>
        ))}
      </div>

      {/* Analysis Overview */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">What We Analyze</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-emerald-400">Active Signals</p>
            <ul className="space-y-1 text-xs text-zinc-500">
              <li>Canvas & WebGL rendering</li>
              <li>Audio context fingerprinting</li>
              <li>Font enumeration</li>
              <li>WebRTC leak detection</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-sky-400">Passive Signals</p>
            <ul className="space-y-1 text-xs text-zinc-500">
              <li>TLS/JA3 fingerprinting</li>
              <li>HTTP header analysis</li>
              <li>IP geolocation</li>
              <li>DNS resolver detection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="rounded-xl border border-dashed border-zinc-800 p-4">
        <p className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-400">Tip:</span> Start with Network Intelligence to understand
          how your connection appears to detection systems, then explore hardware and software fingerprints.
        </p>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What is Browser Fingerprinting and Why Does It Matter
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Every time you visit a website, your browser broadcasts dozens of data points about
            itself. Your screen resolution. Your timezone. The fonts installed on your system.
            How your graphics card renders certain images. The exact version of every plugin
            you have installed. Individually, these seem harmless. Combined, they create a
            fingerprint that is often unique to you among millions of internet users.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The Electronic Frontier Foundation found that 94% of browsers they tested were
            uniquely identifiable through fingerprinting alone. No cookies needed. No login
            required. Just the information your browser automatically shares. This is not
            some theoretical privacy concern. Major advertising networks, social media platforms,
            and fraud detection systems use fingerprinting every day to track and identify users.
          </p>
        </div>

        {/* Fingerprint Uniqueness Stats */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Browser Fingerprint Uniqueness Statistics</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">94%</p>
              <p className="mt-1 text-xs text-zinc-500">Browsers uniquely identifiable</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-sky-400">81%</p>
              <p className="mt-1 text-xs text-zinc-500">Unique fingerprints (alternative studies)</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">90%+</p>
              <p className="mt-1 text-xs text-zinc-500">Attributes unchanged after 6 months</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-violet-400">150ms</p>
              <p className="mt-1 text-xs text-zinc-500">Time to collect full fingerprint</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Sources: EFF Panopticlick, SECURWARE 2024 Research Papers
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Network Intelligence: What Your Connection Reveals
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Your IP address is just the beginning. When you connect to a website through our
            platform, we analyze your connection at multiple layers. We identify your Autonomous
            System Number (ASN), which tells us which network you are connecting from. We detect
            if you are using a VPN, proxy, or Tor exit node. We check your TLS fingerprint using
            JA3 and JA4 algorithms, which can identify your browser type even if you spoof your
            user agent.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The Network Intelligence report shows you everything a sophisticated website can
            learn from your connection. This includes leak detection for WebRTC and DNS, which
            can expose your real IP address even when using anonymization tools. If there is
            a mismatch between your claimed location and your actual network origin, we will
            flag it. These are the same techniques used by banks, streaming services, and fraud
            detection systems.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Hardware Fingerprints: Your Device is More Unique Than You Think
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Canvas fingerprinting is one of the most powerful tracking techniques available.
            When a website asks your browser to render a hidden image, tiny differences in
            how your graphics card, operating system, and fonts handle that rendering create
            a unique signature. Two computers running the same browser can produce completely
            different canvas fingerprints because of subtle hardware differences.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            WebGL fingerprinting goes even deeper. It queries your graphics card for information
            about its capabilities, vendor, and renderer. This can identify your specific GPU
            model and even distinguish between different driver versions. Audio fingerprinting
            analyzes how your system processes audio signals. Screen resolution, color depth,
            and touch support add more data points. Combined, your hardware creates a fingerprint
            that persists across browser sessions and even across different browsers on the same
            machine.
          </p>
        </div>

        {/* Fingerprinting Techniques Table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Common Fingerprinting Techniques</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-3 text-left text-xs font-medium text-zinc-500">Technique</th>
                  <th className="pb-3 text-left text-xs font-medium text-zinc-500">Data Collected</th>
                  <th className="pb-3 text-right text-xs font-medium text-zinc-500">Entropy</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 text-emerald-400">Canvas Fingerprint</td>
                  <td className="py-3 text-zinc-400">Rendered image hash from HTML5 canvas</td>
                  <td className="py-3 text-right font-mono">High</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 text-sky-400">WebGL Fingerprint</td>
                  <td className="py-3 text-zinc-400">GPU vendor, renderer, extensions</td>
                  <td className="py-3 text-right font-mono">High</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 text-amber-400">Font Enumeration</td>
                  <td className="py-3 text-zinc-400">Installed system fonts list</td>
                  <td className="py-3 text-right font-mono">Medium-High</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 text-violet-400">Audio Fingerprint</td>
                  <td className="py-3 text-zinc-400">AudioContext oscillator processing</td>
                  <td className="py-3 text-right font-mono">Medium</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3 text-rose-400">Screen Properties</td>
                  <td className="py-3 text-zinc-400">Resolution, color depth, pixel ratio</td>
                  <td className="py-3 text-right font-mono">Medium</td>
                </tr>
                <tr>
                  <td className="py-3 text-orange-400">TLS Fingerprint</td>
                  <td className="py-3 text-zinc-400">JA3/JA4 cipher suite ordering</td>
                  <td className="py-3 text-right font-mono">High</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Software Surface: The Configuration That Identifies You
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Beyond hardware, your software configuration creates another layer of identification.
            The fonts installed on your system are particularly revealing. A graphic designer
            with Adobe Creative Suite has a completely different font list than a developer
            running a minimal Linux setup. Your timezone setting can confirm your geographic
            location. Your language preferences and keyboard layouts indicate your nationality
            and language skills.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Navigator properties reveal your browser version, operating system, platform, and
            installed plugins. Even the order in which your browser reports its capabilities
            can be distinctive. Do you have Do Not Track enabled? What is your cookie policy?
            Does your browser support WebGL 2.0? Each answer adds another bit of information
            to your fingerprint.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Consistency Analysis: Finding Spoofing and Fraud
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            One of the most powerful detection techniques is cross-referencing multiple signals.
            If your IP address says you are in Germany, but your timezone is set to Eastern US,
            that is suspicious. If your browser claims to be Chrome on macOS but your canvas
            fingerprint matches Windows rendering, something is wrong. If your declared language
            is English but your keyboard layout is Cyrillic, that raises questions.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The Consistency Analysis report identifies these mismatches. Anti-detect browsers
            and spoofing tools often fail here because maintaining perfect consistency across
            dozens of signals is extremely difficult. Fraud detection systems specifically
            look for these inconsistencies as indicators of bot activity, account takeover
            attempts, or identity fraud.
          </p>
        </div>

        {/* Trust Score Breakdown */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">How Detection Signals Affect Trust Score</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">VPN or Proxy Detected</span>
              <span className="font-mono text-rose-400">-15 points</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">WebRTC IP Leak</span>
              <span className="font-mono text-rose-400">-20 points</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Timezone Mismatch</span>
              <span className="font-mono text-rose-400">-10 points</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Canvas Anomaly</span>
              <span className="font-mono text-rose-400">-10 points</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Bot-like Behavior</span>
              <span className="font-mono text-rose-400">-25 points</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Tor Exit Node</span>
              <span className="font-mono text-rose-400">-30 points</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Who Uses These Reports and Why
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Privacy Researchers</h3>
              <p className="text-xs text-zinc-500">
                Academic researchers studying tracking technologies, browser privacy, and
                fingerprinting countermeasures use detailed reports to understand the current
                state of web tracking and develop better protections.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Security Professionals</h3>
              <p className="text-xs text-zinc-500">
                Penetration testers and red team operators need to understand how their browsers
                appear to detection systems. A visible fingerprint anomaly can blow an entire
                security assessment.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Fraud Prevention Teams</h3>
              <p className="text-xs text-zinc-500">
                Understanding what legitimate fingerprints look like helps fraud teams build
                better detection rules. They study normal variation to distinguish it from
                suspicious spoofing attempts.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Privacy-Conscious Users</h3>
              <p className="text-xs text-zinc-500">
                If you use privacy tools like Tor, VPNs, or anti-fingerprinting extensions,
                these reports show you how effective they actually are. Many tools claim
                protection they do not deliver.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Privacy Implications of Fingerprinting
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Unlike cookies, browser fingerprinting does not require storing anything on your
            device. There is no cookie consent banner because technically nothing is being
            written to your computer. GDPR and similar privacy laws often provide limited
            protection because fingerprinting falls into a gray area. You cannot clear your
            fingerprint like you can clear cookies. You cannot opt out in any meaningful way
            without dramatically changing your browser configuration.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The Tor Browser and some privacy-focused browsers attempt to standardize fingerprints
            so all users look identical. This helps, but it comes with performance costs and
            compatibility issues. More importantly, using Tor or obvious privacy tools can
            itself be a signal that marks you as suspicious to detection systems. There is
            no perfect solution, only tradeoffs.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Making Sense of Your Results
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            When you run a scan, we present your results across four categories: Network,
            Hardware, Software, and Consistency. Each section shows you specific data points
            that websites can collect about you. Red flags indicate potential privacy concerns
            or detection signals. Green indicators show where your configuration looks normal
            and consistent.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Your overall trust score summarizes how trustworthy your browser appears to
            detection systems. A high score means you look like a normal, legitimate user.
            A low score means something about your configuration or behavior appears suspicious.
            Use the detailed reports to understand exactly what is causing any issues and
            decide whether you want to address them.
          </p>
        </div>
      </section>
    </div>
  );
}
