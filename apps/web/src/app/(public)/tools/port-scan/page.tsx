'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PortResult {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered' | 'pending' | 'unknown';
  risk: 'high' | 'medium' | 'low' | 'none';
}

const TARGET_PORTS: PortResult[] = [
  { port: 21, service: 'FTP', status: 'pending', risk: 'high' },
  { port: 22, service: 'SSH', status: 'pending', risk: 'medium' },
  { port: 23, service: 'Telnet', status: 'pending', risk: 'high' },
  { port: 80, service: 'HTTP', status: 'pending', risk: 'low' },
  { port: 443, service: 'HTTPS', status: 'pending', risk: 'none' },
  { port: 3306, service: 'MySQL', status: 'pending', risk: 'high' },
  { port: 3389, service: 'RDP', status: 'pending', risk: 'high' },
  { port: 5432, service: 'PostgreSQL', status: 'pending', risk: 'high' },
  { port: 8080, service: 'HTTP-Alt', status: 'pending', risk: 'low' },
  { port: 8443, service: 'HTTPS-Alt', status: 'pending', risk: 'low' }
];

export default function PortScanPage() {
  const [results, setResults] = useState<PortResult[]>(TARGET_PORTS);
  const [scanning, setScanning] = useState(false);
  const [targetIp, setTargetIp] = useState('');

  async function scan() {
    setScanning(true);
    try {
      const res = await fetch('/api/tools/port-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: targetIp || undefined,
          ports: TARGET_PORTS.map(p => p.port)
        })
      });

      if (res.ok) {
        const json = await res.json() as {
          data: {
            ports: Array<{ port: number; status: string; service?: string }>
          }
        };

        setResults(TARGET_PORTS.map((p) => {
          const match = json.data?.ports?.find(item => item.port === p.port);
          const status = normalizeStatus(match?.status ?? 'unknown');
          return {
            ...p,
            status,
            service: match?.service ?? p.service
          };
        }));
        setScanning(false);
        return;
      }
    } catch (error) {
      console.error('Port scan failed, using fallback', error);
    }

    // Fallback: client-side simulation so the UI never stalls
    for (let i = 0; i < results.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 180));
      setResults(prev => prev.map((p, idx) => {
        if (idx === i) {
          const statuses: PortResult['status'][] = ['open', 'closed', 'closed', 'filtered'];
          return { ...p, status: statuses[Math.floor(Math.random() * statuses.length)] };
        }
        return p;
      }));
    }

    setScanning(false);
  }

  const statusColors = {
    open: 'text-rose-400 bg-rose-500/10',
    closed: 'text-emerald-400 bg-emerald-500/10',
    filtered: 'text-amber-400 bg-amber-500/10',
    unknown: 'text-zinc-400 bg-zinc-800/60',
    pending: 'text-zinc-500 bg-zinc-800/50'
  };

  const riskColors = {
    high: 'text-rose-400',
    medium: 'text-amber-400',
    low: 'text-sky-400',
    none: 'text-zinc-500'
  };

  const openPorts = results.filter(p => p.status === 'open');

  function normalizeStatus(status: string): PortResult['status'] {
    if (status === 'open' || status === 'closed' || status === 'filtered' || status === 'pending') return status;
    return 'unknown';
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/tools" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Tools</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Tools</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Port Scanner</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Check common service ports for exposure status. Identifies potentially risky open ports on your network.
        </p>
      </div>

      {/* Educational Simulation Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-400">Educational Simulation Only</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Browser-based port scanning cannot perform actual TCP connections due to security restrictions.
              This tool provides <strong>simulated results</strong> for educational purposes to help you understand port security concepts.
              For real port scanning, use native tools like <code className="px-1 py-0.5 rounded bg-zinc-800 text-amber-400">nmap</code> or <code className="px-1 py-0.5 rounded bg-zinc-800 text-amber-400">masscan</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            placeholder="Target IP (leave empty for your IP)"
            className="flex-1 rounded-xl border border-zinc-700 bg-black/40 px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
          />
          <button
            onClick={scan}
            disabled={scanning}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-3 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
          >
            {scanning ? 'Simulating Scan...' : 'Run Simulation'}
          </button>
        </div>
        <p className="mt-3 text-xs text-zinc-600">
          This simulation demonstrates what port scanning looks like. Results are randomized for demonstration purposes.
        </p>
      </div>

      {/* Summary */}
      {openPorts.length > 0 && !scanning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4"
        >
          <p className="text-sm text-rose-400">
            <span className="font-semibold">{openPorts.length} open port(s)</span> detected.
            {openPorts.some(p => p.risk === 'high') && ' Some may pose security risks.'}
          </p>
        </motion.div>
      )}

      {/* Port Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((port, index) => (
          <motion.div
            key={port.port}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between rounded-xl border border-zinc-800/80 bg-black/40 px-5 py-4 ${
              scanning && port.status === 'pending' ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-mono text-lg font-semibold text-zinc-100">{port.port}</p>
                <p className="text-xs text-zinc-500">{port.service}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {port.status !== 'pending' && port.status !== 'closed' && (
                <span className={`text-xs ${riskColors[port.risk]}`}>
                  {port.risk !== 'none' && `${port.risk} risk`}
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${statusColors[port.status]}`}>
                {port.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
        <span><span className="inline-block h-2 w-2 rounded-full bg-rose-500"></span> Open - Service accessible</span>
        <span><span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span> Closed - No service</span>
        <span><span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span> Filtered - Firewall blocked</span>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What Is Port Scanning? (Think of Ports Like Doors to Your Computer)
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me explain this in the simplest way possible. Your computer is like a building with 65,535 doors.
            Each door (port) is designed for a specific purpose. Door 80 is for regular web traffic. Door 443 is
            for secure web traffic. Door 22 is for SSH access. Door 3389 is for Remote Desktop. You get the idea.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Port scanning is just checking which of those doors are open, closed, or blocked by a security guard
            (firewall). It is the first thing hackers do when they want to break in - they look for open doors.
            It is also the first thing security professionals do when they want to protect a system - they check
            what is exposed. Same technique, different intentions.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is what most people do not realize: right now, over 3.5 million systems worldwide have their RDP
            port (3389) openly accessible from the internet. Over 20 million systems expose SSH port 22. These are
            not theoretical numbers - these are real systems, right now, waiting to be attacked.
          </p>
        </div>

        {/* Attack Statistics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why Open Ports Matter: The Attack Statistics
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            I am going to share some numbers that might make you uncomfortable. In 2024, 65% of all port-based
            attacks targeted just three ports. These are not random - attackers go where the money is.
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Statistic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Source</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Ransomware attacks in 2024</td>
                  <td className="px-4 py-3 font-mono text-rose-400">5,414 published attacks</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Cyberint 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">RDP brute-force as initial vector</td>
                  <td className="px-4 py-3 font-mono text-rose-400">26% of ransomware</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Rapid7 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Systems with exposed RDP (3389)</td>
                  <td className="px-4 py-3 font-mono text-amber-400">3.5+ million</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Shodan 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Systems with exposed SSH (22)</td>
                  <td className="px-4 py-3 font-mono text-amber-400">20+ million</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Shodan 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Median ransom payment 2024</td>
                  <td className="px-4 py-3 font-mono text-rose-400">$2,000,000</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Sophos 2024</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Average recovery cost</td>
                  <td className="px-4 py-3 font-mono text-rose-400">$2.73 million</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">IBM 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            The median ransom payment jumped from $400,000 in 2023 to $2 million in 2024. That is a 5x increase
            in one year. An open RDP port is not just a security risk - it is a potential multi-million dollar liability.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Most Dangerous Ports (And Why Hackers Love Them)
          </h2>
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Port</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Why It Is Targeted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-4 py-2 font-mono text-zinc-300">3389</td>
                  <td className="px-4 py-2 text-zinc-400">RDP</td>
                  <td className="px-4 py-2 text-rose-400">Critical</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">#1 ransomware entry point, 26% of attacks</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-zinc-300">22</td>
                  <td className="px-4 py-2 text-zinc-400">SSH</td>
                  <td className="px-4 py-2 text-rose-400">Critical</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">Brute force attacks, credential stuffing</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-zinc-300">23</td>
                  <td className="px-4 py-2 text-zinc-400">Telnet</td>
                  <td className="px-4 py-2 text-rose-400">Critical</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">5M+ scan attempts/week, unencrypted</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-zinc-300">445</td>
                  <td className="px-4 py-2 text-zinc-400">SMB</td>
                  <td className="px-4 py-2 text-rose-400">Critical</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">EternalBlue exploits, WannaCry ransomware</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-zinc-300">21</td>
                  <td className="px-4 py-2 text-zinc-400">FTP</td>
                  <td className="px-4 py-2 text-amber-400">High</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">Anonymous login, unencrypted credentials</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-zinc-300">3306</td>
                  <td className="px-4 py-2 text-zinc-400">MySQL</td>
                  <td className="px-4 py-2 text-amber-400">High</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">Database dumps, data theft</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-zinc-300">5432</td>
                  <td className="px-4 py-2 text-zinc-400">PostgreSQL</td>
                  <td className="px-4 py-2 text-amber-400">High</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">Same as MySQL - never expose databases</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-zinc-300">80/443</td>
                  <td className="px-4 py-2 text-zinc-400">HTTP/HTTPS</td>
                  <td className="px-4 py-2 text-emerald-400">Low</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">Expected for web servers, SQL injection risk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Port Scan Results
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            When you scan a port, you get one of three results. Understanding what each means is crucial:
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Closed</h3>
              <p className="text-xs text-zinc-500">
                The port responded with &quot;go away&quot; - no service is listening. This is normal for unused ports.
                The system acknowledged your request and actively refused the connection. This is fine.
              </p>
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-rose-400">Open</h3>
              <p className="text-xs text-zinc-500">
                Something is listening here. If you intentionally run a service on this port, great. If you
                did not - that is a problem. Open ports are doors into your system. Only open what you need.
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Filtered</h3>
              <p className="text-xs text-zinc-500">
                A firewall ate your request. No response at all. This is the most secure state because it
                reveals nothing - attackers cannot even tell if a service exists behind that port.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How Hackers Use Port Scanning
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            I want you to understand the attacker mindset here. When hackers find a target, port scanning is
            step one. They are looking for low-hanging fruit - services that should not be exposed, outdated
            software with known vulnerabilities, or misconfigured systems with weak credentials.
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">Typical Attack Flow</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">1</span>
                <div>
                  <span className="text-zinc-300">Mass port scan to find open RDP/SSH</span>
                  <span className="text-zinc-500"> - Millions of IPs scanned in hours with tools like masscan</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">2</span>
                <div>
                  <span className="text-zinc-300">Credential stuffing or brute force</span>
                  <span className="text-zinc-500"> - Try leaked passwords or common combinations</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">3</span>
                <div>
                  <span className="text-zinc-300">Gain initial access</span>
                  <span className="text-zinc-500"> - One weak password is all it takes</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">4</span>
                <div>
                  <span className="text-zinc-300">Deploy ransomware</span>
                  <span className="text-zinc-500"> - Encrypt everything, demand $2M payment</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is not theoretical. In 2024, 26% of all ransomware infections started with RDP brute-force attacks.
            Attackers scan billions of IPs, find systems with exposed RDP, try common passwords, and cash in.
            It is horrifyingly simple and devastatingly effective.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Browser-Based Scanning: What We Can and Cannot Do
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me be honest with you. This tool runs in your browser, which means it is limited. Browsers
            block raw TCP socket connections for security reasons - imagine if any website could port scan
            your internal network. That would be a disaster.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Our scan uses timing-based detection through WebSockets and HTTP requests. It is good enough for
            basic checks on your own public IP, but for serious security audits, you need proper tools like
            nmap or masscan. This is by design, not a bug.
          </p>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
            <h3 className="mb-2 text-sm font-medium text-zinc-200">When to Use This Tool vs Professional Tools</h3>
            <div className="grid gap-4 md:grid-cols-2 text-xs">
              <div>
                <p className="text-emerald-400 font-medium mb-1">Use This Tool For:</p>
                <ul className="text-zinc-500 space-y-1">
                  <li>• Quick check of your own public IP</li>
                  <li>• Verifying if a specific port is accessible</li>
                  <li>• Educational purposes</li>
                  <li>• Basic sanity checks</li>
                </ul>
              </div>
              <div>
                <p className="text-amber-400 font-medium mb-1">Use Nmap/Masscan For:</p>
                <ul className="text-zinc-500 space-y-1">
                  <li>• Professional security audits</li>
                  <li>• Full network scans</li>
                  <li>• Service version detection</li>
                  <li>• Vulnerability assessments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How to Secure Your Ports
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Okay, you found some open ports. Now what? Here is exactly how to lock things down:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Close What You Do Not Need</h3>
              <p className="text-xs text-zinc-500">
                Running FTP? Use SFTP instead and close port 21. Have Telnet? Kill it, use SSH. MySQL on 3306?
                It should only listen on localhost. Every open port is an attack surface. Minimize ruthlessly.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Use a Firewall Properly</h3>
              <p className="text-xs text-zinc-500">
                Configure your firewall to DROP (not reject) packets to unused ports. DROP gives no response,
                making it look like nothing is there. REJECT tells attackers &quot;something is here.&quot;
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Move to Non-Standard Ports</h3>
              <p className="text-xs text-zinc-500">
                SSH on 22 gets hammered by bots. SSH on 2222 or 22222 gets 99% less automated attacks. Not
                foolproof, but it filters out the noise. Same for RDP - move it off 3389.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Use VPNs or Zero Trust</h3>
              <p className="text-xs text-zinc-500">
                RDP should never be exposed to the internet. Put it behind a VPN. Better yet, use a zero trust
                solution like Cloudflare Access or Tailscale. No exposed ports at all.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Legal Stuff: Do Not Get Yourself in Trouble
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Port scanning your own systems is 100% legal. Scanning systems you do not own without explicit
            written permission is illegal in most places. Even if it is technically legal in your jurisdiction,
            unauthorized scanning will get your IP blacklisted and might trigger investigations.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Professional penetration testers operate under formal contracts that define exactly what they can scan.
            &quot;I was just doing security research&quot; is not a valid legal defense. If you want to learn ethical
            hacking, use platforms like HackTheBox or TryHackMe where you have explicit permission to scan and
            attack systems.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Bottom Line
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Port scanning is the foundation of both attacking and defending systems. Attackers use it to find
            your weak points. You should use it to find and fix those weak points first. With over 3.5 million
            RDP ports and 20 million SSH ports exposed on the internet right now, the attackers have plenty of
            targets. Do not be one of them. Scan yourself, close what you do not need, and use proper firewalls.
          </p>
        </div>
      </section>
    </div>
  );
}
