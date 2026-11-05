'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';

const scanMessages = [
  'Booting sensor network…',
  'Collecting WebRTC candidates…',
  'Analyzing TLS cipher suites…',
  'Computing canvas fingerprint…',
  'Extracting WebGL renderer…',
  'Enumerating system fonts…',
  'Calculating audio context hash…',
  'Running consistency checks…',
  'Computing trust score…',
  'Finalizing report…'
];

export type ScanConsoleState = 'idle' | 'scanning' | 'complete' | 'demo' | 'error';

interface ScanConsoleProps {
  state?: ScanConsoleState;
}

export function ScanConsole({ state = 'idle' }: ScanConsoleProps) {
  const isScanning = state === 'scanning';
  const [messageIndex, setMessageIndex] = useState(0);
  const [clock, setClock] = useState<string>('');

  // Reset when scanning starts
  useEffect(() => {
    if (isScanning) {
      setMessageIndex(0);
    }
  }, [isScanning]);

  // Animate through messages while scanning
  useEffect(() => {
    if (!isScanning) {
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= scanMessages.length - 1) {
          // Loop back to start if still scanning
          return 0;
        }
        return prev + 1;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isScanning]);

  // Keep time client-side to avoid hydration mismatches
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-2xl border border-emerald-500/30 bg-black/60 p-4 font-mono text-xs text-emerald-300 backdrop-blur-sm"
      role="region"
      aria-label="Scan console"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            state === 'error'
              ? 'bg-rose-500'
              : state === 'demo'
                ? 'bg-amber-500'
                : isScanning
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-emerald-500'
          }`}
          role="status"
          aria-label={`Scan state: ${state}`}
        />
        <p className="text-emerald-400" aria-label="BrowserScan Engine version 1.0">[scan] BrowserScan Engine v1.0</p>
      </div>
      <div
        className="mt-2 h-28 overflow-hidden space-y-1"
        role="log"
        aria-label="Scan progress messages"
      >
        {isScanning ? (
          // Show animated messages while scanning
          <>
            {scanMessages.slice(0, messageIndex + 1).slice(-5).map((msg, i) => (
              <p key={`${msg}-${i}`} className="text-emerald-200/80">
                <span className="text-emerald-500">›</span> {msg}
              </p>
            ))}
            <p className="text-emerald-300 animate-pulse">
              <span className="text-emerald-500">›</span> Processing...
            </p>
          </>
        ) : state === 'complete' ? (
          <>
            <p className="text-emerald-200/80">
              <span className="text-emerald-500">›</span> Sensor network initialized
            </p>
            <p className="text-emerald-200/80">
              <span className="text-emerald-500">›</span> Fingerprints collected
            </p>
            <p className="text-emerald-200/80">
              <span className="text-emerald-500">›</span> Risk assessment complete
            </p>
            <p className="text-emerald-200/80">
              <span className="text-emerald-500">›</span> Report generated
            </p>
            <p className="text-emerald-400 font-medium">
              ✓ Live scan complete
            </p>
          </>
        ) : state === 'demo' ? (
          <>
            <p className="text-amber-200/80">
              <span className="text-amber-500">›</span> Demo dataset loaded
            </p>
            <p className="text-amber-200/80">
              <span className="text-amber-500">›</span> No browser measurement was performed
            </p>
            <p className="font-medium text-amber-400">Demo mode — values are illustrative</p>
          </>
        ) : state === 'error' ? (
          <>
            <p className="text-rose-200/80">
              <span className="text-rose-500">›</span> Live scan service unavailable
            </p>
            <p className="text-rose-200/80">
              <span className="text-rose-500">›</span> No report was generated
            </p>
            <p className="font-medium text-rose-400">Retry when the service is available</p>
          </>
        ) : (
          <>
            <p className="text-zinc-300">
              <span className="text-emerald-500">›</span> Sensors ready
            </p>
            <p className="text-zinc-400">Start a live scan to collect browser evidence.</p>
          </>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-emerald-500/20 flex justify-between text-emerald-500/60">
        <span role="status" aria-label={`Scan status: ${state}`}>Status: {state}</span>
        <span aria-label={`Current time: ${clock || 'loading'}`}>{clock || '—:—:—'}</span>
      </div>
    </div>
  );
}
