'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface IpIntelResult {
  ip: string;
  asn: string;
  org: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  timezone: string;
  is_proxy: boolean;
  is_vpn: boolean;
  is_tor: boolean;
  is_hosting: boolean;
  fraud_score: number;
  coordinates: { lat: number; lon: number } | null;
}

export default function IpLookupPage() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<IpIntelResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/ip-lookup', {
        method: 'POST',
        body: JSON.stringify({ ip: ip || undefined }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Lookup failed');
      const json = await res.json() as { data: IpIntelResult };
      setResult(json.data);
    } catch {
      setError('Failed to lookup IP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const riskLevel = result
    ? result.fraud_score >= 70 ? 'high' : result.fraud_score >= 40 ? 'medium' : 'low'
    : null;

  const riskColors = {
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/tools" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Tools</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Tools</p>
        <h1 className="text-3xl font-semibold text-zinc-50">IP Intelligence Lookup</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Query detailed information about any IP address including geolocation, ASN, proxy detection, and fraud scoring.
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            placeholder="Enter IP address (leave empty for your IP)"
            className="flex-1 rounded-xl border border-zinc-700 bg-black/40 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
          />
          <button
            onClick={lookup}
            disabled={loading}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Looking up...' : 'Lookup IP'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Risk Score Card */}
          <div className={`rounded-2xl border p-6 ${riskColors[riskLevel!]}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-70">Fraud Risk Score</p>
                <p className="text-4xl font-bold">{result.fraud_score}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium capitalize">{riskLevel} Risk</p>
                <div className="mt-2 flex gap-2">
                  {result.is_proxy && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Proxy</span>}
                  {result.is_vpn && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">VPN</span>}
                  {result.is_tor && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Tor</span>}
                  {result.is_hosting && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Hosting</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Location */}
            <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Location</p>
              <div className="mt-3 space-y-2">
                <Row label="IP Address" value={result.ip} mono />
                <Row label="Country" value={`${result.country} (${result.country_code})`} />
                <Row label="Region" value={result.region || 'N/A'} />
                <Row label="City" value={result.city || 'N/A'} />
                <Row label="Timezone" value={result.timezone || 'N/A'} />
                {result.coordinates && (
                  <Row label="Coordinates" value={`${result.coordinates.lat}, ${result.coordinates.lon}`} mono />
                )}
              </div>
            </div>

            {/* Network */}
            <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Network</p>
              <div className="mt-3 space-y-2">
                <Row label="ASN" value={result.asn} mono />
                <Row label="Organization" value={result.org || 'N/A'} />
                <Row label="Proxy Detected" value={result.is_proxy ? 'Yes' : 'No'} status={!result.is_proxy} />
                <Row label="VPN Detected" value={result.is_vpn ? 'Yes' : 'No'} status={!result.is_vpn} />
                <Row label="Tor Exit Node" value={result.is_tor ? 'Yes' : 'No'} status={!result.is_tor} />
                <Row label="Hosting/DC" value={result.is_hosting ? 'Yes' : 'No'} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
          <p className="text-zinc-500">Enter an IP address above to get started</p>
          <p className="mt-1 text-xs text-zinc-600">Leave empty to lookup your current IP</p>
        </div>
      )}

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding IP Intelligence and Geolocation
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Every device connected to the internet has an IP address. Think of it like a mailing address
            for your computer. But here is the thing most people do not realize: that address carries
            a ton of information with it. Where you are located, who your internet provider is, whether
            you are using a VPN, and even how likely you are to be a fraudster. This is what we call
            IP intelligence.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            When you query an IP address through our lookup tool, we pull data from multiple intelligence
            sources. We check geolocation databases that map IP ranges to physical locations. We query
            ASN (Autonomous System Number) registries to identify the network operator. We cross-reference
            known proxy lists, VPN exit nodes, Tor relays, and hosting provider ranges. The result is
            a comprehensive profile of any IP address in seconds.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What the Fraud Score Actually Means
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The fraud score is a numerical assessment from 0 to 100 that estimates how risky an IP address
            is. A score of 0 means the IP looks completely legitimate, like a residential connection with
            no suspicious history. A score of 100 means the IP is almost certainly being used for malicious
            purposes, maybe it is a known botnet node or has been involved in thousands of fraud attempts.
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">Fraud Score Breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">0-25 (Low Risk)</span>
                <span className="text-emerald-400">Residential, clean history, no anonymization</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">26-50 (Medium-Low)</span>
                <span className="text-sky-400">Business IP, some datacenter ranges, minor flags</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">51-70 (Medium)</span>
                <span className="text-amber-400">VPN/proxy detected, hosting provider, elevated risk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">71-100 (High Risk)</span>
                <span className="text-rose-400">Tor exit, known fraud, botnet, spam source</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            VPN, Proxy, and Tor Detection Explained
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            We detect anonymization tools through multiple methods. For VPNs, we maintain databases of
            known VPN provider IP ranges and detect common VPN server signatures. For proxies, we check
            open proxy lists and analyze connection patterns. For Tor, we monitor the public list of
            Tor exit nodes which is updated hourly.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The &quot;Hosting/DC&quot; flag indicates the IP belongs to a datacenter rather than a residential
            or business ISP. This matters because legitimate users typically connect from residential IPs,
            while bots and scrapers often run from cloud servers. An IP from AWS, Google Cloud, or
            DigitalOcean will trigger this flag.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Practical Uses for IP Lookup
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Fraud Prevention</h3>
              <p className="text-xs text-zinc-500">
                E-commerce sites check buyer IPs against fraud databases. If the billing address says
                New York but the IP is from Nigeria, that is a red flag worth investigating.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Access Control</h3>
              <p className="text-xs text-zinc-500">
                Streaming services and content providers use geolocation to enforce regional licensing.
                Netflix in the US shows different content than Netflix in Japan.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Security Research</h3>
              <p className="text-xs text-zinc-500">
                When investigating an attack, IP intelligence helps identify the source. Is it a
                compromised residential machine or a rented server in a bulletproof hosting facility?
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Analytics</h3>
              <p className="text-xs text-zinc-500">
                Understanding where your users come from helps with localization decisions. If 40% of
                traffic is from Germany, maybe it is time for German language support.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Accuracy and Limitations
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            IP geolocation is not GPS. City-level accuracy is typically around 80% in developed countries
            but can drop to 50% or less in regions with poor IP allocation records. Country-level accuracy
            is much better, usually above 95%. ISPs can reassign IP blocks, VPNs can make an IP appear
            somewhere it is not, and mobile IPs can change rapidly as users move between towers.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Our fraud scores are probabilistic, not deterministic. A high fraud score does not mean
            someone is definitely committing fraud, it means the IP has characteristics associated with
            fraud. Many legitimate users use VPNs for privacy. The score should inform your decisions,
            not make them for you. Always combine IP intelligence with other signals like device
            fingerprints, behavioral analysis, and transaction patterns.
          </p>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, mono, status }: { label: string; value: string; mono?: boolean; status?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} ${status !== undefined ? (status ? 'text-emerald-400' : 'text-rose-400') : 'text-zinc-200'}`}>
        {value}
      </span>
    </div>
  );
}
