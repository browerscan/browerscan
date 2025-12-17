"use client";

import Script from 'next/script';
import dynamic from 'next/dynamic';
import { PageShell } from '@/components/layout/page-shell';
import { ActionPanel } from '@/components/sections/action-panel';
import { ConsistencyMatrix } from '@/components/sections/consistency-matrix';
import { HealthRing } from '@/components/sections/health-ring';
import { IdentityPanel } from '@/components/sections/identity-panel';
import { RiskBoard } from '@/components/sections/risk-board';
import { ScanConsole } from '@/components/sections/scan-console';
import { ScoreSummary } from '@/components/sections/score-summary';
import { SoftwarePanel } from '@/components/sections/software-panel';
import { ChatWidget } from '@/components/chat/chat-widget';
import { useLiveReport } from '@/lib/use-live-report';

const LeakPanels = dynamic(() => import('@/components/sections/leak-panels').then(m => m.LeakPanels), {
  loading: () => <SkeletonCard className="h-40" />
});

const HardwarePanel = dynamic(() => import('@/components/sections/hardware-panel').then(m => m.HardwarePanel), {
  loading: () => <SkeletonCard className="h-48" />
});

const NetworkProtocols = dynamic(() => import('@/components/sections/network-protocols').then(m => m.NetworkProtocols), {
  loading: () => <SkeletonCard className="h-40" />
});

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-zinc-800/60 bg-zinc-900/30 ${className ?? 'h-24'}`} />
  );
}

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BrowserScan',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Any',
  description: 'Free browser fingerprint analyzer and trust score calculator. Detects VPNs, proxies, WebRTC leaks, and bot signatures with real-time analysis.',
  url: 'https://browserscan.org',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Browser Fingerprint Analysis',
    'Trust Score Calculation (0-100)',
    'WebRTC Leak Detection',
    'DNS Leak Testing',
    'VPN/Proxy Detection',
    'Bot Detection',
    'Canvas Fingerprinting',
    'TLS JA3/JA4 Fingerprinting',
    'Hardware Profiling',
    'Timezone Consistency Checks',
  ],
  publisher: {
    '@type': 'Organization',
    name: 'BrowserScan',
    url: 'https://browserscan.org',
  },
};

// Organization schema for brand recognition
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BrowserScan',
  url: 'https://browserscan.org',
  logo: 'https://browserscan.org/logo.png',
  description: 'Browser fingerprinting and privacy analysis platform trusted by security researchers and developers worldwide.',
  sameAs: [
    'https://twitter.com/browserscan',
    'https://github.com/browerscan/browerscan',
  ],
};

// FAQ schema for rich snippets
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a browser fingerprint?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A browser fingerprint is a collection of information about your browser and device that websites can use to identify you. This includes your screen resolution, installed fonts, browser plugins, timezone, language settings, and more. When combined, these attributes create a unique identifier that can track you across websites without cookies.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a trust score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A trust score is a numerical rating (0-100) that indicates how trustworthy your browser configuration appears to websites. Higher scores suggest a genuine user, while lower scores may indicate bot activity, VPN usage, or suspicious browser modifications. BrowserScan calculates this score by analyzing over 50 data points including network behavior, hardware fingerprints, and consistency checks.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a WebRTC leak?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A WebRTC leak occurs when your real IP address is exposed through WebRTC (Web Real-Time Communication) despite using a VPN or proxy. This happens because WebRTC can bypass VPN tunnels to establish direct peer-to-peer connections. BrowserScan detects these leaks by comparing your public IP with any IPs exposed through WebRTC.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does bot detection work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bot detection analyzes browser behavior and attributes that are difficult for automated scripts to replicate. This includes checking for consistent mouse movements, realistic typing patterns, proper JavaScript execution, authentic browser APIs, and valid hardware fingerprints. BrowserScan examines these signals in real-time to distinguish human users from bots.',
      },
    },
  ],
};

export default function HomePage() {
  const { data, isScanning, rescan } = useLiveReport();
  const report = data!;

  const hasLiveScan = report?.meta?.scan_id && report.meta.scan_id !== 'demo-scan-id';
  const subtitle = isScanning
    ? 'Scanning your browser fingerprint...'
    : hasLiveScan
      ? `Scan #${report.meta.scan_id.slice(0, 8)} • ${new Date(report.meta.timestamp * 1000).toLocaleString()}`
      : 'Ready to scan — click Start Scan to capture a live report';

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="json-ld-app"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="json-ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageShell
        title="Browser Fingerprint & Trust Score Analyzer"
        subtitle={subtitle}
        actions={<ScanConsole isScanning={isScanning} />}
      >
        {/* SEO Intro Section */}
        <div className="mb-8 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <p className="text-sm leading-relaxed text-zinc-400">
            Your browser reveals more than you think. Every time you visit a website, it broadcasts
            a unique combination of hardware specs, software settings, and network characteristics.
            This is your <strong className="text-zinc-200">browser fingerprint</strong>. Companies use it to track you,
            detect fraud, and distinguish real users from bots. BrowserScan shows you exactly what
            websites see and calculates your <strong className="text-zinc-200">trust score</strong> based on 50+ data points
            including WebRTC leaks, DNS configuration, TLS fingerprints, and behavioral patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* Health Ring - Hero Card */}
          <div className="col-span-1 md:col-span-2 row-span-2 rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 to-zinc-900/60 backdrop-blur-sm p-6">
            <HealthRing
              score={report.score.total}
              grade={report.score.grade}
              verdict={report.score.verdict}
              isLoading={isScanning}
            />
          </div>

          {/* Identity Card */}
          <IdentityPanel identity={report.identity} />

          {/* Risk Board */}
          <RiskBoard report={report} className="col-span-1 md:col-span-2" />

          {/* Score Summary */}
          <ScoreSummary score={report.score} />

          {/* Network Protocols */}
          <NetworkProtocols report={report} />

          {/* Action Panel */}
          <ActionPanel
            scanId={report.meta.scan_id}
            onRescan={rescan}
            isScanning={isScanning}
            serverMeta={report.meta.server}
          />

          {/* Leak Panels */}
          <div className="col-span-1 md:col-span-2">
            <LeakPanels report={report} />
          </div>

          {/* Consistency Matrix */}
          <ConsistencyMatrix consistency={report.consistency} />

          {/* Hardware Panel */}
          <HardwarePanel report={report} />

          {/* Software Panel */}
          <SoftwarePanel report={report} />
        </div>

        {/* Extended SEO Content Section */}
        <section className="mt-12 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-100">
              What Your Browser Fingerprint Reveals
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
                <h3 className="mb-2 text-sm font-medium text-emerald-400">Network Identity</h3>
                <p className="text-xs text-zinc-500">
                  Your IP address, ISP, ASN, and geolocation tell websites where you are and how
                  you connect. VPNs and proxies change this, but can be detected through various methods.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
                <h3 className="mb-2 text-sm font-medium text-sky-400">Hardware Fingerprint</h3>
                <p className="text-xs text-zinc-500">
                  Canvas rendering, WebGL capabilities, screen resolution, and CPU cores create a
                  hardware profile that is surprisingly unique across devices.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
                <h3 className="mb-2 text-sm font-medium text-amber-400">Software Configuration</h3>
                <p className="text-xs text-zinc-500">
                  Installed fonts, plugins, timezone, language settings, and browser version combine
                  to distinguish your browser from millions of others.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-100">
              How Trust Scoring Works
            </h2>
            <p className="text-sm text-zinc-400">
              BrowserScan starts you at 100 points and deducts for anything suspicious. Using a VPN?
              That is minus 15 points. WebRTC leaking your real IP? Another 20 points gone. Bot-like
              behavior patterns? You might lose 25 points. The remaining score tells websites how much
              they should trust your session. This is the same methodology used by major ad networks,
              e-commerce platforms, and financial institutions to prevent fraud.
            </p>
            <div className="grid gap-3 text-xs md:grid-cols-4">
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-emerald-400">
                <span className="font-mono font-bold">90-100</span>
                <span>Grade A - Excellent</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-sky-500/10 px-3 py-2 text-sky-400">
                <span className="font-mono font-bold">75-89</span>
                <span>Grade B - Good</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-amber-400">
                <span className="font-mono font-bold">50-74</span>
                <span>Grade C - Fair</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-rose-500/10 px-3 py-2 text-rose-400">
                <span className="font-mono font-bold">0-49</span>
                <span>Grade D/F - Poor</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-100">
              Why This Matters
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <strong className="text-zinc-200">For Privacy:</strong> Understanding your fingerprint
                  is the first step to protecting it. You cannot defend against tracking methods you
                  do not know exist.
                </p>
                <p>
                  <strong className="text-zinc-200">For Developers:</strong> Testing anti-fraud systems,
                  bot detection, and user verification requires knowing what real browser fingerprints
                  look like.
                </p>
              </div>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <strong className="text-zinc-200">For Security:</strong> Penetration testers and red teams
                  use fingerprint analysis to assess how detectable their tools and techniques are.
                </p>
                <p>
                  <strong className="text-zinc-200">For Research:</strong> Academic researchers study
                  fingerprinting to develop better privacy protections and understand tracking ecosystems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Chat Widget */}
        <ChatWidget scanId={report?.meta?.scan_id} />
      </PageShell>
    </>
  );
}
