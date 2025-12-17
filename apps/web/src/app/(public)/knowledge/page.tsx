import Link from 'next/link';

export const metadata = {
  title: 'Knowledge Base — BrowserScan',
  description: 'Learn about browser fingerprinting methodology, detection algorithms, and privacy practices.'
};

const topics = [
  {
    href: '/knowledge/methodology',
    title: 'Scoring Methodology',
    desc: 'Understand how the trust score is calculated with deterministic deductions based on network, fingerprint, and behavioral signals.',
    icon: '📊',
    color: 'border-emerald-500/30 hover:border-emerald-500/50',
    badge: 'Technical'
  },
  {
    href: '/knowledge/privacy',
    title: 'Privacy Whitepaper',
    desc: 'Data handling policies, retention periods, anonymization practices, and compliance commitments.',
    icon: '🔒',
    color: 'border-sky-500/30 hover:border-sky-500/50',
    badge: 'Policy'
  }
];

export default function KnowledgeIndexPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Dashboard</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Knowledge Base</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Deep-dive into the technical methodology behind browser fingerprinting and trust scoring.
          Understand how detection systems work and how we protect your privacy.
        </p>
      </div>

      {/* Topics */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className={`block rounded-2xl border bg-black/40 p-6 transition hover:-translate-y-1 hover:bg-black/60 ${topic.color}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{topic.icon}</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {topic.badge}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-100">{topic.title}</h2>
            <p className="mt-2 text-sm text-zinc-500">{topic.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-xs text-zinc-600">
              <span>Read more</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Facts */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Quick Facts</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">7+</p>
            <p className="text-xs text-zinc-500">Detection Categories</p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-bold text-sky-400">100</p>
            <p className="text-xs text-zinc-500">Max Trust Score</p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">30d</p>
            <p className="text-xs text-zinc-500">Data Retention</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-dashed border-zinc-800 p-4">
        <p className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-400">Questions?</span> For technical inquiries about
          our methodology or privacy practices, contact us at Privacy@BrowserScan.org or open an issue on our GitHub repository.
        </p>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why Understanding Browser Fingerprinting Matters
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me be direct with you: your browser is leaking information about you right now.
            Not through some sophisticated hack or malware, but through the normal way browsers
            work. Every time you visit a website, your browser shares details about itself:
            what fonts you have installed, how your graphics card renders images, your timezone,
            your language settings, your screen size. None of this seems sensitive on its own.
            Combined, it creates a fingerprint that can identify you among millions of users.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The Electronic Frontier Foundation discovered that 94% of browsers in their study
            were uniquely identifiable through fingerprinting alone. No cookies. No tracking
            pixels. Just the information your browser freely gives away. This is why we built
            BrowserScan. Not to scare you, but to educate you. You cannot protect yourself from
            tracking techniques you do not understand.
          </p>
        </div>

        {/* Privacy Statistics */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Browser Privacy by the Numbers</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">94%</p>
              <p className="mt-1 text-xs text-zinc-500">Browsers uniquely identifiable</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-sky-400">51%</p>
              <p className="mt-1 text-xs text-zinc-500">Internet traffic from bots (2024)</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">37%</p>
              <p className="mt-1 text-xs text-zinc-500">Bad bot traffic share</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-rose-400">330K</p>
              <p className="mt-1 text-xs text-zinc-500">Account takeovers/month</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Sources: EFF Panopticlick, 2025 Imperva Bad Bot Report
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Our Methodology: How We Calculate Trust Scores
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            BrowserScan uses a deduction-based scoring system. You start with 100 points, and
            we subtract points for anything that looks suspicious or inconsistent. Using a VPN?
            That is minus 15 points, because VPNs are commonly used for fraud. WebRTC leaking
            your real IP? That is minus 20 points, because it indicates a privacy failure.
            Timezone mismatch between your browser and your IP location? Another 10 points gone.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is not arbitrary. We studied how real fraud detection systems work at banks,
            e-commerce platforms, and advertising networks. Our scoring mirrors the same signals
            they use. When you see your trust score, you are seeing approximately how trustworthy
            major platforms think you are. A score of 85 or higher means you look like a normal
            user. Below 70, you might start hitting challenges and blocks.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Science of Browser Fingerprinting
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Browser fingerprinting works because modern browsers expose an enormous amount of
            information through JavaScript APIs. Canvas fingerprinting asks your browser to draw
            a hidden image, then reads the pixel data. Due to differences in graphics cards,
            drivers, and font rendering, this image is slightly different on every computer.
            That difference creates a unique signature.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            WebGL fingerprinting queries your graphics card directly for its vendor, model, and
            capabilities. Audio fingerprinting measures how your system processes sound waves.
            Font fingerprinting checks which fonts are installed on your system. Screen
            fingerprinting records your resolution, color depth, and pixel density. TLS
            fingerprinting analyzes the cryptographic handshake your browser uses to establish
            secure connections. Each technique adds entropy to your fingerprint.
          </p>
        </div>

        {/* Fingerprint Components */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">What Makes Up Your Fingerprint</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-emerald-400">Hardware Signals</p>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>Canvas rendering hash</li>
                <li>WebGL vendor and renderer</li>
                <li>Audio context processing</li>
                <li>Screen resolution and depth</li>
                <li>Device pixel ratio</li>
                <li>Touch capability</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-sky-400">Software Signals</p>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>Installed fonts list</li>
                <li>Browser plugins</li>
                <li>Timezone offset</li>
                <li>Language preferences</li>
                <li>User agent string</li>
                <li>Cookie policies</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-amber-400">Network Signals</p>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>IP address and ASN</li>
                <li>TLS fingerprint (JA3/JA4)</li>
                <li>WebRTC local IPs</li>
                <li>DNS resolver</li>
                <li>Connection type</li>
                <li>HTTP headers</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Privacy in the Age of Tracking
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is the uncomfortable truth about online privacy: the tracking industry is
            winning. Cookies were supposed to be the main tracking mechanism, and regulations
            like GDPR gave users control over them. But fingerprinting flies under the radar.
            There is no consent banner for fingerprinting because technically nothing is stored
            on your device. You cannot clear your fingerprint like you clear cookies.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Privacy-focused browsers like Firefox and Tor try to fight back by standardizing
            fingerprints or adding noise to them. But this creates other problems. Standardized
            fingerprints make you look like you are using privacy tools, which can itself be
            a red flag to detection systems. Adding noise can break websites. There is no
            perfect solution, only tradeoffs you should understand.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Who Tracks You and Why
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Advertising Networks</h3>
              <p className="text-xs text-zinc-500">
                Ad tech companies use fingerprinting to track you across websites and build
                profiles for targeted advertising. Even if you block cookies, fingerprinting
                lets them recognize you.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Fraud Prevention Systems</h3>
              <p className="text-xs text-zinc-500">
                Banks, e-commerce sites, and payment processors fingerprint browsers to detect
                fraud. If your fingerprint changes suddenly or looks suspicious, transactions
                may be blocked.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Social Media Platforms</h3>
              <p className="text-xs text-zinc-500">
                Platforms like Facebook and Google fingerprint browsers to enforce account
                policies, detect fake accounts, and track users even when logged out.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Content Providers</h3>
              <p className="text-xs text-zinc-500">
                Streaming services and news sites use fingerprinting to enforce regional
                restrictions, detect VPN usage, and limit free tier access.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Our Commitment to Your Privacy
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            We built BrowserScan to help you understand tracking, not to participate in it.
            Most of our analysis runs directly in your browser. When we need to make server-side
            requests (like IP intelligence lookups), we do not log your queries long-term.
            We do not sell data. We do not build profiles. We do not track you across sessions.
            Our revenue comes from people who find value in understanding their digital footprint,
            not from monetizing your data.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Our privacy policy is written in plain language, not legal jargon. We tell you
            exactly what we collect, why we collect it, and how long we keep it. If you have
            questions, you can reach us at Privacy@BrowserScan.org. We believe transparency
            builds trust, and in a world where 37% of internet traffic is malicious bots,
            trust is the most valuable currency.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Taking Control of Your Digital Footprint
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Knowledge is power. Now that you understand how fingerprinting works, you can
            make informed decisions about your privacy. You might decide that the convenience
            of a normal browser outweighs the privacy risks. You might switch to Firefox with
            enhanced tracking protection. You might use Tor for sensitive activities. You might
            use multiple browsers for different purposes.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Whatever you choose, do it intentionally. Use our tools to understand your current
            fingerprint. Read our methodology to understand how scoring works. Check our
            privacy policy to understand how we handle your data. The goal is not perfect
            anonymity, which is nearly impossible. The goal is understanding and intentional
            choices about your digital presence.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Learn More
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Our Scoring Methodology document explains exactly how we calculate trust scores,
            including every signal we analyze and its weight. Our Privacy Whitepaper details
            our data handling practices, retention periods, and compliance commitments. Both
            documents are written for humans, not lawyers. If something is unclear, let us
            know and we will improve it.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            For the technically curious, we recommend the Electronic Frontier Foundation&apos;s
            research on browser fingerprinting, the AmIUnique project for fingerprint testing,
            and the academic papers published at PETS (Privacy Enhancing Technologies Symposium).
            The more you learn about how tracking works, the better equipped you are to make
            informed privacy decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
