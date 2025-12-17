import Link from 'next/link';

const footerLinks = {
  tools: [
    { href: '/tools/ip-lookup', label: 'IP Lookup' },
    { href: '/tools/leak-test', label: 'Leak Test' },
    { href: '/tools/port-scan', label: 'Port Scanner' },
    { href: '/tools/cookie-check', label: 'Cookie Analyzer' },
    { href: '/tools/pdf-gen', label: 'PDF Export' }
  ],
  simulation: [
    { href: '/simulation/recaptcha', label: 'reCAPTCHA Test' },
    { href: '/simulation/turnstile', label: 'Turnstile Test' },
    { href: '/simulation/behavior', label: 'Behavior Analysis' }
  ],
  report: [
    { href: '/report/network', label: 'Network Intel' },
    { href: '/report/hardware', label: 'Hardware FP' },
    { href: '/report/software', label: 'Software FP' },
    { href: '/report/consistency', label: 'Consistency' }
  ],
  resources: [
    { href: '/knowledge/methodology', label: 'Methodology' },
    { href: '/knowledge/privacy', label: 'Privacy Policy' },
    { href: 'mailto:Privacy@BrowserScan.org', label: 'Contact Us' },
    { href: 'https://github.com/browerscan/browerscan', label: 'GitHub', external: true }
  ]
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-lg font-bold text-emerald-400">B</span>
              </div>
              <span className="font-mono text-sm font-semibold text-zinc-100">BrowserScan</span>
            </Link>
            <p className="mt-4 text-sm text-zinc-500 max-w-xs">
              Advanced browser fingerprinting and trust score analysis. Detect bots, leaks, and spoofing attempts.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://github.com/browerscan/browerscan"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tools</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.tools.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-500 transition hover:text-zinc-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Simulation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Simulation</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.simulation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-500 transition hover:text-zinc-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Report */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Report</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.report.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-zinc-500 transition hover:text-zinc-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Resources</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  {'external' in link ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-300"
                    >
                      {link.label}
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-zinc-500 transition hover:text-zinc-300">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/80 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} BrowserScan. Open source browser intelligence.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
