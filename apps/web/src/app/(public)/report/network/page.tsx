'use client';

import Link from 'next/link';
import { NetworkProtocols } from '@/components/sections/network-protocols';
import { RiskBoard } from '@/components/sections/risk-board';
import { LeakPanels } from '@/components/sections/leak-panels';
import { useLiveReport } from '@/lib/use-live-report';

export default function NetworkReportPage() {
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
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">Network Layer</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Packet & TLS Intelligence</h1>
        <p className="mt-2 text-sm text-zinc-400">
          ASN analysis, JA3/JA4 fingerprints, protocol stacks, and leak telemetry captured at the network edge.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">Network</span>
        <Link href="/report/hardware" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Hardware</Link>
        <Link href="/report/software" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Software</Link>
        <Link href="/report/consistency" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Consistency</Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <NetworkProtocols report={report} />
        <RiskBoard report={report} className="col-span-1 md:col-span-2" />
      </div>

      {/* Leak Panels */}
      <LeakPanels report={report} />

      {/* Info Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Network Detection Explained</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-emerald-400">ASN Intelligence</p>
            <p className="mt-1 text-xs text-zinc-500">
              Autonomous System Numbers reveal your ISP or hosting provider. Datacenter ASNs are flagged as suspicious.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-sky-400">TLS Fingerprinting</p>
            <p className="mt-1 text-xs text-zinc-500">
              JA3/JA4 hashes capture unique TLS handshake patterns that identify browser and automation tools.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-amber-400">Leak Detection</p>
            <p className="mt-1 text-xs text-zinc-500">
              WebRTC, DNS, and IPv6 leaks can expose your real IP even when using VPN or proxy services.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Your IP Address Is Your Digital Home Address
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me put this simply. Your IP address is like your home address on the internet. Every device
            connected to the internet has one. When you visit a website, your IP address is sent with every
            request. It reveals your approximate location (city, region, country), your internet provider,
            and whether you are using a residential connection, mobile network, or datacenter.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is why VPNs and proxies exist - they give you a different IP address so websites see that
            instead of your real one. But as we will explore, there are many ways your real identity can
            leak through even when using these tools.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What ASN and ISP Reveal About You
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Every IP address belongs to an Autonomous System (AS), identified by an ASN. Your ISP has one or
            more ASNs. When fraud detection systems see your IP, they look up the ASN to understand what kind
            of network you are on. Residential ISPs like Comcast, AT&T, or Vodafone are trusted more than
            datacenter providers like AWS, DigitalOcean, or Vultr.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Why? Real users browse from home or mobile networks. Bots, scrapers, and fraudsters typically
            operate from datacenters because they need scale and cheap bandwidth. If your IP is from a known
            VPN or hosting provider ASN, websites become more suspicious. This is why &quot;residential proxies&quot;
            exist - they route traffic through real residential IPs to avoid datacenter detection.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Residential</h3>
              <p className="text-xs text-zinc-500">
                Home ISP connections. High trust. Expected for real users. Examples: Comcast, Verizon, BT.
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Mobile</h3>
              <p className="text-xs text-zinc-500">
                Cellular networks. Medium trust. Often use CGNAT (shared IPs). Examples: T-Mobile, Vodafone.
              </p>
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-rose-400">Datacenter</h3>
              <p className="text-xs text-zinc-500">
                Hosting providers. Low trust. Common for VPNs and bots. Examples: AWS, Google Cloud, OVH.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            TLS Fingerprinting: JA3 and JA4 Explained
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is where things get interesting. When your browser connects to a website over HTTPS, it
            performs a TLS handshake. During this handshake, your browser announces what encryption it
            supports, in what order, and with what extensions. This announcement is called the ClientHello.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            JA3 (created by Salesforce in 2017) creates a fingerprint hash from your ClientHello. Different
            browsers, operating systems, and tools produce different JA3 hashes. Chrome has one, Firefox has
            another, cURL has another. Even different versions of the same browser produce different hashes.
            This is powerful for detection - if someone claims to be Chrome but has a JA3 hash of a Python
            script, they are lying.
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">JA3 vs JA4 Comparison</h3>
            <div className="grid gap-4 md:grid-cols-2 text-xs">
              <div>
                <p className="text-sky-400 font-medium mb-2">JA3 (2017)</p>
                <ul className="text-zinc-500 space-y-1">
                  <li>• MD5 hash of TLS ClientHello</li>
                  <li>• Captures cipher suites, extensions</li>
                  <li>• Vulnerable to TLS extension randomization</li>
                  <li>• Can produce identical hashes for different clients</li>
                </ul>
              </div>
              <div>
                <p className="text-emerald-400 font-medium mb-2">JA4 (2023 - FoxIO)</p>
                <ul className="text-zinc-500 space-y-1">
                  <li>• Resilient to extension randomization</li>
                  <li>• Includes transport protocol (TCP/QUIC)</li>
                  <li>• Adds SNI and ALPN context</li>
                  <li>• More stable across connections</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Cloudflare, VirusTotal, and major CDNs now use JA4 for bot detection. Attackers who spoof their
            User-Agent string can still be caught by their TLS fingerprint mismatch.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How VPNs and Proxies Are Detected
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            You might think using a VPN makes you anonymous. The reality is more complex. Websites use multiple
            signals to detect VPN and proxy usage:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">IP Reputation Databases</h3>
              <p className="text-xs text-zinc-500">
                Commercial databases track known VPN and proxy IP ranges. Popular VPN providers get their IPs
                flagged within days. Services like MaxMind, IPinfo, and Proxycheck maintain these lists.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">ASN Analysis</h3>
              <p className="text-xs text-zinc-500">
                Datacenter ASNs are suspicious by default. Residential VPN IPs are harder to detect but
                often get flagged when they host too many unique users.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Timezone Mismatches</h3>
              <p className="text-xs text-zinc-500">
                If your IP says you are in Germany but your browser timezone is US/Pacific, that is a red
                flag. Legitimate users rarely have this mismatch.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">WebRTC/DNS Leaks</h3>
              <p className="text-xs text-zinc-500">
                Even with a VPN, your browser might leak your real IP through WebRTC or DNS requests.
                This is why we test for these leaks specifically.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What Network Fingerprinting Means for Privacy
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is the bottom line. Your network fingerprint - the combination of IP, ASN, TLS fingerprint,
            and behavioral signals - creates a profile that is hard to hide. Even if you change your IP with
            a VPN, your TLS fingerprint stays the same. Even if you use Tor, your exit node might be flagged.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The goal is not necessarily to be invisible - that is nearly impossible. The goal is to not stand
            out. Use a VPN with residential IPs. Make sure your timezone matches your IP location. Disable
            WebRTC in your browser. Use a mainstream browser with a common TLS fingerprint. The less unique
            you are, the harder you are to track.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Your Network Report
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Protocol Fingerprints</h3>
              <p className="text-xs text-zinc-500">
                The JA3 and JA4 hashes shown identify your browser&apos;s TLS implementation. If these match
                known browser hashes, you blend in. If they match automation tools, you stand out.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Risk Flags</h3>
              <p className="text-xs text-zinc-500">
                Red flags indicate signals that typically trigger fraud detection: datacenter IP, known VPN,
                leaked IPs, timezone mismatches. More flags mean more scrutiny from websites.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Leak Telemetry</h3>
              <p className="text-xs text-zinc-500">
                The leak panels show whether your real IP is exposed through WebRTC, DNS, or IPv6. If you
                see leaks here while using a VPN, your privacy tool is not working correctly.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">ASN Details</h3>
              <p className="text-xs text-zinc-500">
                The ASN section shows your network provider. Residential ISPs are trusted. Datacenters and
                known VPN providers are flagged. This is one of the primary signals in fraud scoring.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
