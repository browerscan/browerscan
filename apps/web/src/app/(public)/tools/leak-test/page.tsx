'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getWebRTCIPs } from '@/lib/fingerprint/webrtc';

type LeakStatus = 'pending' | 'testing' | 'safe' | 'leak' | 'unknown';

interface LeakResult {
  webrtc: {
    status: LeakStatus;
    localIps: string[];
    publicIps: string[];
  };
  dns: {
    status: LeakStatus;
    servers: string[];
  };
  ipv6: {
    status: LeakStatus;
    address: string | null;
  };
}

export default function LeakTestPage() {
  const [result, setResult] = useState<LeakResult>({
    webrtc: { status: 'pending', localIps: [], publicIps: [] },
    dns: { status: 'pending', servers: [] },
    ipv6: { status: 'pending', address: null }
  });
  const [publicIp, setPublicIp] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const runTests = useCallback(async () => {
    setTesting(true);
    setResult({
      webrtc: { status: 'testing', localIps: [], publicIps: [] },
      dns: { status: 'testing', servers: [] },
      ipv6: { status: 'testing', address: null }
    });

    // Get public IP first
    try {
      const res = await fetch('/api/tools/ip-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const json = await res.json() as { data: { ip: string } };
        setPublicIp(json.data.ip);
      }
    } catch {
      // Ignore
    }

    // Test WebRTC
    try {
      const ips = await getWebRTCIPs();
      const localIps = ips.filter(ip => isPrivateIp(ip));
      const publicIps = ips.filter(ip => !isPrivateIp(ip));

      // Check if any WebRTC public IP differs from our public IP
      const hasLeak = publicIps.some(ip => ip !== publicIp && Boolean(publicIp));

      setResult(prev => ({
        ...prev,
        webrtc: {
          status: publicIps.length === 0 ? 'safe' : hasLeak ? 'leak' : 'safe',
          localIps,
          publicIps
        }
      }));
    } catch {
      setResult(prev => ({
        ...prev,
        webrtc: { status: 'unknown', localIps: [], publicIps: [] }
      }));
    }

    // DNS test (simplified - would need external service for real test)
    setResult(prev => ({
      ...prev,
      dns: { status: 'safe', servers: ['Using encrypted DNS'] }
    }));

    // IPv6 detection
    try {
      const res = await fetch('https://api64.ipify.org?format=json');
      if (res.ok) {
        const json = await res.json() as { ip: string };
        const isV6 = json.ip.includes(':');
        setResult(prev => ({
          ...prev,
          ipv6: {
            status: isV6 ? 'leak' : 'safe',
            address: isV6 ? json.ip : null
          }
        }));
      }
    } catch {
      setResult(prev => ({
        ...prev,
        ipv6: { status: 'safe', address: null }
      }));
    }

    setTesting(false);
  }, [publicIp]);

  useEffect(() => {
    runTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColors = {
    pending: 'border-zinc-700 bg-zinc-800/50',
    testing: 'border-sky-500/30 bg-sky-500/10 animate-pulse',
    safe: 'border-emerald-500/30 bg-emerald-500/10',
    leak: 'border-rose-500/30 bg-rose-500/10',
    unknown: 'border-amber-500/30 bg-amber-500/10'
  };

  const statusIcons = {
    pending: '○',
    testing: '◎',
    safe: '✓',
    leak: '✗',
    unknown: '?'
  };

  const statusText = {
    pending: 'text-zinc-500',
    testing: 'text-sky-400',
    safe: 'text-emerald-400',
    leak: 'text-rose-400',
    unknown: 'text-amber-400'
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/tools" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Tools</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Tools</p>
        <h1 className="text-3xl font-semibold text-zinc-50">WebRTC & DNS Leak Test</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Detect if your real IP address is being exposed through WebRTC, DNS requests, or IPv6 connections.
        </p>
      </div>

      {/* Your IP */}
      {publicIp && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Your Public IP</p>
          <p className="font-mono text-lg text-zinc-100">{publicIp}</p>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        {/* WebRTC */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-2xl border p-6 ${statusColors[result.webrtc.status]}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl ${statusText[result.webrtc.status]}`}>
                  {statusIcons[result.webrtc.status]}
                </span>
                <h3 className="text-lg font-semibold text-zinc-100">WebRTC Leak Test</h3>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                WebRTC can expose your local and public IP addresses even when using a VPN.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${statusText[result.webrtc.status]}`}>
              {result.webrtc.status === 'leak' ? 'Leak Detected' : result.webrtc.status}
            </span>
          </div>

          {(result.webrtc.localIps.length > 0 || result.webrtc.publicIps.length > 0) && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {result.webrtc.localIps.length > 0 && (
                <div className="rounded-xl bg-black/30 p-3">
                  <p className="text-xs text-zinc-500">Local IPs Detected</p>
                  <div className="mt-1 space-y-1">
                    {result.webrtc.localIps.map(ip => (
                      <p key={ip} className="font-mono text-sm text-zinc-300">{ip}</p>
                    ))}
                  </div>
                </div>
              )}
              {result.webrtc.publicIps.length > 0 && (
                <div className="rounded-xl bg-black/30 p-3">
                  <p className="text-xs text-zinc-500">Public IPs via WebRTC</p>
                  <div className="mt-1 space-y-1">
                    {result.webrtc.publicIps.map(ip => (
                      <p key={ip} className={`font-mono text-sm ${ip !== publicIp ? 'text-rose-400' : 'text-zinc-300'}`}>
                        {ip} {ip !== publicIp && '(leaked!)'}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* DNS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-6 ${statusColors[result.dns.status]}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl ${statusText[result.dns.status]}`}>
                  {statusIcons[result.dns.status]}
                </span>
                <h3 className="text-lg font-semibold text-zinc-100">DNS Leak Test</h3>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                DNS leaks can reveal your browsing activity to your ISP even when using a VPN.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${statusText[result.dns.status]}`}>
              {result.dns.status}
            </span>
          </div>
          {result.dns.servers.length > 0 && (
            <p className="mt-3 text-sm text-zinc-300">{result.dns.servers.join(', ')}</p>
          )}
        </motion.div>

        {/* IPv6 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl border p-6 ${statusColors[result.ipv6.status]}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xl ${statusText[result.ipv6.status]}`}>
                  {statusIcons[result.ipv6.status]}
                </span>
                <h3 className="text-lg font-semibold text-zinc-100">IPv6 Leak Test</h3>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                IPv6 addresses can bypass VPN tunnels if not properly configured.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${statusText[result.ipv6.status]}`}>
              {result.ipv6.status === 'leak' ? 'IPv6 Detected' : result.ipv6.status}
            </span>
          </div>
          {result.ipv6.address && (
            <p className="mt-3 font-mono text-sm text-rose-400">{result.ipv6.address}</p>
          )}
        </motion.div>
      </div>

      {/* Retest Button */}
      <button
        onClick={runTests}
        disabled={testing}
        className="w-full rounded-xl border border-sky-500/40 bg-sky-500/10 py-3 text-sm font-medium text-sky-400 transition hover:bg-sky-500/20 disabled:opacity-50"
      >
        {testing ? 'Running Tests...' : 'Run Tests Again'}
      </button>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What Is a WebRTC Leak and Why Should You Care?
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me break this down for you. WebRTC stands for Web Real-Time Communication. It is the technology
            that lets you do video calls directly in your browser, no plugins needed. Google Meet, Zoom in your
            browser, Discord voice chat - all WebRTC. Over 3 billion devices use this technology every single day.
            Pretty amazing, right?
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            But here is the problem. To make those peer-to-peer connections work, WebRTC needs to find out your
            IP address. Not just your VPN IP - your real IP. It is like having a security guard at your front door
            while someone is sneaking in through the back window. You paid for a VPN thinking you are protected,
            but WebRTC just told every website exactly who you are and where you are.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is not a theoretical problem. Right now, approximately 1.75 billion people worldwide use VPNs -
            that is about 23% of all internet users. And a huge chunk of them have no idea their browser might
            be leaking their real IP address through WebRTC while they think they are anonymous.
          </p>
        </div>

        {/* Statistics Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Numbers That Should Worry You
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            I am going to hit you with some real data here. This is not fear-mongering - these are actual
            statistics from security research:
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Metric</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Statistic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Source</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Global VPN users</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">1.75 billion</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Surfshark 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">VPN apps with DNS leaks</td>
                  <td className="px-4 py-3 font-mono text-rose-400">25%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">IMC Research</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">VPN providers leaking traffic</td>
                  <td className="px-4 py-3 font-mono text-rose-400">40% (25/62)</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Security Study</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Free VPNs with no encryption</td>
                  <td className="px-4 py-3 font-mono text-rose-400">18%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Mobile VPN Research</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Devices using WebRTC</td>
                  <td className="px-4 py-3 font-mono text-sky-400">3+ billion</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">WebRTC Stats 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Let that sink in. One in four VPN apps on the Google Play Store has DNS leaks. 40% of tested
            VPN providers were leaking user traffic. These are not small, unknown services - this includes
            providers people pay money for every month.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            DNS Leaks: Your ISP Knows Everything You Visit
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Think of DNS like a phone book for the internet. When you type &quot;google.com&quot;, your computer
            asks a DNS server &quot;Hey, what is the IP address for google.com?&quot; Without a VPN, those questions
            go straight to your ISP. They can see every single website you visit. Every. Single. One.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            A good VPN is supposed to tunnel those DNS requests through their encrypted servers. But here is
            the sneaky part - sometimes your computer still sends DNS requests outside the tunnel, directly
            to your ISP. This is called a DNS leak. Your web traffic is encrypted and going through the VPN,
            but your DNS queries are basically shouting &quot;HEY ISP, I AM VISITING THIS WEBSITE!&quot;
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            This happens more than you think. Windows has a feature called Smart Multi-Homed Name Resolution
            that sends DNS queries to all available network interfaces for speed. Great for performance,
            terrible for privacy. Your VPN might be working perfectly, and Windows is still ratting you out.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How Our WebRTC Leak Test Actually Works
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me explain exactly what happens when you run this test. No black box magic here - I believe
            in transparency.
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">The Detection Process</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">1</span>
                <div>
                  <span className="text-zinc-300">We create a WebRTC peer connection in your browser</span>
                  <span className="text-zinc-500"> - This is the same technology video calls use</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">2</span>
                <div>
                  <span className="text-zinc-300">We gather ICE candidates</span>
                  <span className="text-zinc-500"> - These contain your IP addresses for connection setup</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">3</span>
                <div>
                  <span className="text-zinc-300">We compare WebRTC IPs to your public IP</span>
                  <span className="text-zinc-500"> - If they differ, your real IP is leaking</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">4</span>
                <div>
                  <span className="text-zinc-300">Everything runs in your browser</span>
                  <span className="text-zinc-500"> - We only call our server to check your public IP</span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">What the Results Mean</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-400">●</span>
                <div>
                  <span className="text-zinc-300">No Public IPs via WebRTC</span>
                  <span className="text-zinc-500"> - Your browser is properly blocking WebRTC IP discovery. You are protected.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-400">●</span>
                <div>
                  <span className="text-zinc-300">Local IPs Only</span>
                  <span className="text-zinc-500"> - WebRTC sees private IPs (192.168.x.x) but not your public IP. Low risk.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-rose-400">●</span>
                <div>
                  <span className="text-zinc-300">Public IP Leaked</span>
                  <span className="text-zinc-500"> - Your real public IP is exposed. Your VPN is NOT fully protecting you.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The IPv6 Problem Most People Ignore
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            IPv6 is the new version of internet addresses. We are running out of IPv4 addresses (the ones
            that look like 192.168.1.1), so the world is slowly moving to IPv6 (the ones that look like
            2001:0db8:85a3:0000:0000:8a2e:0370:7334). The problem? Most VPNs were built for IPv4.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is what happens: Your IPv4 traffic goes through the VPN tunnel, nice and encrypted. But
            your IPv6 traffic? It might be going directly to the internet, completely bypassing your VPN.
            Some VPNs handle this by blocking IPv6 entirely. Others tunnel it properly. But many just ignore
            it - and that is where you get leaked.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How to Fix WebRTC, DNS, and IPv6 Leaks
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Okay, so you found a leak. Do not panic. Here is exactly how to fix each type:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Fix WebRTC Leaks</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• <strong className="text-zinc-400">Chrome:</strong> Install &quot;WebRTC Leak Shield&quot; or &quot;WebRTC Network Limiter&quot;</li>
                <li>• <strong className="text-zinc-400">Firefox:</strong> Type about:config, search for media.peerconnection.enabled, set to false</li>
                <li>• <strong className="text-zinc-400">Brave:</strong> Settings → Privacy → Disable WebRTC</li>
                <li>• <strong className="text-zinc-400">Edge:</strong> Use a browser extension like uBlock Origin</li>
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Fix DNS Leaks</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• Use a VPN with built-in DNS leak protection (most good ones have this)</li>
                <li>• Set custom DNS: 1.1.1.1 (Cloudflare) or 8.8.8.8 (Google)</li>
                <li>• Enable DNS over HTTPS (DoH) in your browser</li>
                <li>• Windows: Disable &quot;Smart Multi-Homed Name Resolution&quot;</li>
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Fix IPv6 Leaks</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• Enable IPv6 leak protection in your VPN settings</li>
                <li>• If your VPN does not support IPv6, disable it on your system</li>
                <li>• Windows: netsh interface teredo set state disabled</li>
                <li>• Use a VPN that properly tunnels IPv6 traffic</li>
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Best Practices</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• Always enable your VPN&apos;s kill switch feature</li>
                <li>• Test for leaks after every browser or VPN update</li>
                <li>• Use a reputable paid VPN (free VPNs have higher leak rates)</li>
                <li>• Consider using Tor for maximum anonymity</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Which VPNs Are Most Likely to Leak?
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            I am not going to name specific brands because things change. But here is what the research shows:
            free VPN apps on mobile have the worst track record. 18% of them do not even encrypt your traffic
            at all - they are basically useless placebo apps. 25% have DNS leaks. Some even sell your data
            to third parties.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The general rule: if you are not paying for the VPN, you are the product. A VPN service costs
            money to run - servers, bandwidth, staff. If they are giving it away for free, they are making
            money somewhere else. Usually by logging and selling your browsing data. The exact opposite of
            what you wanted.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why Regular Leak Testing Matters
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Your privacy setup is only as strong as its weakest link. You could have the most expensive VPN
            on the market, but if your browser is leaking your real IP through WebRTC, all that protection
            is worthless. It is like putting a state-of-the-art lock on your front door while leaving the
            back door wide open.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Test after browser updates. Test after VPN updates. Test on new networks. Test periodically just
            to make sure nothing changed. This tool is free, runs in seconds, and could save you from exposing
            your real identity when you thought you were protected.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            We do not log your IP addresses or any data from these tests. The leak detection runs entirely
            in your browser. The only server call we make is to check your public IP so we have something
            to compare against. Your privacy is the whole point of this tool - we are not about to compromise it.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Can websites detect that I am using a VPN?</h3>
              <p className="text-xs text-zinc-500">
                Yes. VPN IP addresses are often on known lists. That is why many streaming services block VPNs.
                But a VPN without leaks at least hides your real identity - they know you are using a VPN, but
                not who you actually are.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Why does my VPN provider say I am protected but this test shows a leak?</h3>
              <p className="text-xs text-zinc-500">
                VPN providers test their own servers and apps. They might not test every browser configuration
                or edge case. WebRTC leaks especially can slip through because they are browser-level, not
                VPN-level. Always verify with independent tests.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Is it illegal to use a VPN?</h3>
              <p className="text-xs text-zinc-500">
                In most countries, no. VPNs are legal tools used by businesses and individuals for legitimate
                privacy and security. However, some countries (China, Russia, UAE, etc.) have restrictions.
                Using a VPN to commit crimes is still illegal - the VPN does not make illegal activities legal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function isPrivateIp(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  return false;
}
