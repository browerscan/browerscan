'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import type { ScanMeta } from '@browserscan/types';

interface ActionPanelProps {
  scanId?: string;
  onRescan?: () => void;
  isScanning?: boolean;
  serverMeta?: ScanMeta['server'];
}

export function ActionPanel({ scanId, onRescan, isScanning, serverMeta }: ActionPanelProps) {
  const isDemo = !scanId || scanId === 'demo-scan-id';
  const [behaviorStatus, setBehaviorStatus] = useState<null | {
    verdict: string;
    human_probability: number;
    timestamp: number;
  }>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/simulation/behavior/history')
      .then(async (res) => {
        if (!res.ok) throw new Error('history fetch failed');
        return res.json() as Promise<{ data?: Array<{ verdict?: string; human_probability?: number; timestamp?: number }> }>;
      })
      .then((json) => {
        const latest = Array.isArray(json.data) && json.data.length > 0 ? json.data[0] : null;
        if (mounted && latest?.verdict && typeof latest.human_probability === 'number' && typeof latest.timestamp === 'number') {
          setBehaviorStatus({
            verdict: latest.verdict,
            human_probability: latest.human_probability,
            timestamp: latest.timestamp
          });
        }
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);
  const handleRescan = () => {
    if (onRescan && !isScanning) {
      onRescan();
    }
  };

  const handleExportPdf = async () => {
    if (isDemo) return;

    // Open PDF report in new tab
    window.open(`/api/scan/${scanId}/pdf`, '_blank');
  };

  const handleShare = async () => {
    if (isDemo) return;

    const shareUrl = `${window.location.origin}/report?id=${scanId}`;

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BrowserScan Report',
          text: 'Check out my browser fingerprint analysis',
          url: shareUrl
        });
        return;
      } catch {
        // Fall back to clipboard
      }
    }

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch {
      // Manual fallback
      prompt('Copy this link:', shareUrl);
    }
  };

  const actionLabel = !isDemo ? 'Re-Scan' : 'Start Scan';

  return (
    <Card className="col-span-1">
      <CardTitle>Actions</CardTitle>
      {serverMeta && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-100">
          <p className="font-semibold text-emerald-300">Edge Path</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-emerald-100/80">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">Colo</p>
              <p className="font-mono">{serverMeta.colo ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">HTTP</p>
              <p className="font-mono">{serverMeta.http_protocol ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">TLS</p>
              <p className="font-mono">{serverMeta.tls_version ?? '—'}</p>
            </div>
            {serverMeta.ray_id && (
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">Ray ID</p>
                <p className="font-mono break-all">{serverMeta.ray_id}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {behaviorStatus && (
        <div className="mt-3 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 text-xs text-sky-100">
          <p className="font-semibold text-sky-300">Behavior Telemetry</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sky-400">Verdict</p>
              <p className="font-mono text-sm">{behaviorStatus.verdict}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-sky-400">Human Probability</p>
              <p className="font-mono text-sm">{behaviorStatus.human_probability}%</p>
              <p className="text-[10px] text-sky-400">{new Date(behaviorStatus.timestamp * 1000).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}
      <div className="mt-4 space-y-3">
        {/* Export PDF */}
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isDemo}
          className="flex w-full items-center justify-between rounded-xl border border-white/5 px-4 py-3 text-sm text-zinc-200 transition hover:border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          Export PDF
          <span className="text-emerald-400" aria-hidden="true">→</span>
        </button>

        {/* Share Link */}
        <button
          type="button"
          onClick={handleShare}
          disabled={isDemo}
          className="flex w-full items-center justify-between rounded-xl border border-white/5 px-4 py-3 text-sm text-zinc-200 transition hover:border-sky-500/40 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          Share Link
          <span className="text-sky-400" aria-hidden="true">→</span>
        </button>

        {/* Re-Scan */}
        <button
          type="button"
          onClick={handleRescan}
          disabled={isScanning}
          className="flex w-full items-center justify-between rounded-xl border border-white/5 px-4 py-3 text-sm text-zinc-200 transition hover:border-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          {isScanning ? 'Scanning…' : actionLabel}
          <span className="text-amber-400" aria-hidden="true">{isScanning ? '⟳' : '→'}</span>
        </button>

        {/* Link to Tools */}
        <Link
          href="/tools"
          className="flex w-full items-center justify-between rounded-xl border border-white/5 px-4 py-3 text-sm text-zinc-200 transition hover:border-zinc-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          More Tools
          <span className="text-zinc-400" aria-hidden="true">→</span>
        </Link>
      </div>
    </Card>
  );
}
