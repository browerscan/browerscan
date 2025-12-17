'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const tools = [
  {
    href: '/tools/ip-lookup',
    title: 'IP Intelligence',
    desc: 'Lookup any IP address for geolocation, ASN, proxy detection, and fraud scoring.',
    icon: '🌐',
    color: 'emerald'
  },
  {
    href: '/tools/leak-test',
    title: 'WebRTC & DNS Leak Test',
    desc: 'Detect if your real IP is exposed through WebRTC or DNS requests.',
    icon: '🔍',
    color: 'rose'
  },
  {
    href: '/tools/port-scan',
    title: 'Port Scanner',
    desc: 'Check common ports (SSH, HTTP, HTTPS, RDP) for exposure status.',
    icon: '🔌',
    color: 'amber'
  },
  {
    href: '/tools/pdf-gen',
    title: 'PDF Report Generator',
    desc: 'Export your browser fingerprint scan as a professional PDF report.',
    icon: '📄',
    color: 'sky'
  },
  {
    href: '/tools/cookie-check',
    title: 'Cookie Analyzer',
    desc: 'Inspect browser cookies and analyze security flags (Secure, HttpOnly, SameSite).',
    icon: '🍪',
    color: 'violet'
  }
];

const colorMap: Record<string, string> = {
  emerald: 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10',
  rose: 'border-rose-500/30 hover:border-rose-500/60 hover:shadow-rose-500/10',
  amber: 'border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/10',
  sky: 'border-sky-500/30 hover:border-sky-500/60 hover:shadow-sky-500/10',
  violet: 'border-violet-500/30 hover:border-violet-500/60 hover:shadow-violet-500/10'
};

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Security Tools</h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
          Professional utilities for security analysts, penetration testers, and privacy-conscious users.
          All tools run client-side or through our secure API.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={tool.href}
              className={`block rounded-2xl border bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colorMap[tool.color]}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{tool.icon}</span>
                <div className="flex-1">
                  <p className="text-base font-semibold text-zinc-100">{tool.title}</p>
                  <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{tool.desc}</p>
                </div>
                <span className="text-zinc-600">→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
        <p className="text-xs text-zinc-500">
          <span className="text-emerald-400">●</span> All tools are free to use.
          Results are not stored unless you explicitly export them.
        </p>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why Browser Security Tools Matter More Than Ever
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is a number that should grab your attention: in 2024, automated bot traffic officially
            surpassed human traffic on the internet for the first time in a decade. According to the
            2025 Imperva Bad Bot Report, bots now make up 51% of all web traffic. Bad bots alone
            account for 37% of that traffic, up from 32% just one year earlier. Think about that.
            More than a third of everything happening on the internet right now is malicious automation
            trying to scrape data, take over accounts, or commit fraud.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is not some abstract cybersecurity statistic. This directly affects you. If you run
            a website, bad bots are hitting your servers right now. If you use the internet for banking,
            shopping, or social media, automated attacks are constantly probing for weaknesses. The
            security tools on this page help you understand and defend against these threats. They
            let you see what attackers see when they look at your digital footprint.
          </p>
        </div>

        {/* Statistics Table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">2024 Internet Threat Landscape</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-3 text-left text-xs font-medium text-zinc-500">Metric</th>
                  <th className="pb-3 text-right text-xs font-medium text-zinc-500">2024</th>
                  <th className="pb-3 text-right text-xs font-medium text-zinc-500">Change</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Total bot traffic share</td>
                  <td className="py-3 text-right font-mono text-emerald-400">51%</td>
                  <td className="py-3 text-right text-rose-400">First time exceeding humans</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Bad bot traffic share</td>
                  <td className="py-3 text-right font-mono text-emerald-400">37%</td>
                  <td className="py-3 text-right text-rose-400">+5% YoY</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Travel industry bot attacks</td>
                  <td className="py-3 text-right font-mono text-amber-400">41%</td>
                  <td className="py-3 text-right text-rose-400">Most attacked sector</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Retail industry bot traffic</td>
                  <td className="py-3 text-right font-mono text-amber-400">59%</td>
                  <td className="py-3 text-right text-rose-400">Highest bot %</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">API-targeted attacks</td>
                  <td className="py-3 text-right font-mono text-sky-400">44%</td>
                  <td className="py-3 text-right text-rose-400">vs 10% for web apps</td>
                </tr>
                <tr>
                  <td className="py-3">Account takeover incidents (Dec)</td>
                  <td className="py-3 text-right font-mono text-rose-400">330,000</td>
                  <td className="py-3 text-right text-rose-400">+74% YoY</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Source: 2025 Imperva Bad Bot Report, Thales Group
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding IP Intelligence and Why It Matters
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Every device on the internet has an IP address. Think of it like your home address, but
            for your computer. The thing most people do not realize is that this address carries
            enormous amounts of information with it. When you connect to a website, that site can
            instantly determine your approximate location, your internet service provider, whether
            you are using a VPN or proxy, and even calculate a fraud risk score based on your IP
            history.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Our IP Intelligence tool gives you the same visibility that major corporations and fraud
            detection systems have. You can query any IP address and get back geolocation data,
            ASN information, VPN and proxy detection, and a fraud score. This is the exact same
            data that banks use to flag suspicious transactions, that e-commerce sites use to block
            fraudulent orders, and that streaming services use to enforce geographic restrictions.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Problem with WebRTC and DNS Leaks
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            You might be using a VPN to protect your privacy, and you might think you are completely
            anonymous. Here is the uncomfortable truth: WebRTC leaks can expose your real IP address
            even when you are connected to a VPN. WebRTC is a browser technology that enables
            real-time communication like video calls. The problem is that it can bypass your VPN
            tunnel to establish direct peer-to-peer connections, revealing your actual IP in the
            process.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            DNS leaks are equally problematic. When you type a website address, your browser needs
            to look up the IP address associated with that domain. If these DNS requests go through
            your ISP instead of your VPN, anyone monitoring your connection can see exactly which
            websites you are visiting. Our leak test tool checks for both of these vulnerabilities
            in real-time. If you are paying for a VPN service but your IP is leaking, you are not
            getting the privacy you think you are paying for.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Port Scanning: Know Your Attack Surface
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Imagine your computer has thousands of doors. Each door is a port, and each port can
            potentially be an entry point for attackers. Port 22 is SSH, used for remote server
            access. Port 3389 is RDP, used for Windows Remote Desktop. Port 3306 is MySQL databases.
            If these ports are open and exposed to the internet, attackers can probe them, attempt
            to brute-force credentials, or exploit vulnerabilities in the services running behind them.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Our port scanner lets you check which ports are open on your system. This is the first
            thing an attacker does when targeting a system, so you should know what they can see.
            If you have ports open that should not be exposed to the internet, that is a security
            problem you need to fix. Remember, you cannot defend what you do not know about.
          </p>
        </div>

        {/* Browser Fingerprint Uniqueness Stats */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Browser Fingerprint Uniqueness</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">94%</p>
              <p className="mt-1 text-xs text-zinc-500">Browsers uniquely identifiable (EFF Panopticlick)</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-sky-400">90%+</p>
              <p className="mt-1 text-xs text-zinc-500">Fingerprint attributes unchanged after 6 months</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">98%</p>
              <p className="mt-1 text-xs text-zinc-500">WebGPU classification accuracy (150ms)</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Sources: EFF Panopticlick, SECURWARE 2024 Research Papers
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Cookie Security: More Than Just Tracking
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Cookies get a bad reputation because of tracking, but they serve legitimate purposes
            too. Session cookies keep you logged in. Preference cookies remember your settings.
            The security question is how these cookies are configured. A cookie without the Secure
            flag can be intercepted over unencrypted connections. A cookie without HttpOnly can be
            stolen by malicious JavaScript. A cookie without proper SameSite configuration can be
            exploited in cross-site request forgery attacks.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Our cookie analyzer shows you the security flags on every cookie in your browser. This
            is particularly useful if you are a developer auditing your own site, or if you are a
            security researcher examining how sites handle sensitive data. GDPR regulators have
            issued hundreds of millions in fines for improper cookie handling. Understanding cookie
            security is not optional anymore, it is a compliance requirement.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            PDF Reports: Document and Share Your Findings
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Sometimes you need to document your browser fingerprint for audit purposes, share findings
            with a team, or create a baseline for future comparison. Our PDF report generator takes
            your complete scan results and exports them as a professional document. This includes
            your trust score, all detected fingerprint attributes, consistency checks, and any leaks
            or anomalies we found.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Security professionals use these reports for penetration testing documentation, compliance
            audits, and incident response. Privacy researchers use them to compare fingerprint
            uniqueness across different browser configurations. Whatever your use case, having a
            permanent record of your browser fingerprint is valuable information that you control.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Who Uses These Tools
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Security Professionals</h3>
              <p className="text-xs text-zinc-500">
                Penetration testers, red teams, and security auditors use these tools to assess
                their own visibility and test detection systems. Understanding your fingerprint
                is essential for effective security testing.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Privacy Researchers</h3>
              <p className="text-xs text-zinc-500">
                Academic researchers studying fingerprinting techniques, tracking ecosystems,
                and privacy-preserving technologies rely on tools like these to gather data
                and validate their findings.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Developers</h3>
              <p className="text-xs text-zinc-500">
                Building anti-fraud systems, bot detection, or user verification requires
                understanding real browser fingerprints. These tools show you what real
                browser data looks like.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Privacy-Conscious Users</h3>
              <p className="text-xs text-zinc-500">
                If you care about your online privacy, you need to understand how you are
                being tracked. These tools give you visibility into your digital footprint
                so you can make informed decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Privacy and Data Handling
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            We built these tools with privacy as a core principle. Most of the analysis happens
            directly in your browser. When we do need to make server-side requests (like IP
            intelligence lookups), we do not log your queries or store your results unless you
            explicitly export them. We do not sell data, we do not build profiles, and we do not
            track you across sessions. The whole point of these tools is to help you understand
            and protect your privacy, not to undermine it.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            If you have questions about our data practices, read our privacy policy or contact us
            at Privacy@BrowserScan.org. We are transparent about what we collect and why. In a
            world where 37% of internet traffic is malicious bots, trust is everything. We earn
            that trust by respecting your privacy.
          </p>
        </div>
      </section>
    </div>
  );
}
