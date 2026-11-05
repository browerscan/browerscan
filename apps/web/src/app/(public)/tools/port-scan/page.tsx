'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ExposureAssessment {
  target_ip: string;
  capability: 'network_exposure_assessment';
  tcp_scan_performed: false;
  assessment: {
    asn: string;
    organization: string;
    country: string;
    is_hosting: boolean;
    is_proxy: boolean;
    is_vpn: boolean;
    is_tor: boolean;
    risk_score: number;
  };
  note: string;
}

const signalLabels: Array<{
  key: keyof Pick<
    ExposureAssessment['assessment'],
    'is_hosting' | 'is_proxy' | 'is_vpn' | 'is_tor'
  >;
  label: string;
}> = [
  { key: 'is_hosting', label: 'Hosting network' },
  { key: 'is_proxy', label: 'Proxy signal' },
  { key: 'is_vpn', label: 'VPN signal' },
  { key: 'is_tor', label: 'Tor signal' }
];

const commonPorts = [
  { port: 22, service: 'SSH', exposure: 'Restrict to trusted networks' },
  { port: 80, service: 'HTTP', exposure: 'Expected only for public web services' },
  { port: 443, service: 'HTTPS', exposure: 'Expected only for public TLS services' },
  { port: 3306, service: 'MySQL', exposure: 'Do not expose directly to the internet' },
  { port: 3389, service: 'RDP', exposure: 'Place behind VPN or zero-trust access' },
  { port: 5432, service: 'PostgreSQL', exposure: 'Do not expose directly to the internet' }
];

export default function NetworkExposurePage() {
  const [targetIp, setTargetIp] = useState('');
  const [assessment, setAssessment] = useState<ExposureAssessment | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assess() {
    setAssessing(true);
    setAssessment(null);
    setError(null);

    try {
      const response = await fetch('/api/tools/port-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetIp.trim() ? { ip: targetIp.trim() } : {})
      });
      const payload = await response.json().catch(() => ({})) as {
        data?: ExposureAssessment;
        message?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || 'Network assessment is unavailable');
      }

      setAssessment(payload.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Network assessment failed');
    } finally {
      setAssessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div>
        <Link href="/tools" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Tools</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Tools</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Network Exposure Assessment</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Inspect an IP address&apos;s public network identity and reputation signals using IP intelligence.
          No TCP port probe is performed.
        </p>
      </div>

      <section
        className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5"
        aria-labelledby="capability-heading"
      >
        <h2 id="capability-heading" className="text-sm font-semibold text-amber-300">
          Capability boundary
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Cloudflare Workers cannot open arbitrary TCP connections to test remote ports. BrowserScan reports
          only network facts returned by IPBot/IP intelligence and never invents open, closed, or filtered states.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-6" aria-labelledby="assessment-heading">
        <h2 id="assessment-heading" className="text-sm font-semibold text-zinc-100">Assess a public IP</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Public IP address</span>
            <input
              value={targetIp}
              onChange={(event) => setTargetIp(event.target.value)}
              placeholder="Public IP (leave empty for your request IP)"
              inputMode="decimal"
              className="w-full rounded-xl border border-zinc-700 bg-black/40 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </label>
          <button
            type="button"
            onClick={assess}
            disabled={assessing}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-3 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {assessing ? 'Assessing…' : 'Assess network'}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200" role="alert">
          {error}
        </div>
      )}

      {assessment && (
        <section
          className="space-y-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6"
          aria-labelledby="result-heading"
          aria-live="polite"
          data-testid="network-exposure-result"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">Observed network</p>
              <h2 id="result-heading" className="mt-1 font-mono text-xl text-zinc-100">{assessment.target_ip}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {assessment.assessment.organization} · {assessment.assessment.asn} · {assessment.assessment.country}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-black/30 px-4 py-3 text-right">
              <p className="text-xs text-zinc-500">IP risk score</p>
              <p className="font-mono text-2xl text-zinc-100">{assessment.assessment.risk_score}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Network signals">
            {signalLabels.map(({ key, label }) => {
              const detected = assessment.assessment[key];
              return (
                <div
                  key={key}
                  role="listitem"
                  className={`rounded-xl border px-4 py-3 ${
                    detected
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : 'border-zinc-800 bg-black/20'
                  }`}
                >
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className={`mt-1 text-sm font-medium ${detected ? 'text-amber-300' : 'text-zinc-300'}`}>
                    {detected ? 'Detected' : 'Not detected'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-zinc-700 bg-black/25 p-4">
            <p className="text-sm font-medium text-zinc-200">TCP ports were not tested</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">{assessment.note}</p>
          </div>
        </section>
      )}

      <section className="space-y-4 border-t border-zinc-800 pt-10">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Common port guidance</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Reference only — these ports are not scanned by this page. Verify systems you own with an approved
            network scanner from a network location that can reach the target.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Port</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {commonPorts.map((item) => (
                <tr key={item.port}>
                  <td className="px-4 py-3 font-mono text-zinc-200">{item.port}</td>
                  <td className="px-4 py-3 text-zinc-300">{item.service}</td>
                  <td className="px-4 py-3 text-zinc-500">{item.exposure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
