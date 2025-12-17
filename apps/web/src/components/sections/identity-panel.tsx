'use client';

import { useState, useCallback } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import type { ScanIdentity } from '@browserscan/types';

interface IdentityPanelProps {
  identity: ScanIdentity;
}

const identityEntries: Array<{ key: keyof ScanIdentity; label: string; copyable?: boolean }> = [
  { key: 'ip', label: 'IP Address', copyable: true },
  { key: 'asn', label: 'ASN', copyable: true },
  { key: 'location', label: 'Location', copyable: true },
  { key: 'browser', label: 'Browser', copyable: true },
  { key: 'os', label: 'OS', copyable: true },
  { key: 'device', label: 'Device', copyable: true }
];

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IdentityPanel({ identity }: IdentityPanelProps) {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedIp, setRevealedIp] = useState(false);

  const handleCopy = useCallback(async (key: keyof ScanIdentity, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast(`${key === 'ip' ? 'IP Address' : key.toUpperCase()} copied`);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      toast('Failed to copy', 'error');
    }
  }, [toast]);

  const handleCopyAll = useCallback(async () => {
    const data = identityEntries
      .map(({ key, label }) => `${label}: ${identity[key]}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(data);
      toast('All identity data copied');
    } catch {
      toast('Failed to copy', 'error');
    }
  }, [identity, toast]);

  return (
    <Card className="col-span-1 space-y-4 md:col-span-2">
      <div className="flex items-center justify-between">
        <CardTitle>Identity</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">Digital fingerprint snapshot</span>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="Copy all identity data"
          >
            <CopyIcon className="h-3 w-3" />
            Copy All
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {identityEntries.map(({ key, label, copyable }) => (
          <div
            key={key}
            className={cn(
              'group relative rounded-lg border border-transparent p-3 transition-colors',
              copyable && 'cursor-pointer hover:border-zinc-800 hover:bg-zinc-900/50'
            )}
            onClick={() => {
              if (key === 'ip' && !revealedIp) {
                setRevealedIp(true);
                return;
              }
              if (copyable) handleCopy(key, identity[key]);
            }}
            role={copyable ? 'button' : undefined}
            tabIndex={copyable ? 0 : undefined}
            onKeyDown={(e) => {
              if (copyable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                if (key === 'ip' && !revealedIp) {
                  setRevealedIp(true);
                  return;
                }
                handleCopy(key, identity[key]);
              }
            }}
            aria-label={copyable ? `Copy ${label}: ${identity[key]}` : undefined}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{label}</p>
              {copyable && (
                <span className={cn(
                  'flex items-center gap-1 text-[10px] transition-opacity',
                  copiedKey === key ? 'text-emerald-400 opacity-100' : 'text-zinc-500 opacity-0 group-hover:opacity-100'
                )}>
                  {copiedKey === key ? (
                    <>
                      <CheckIcon className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-3 w-3" />
                      {key === 'ip' && !revealedIp ? 'Click to reveal' : 'Click to copy'}
                    </>
                  )}
                </span>
              )}
            </div>
            <p className={cn(
              'mt-1.5 font-mono text-lg text-zinc-100 transition-all',
              key === 'ip' && !revealedIp && 'select-none blur-sm hover:blur-0'
            )}>
              {identity[key]}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
