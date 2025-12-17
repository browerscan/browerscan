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

interface ScanConsoleProps {
  isScanning?: boolean;
}

export function ScanConsole({ isScanning = false }: ScanConsoleProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [complete, setComplete] = useState(!isScanning);
  const [clock, setClock] = useState<string>('');

  // Reset when scanning starts
  useEffect(() => {
    if (isScanning) {
      setMessageIndex(0);
      setComplete(false);
    }
  }, [isScanning]);

  // Animate through messages while scanning
  useEffect(() => {
    if (!isScanning) {
      setComplete(true);
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

  // Mark complete when scanning finishes
  useEffect(() => {
    if (!isScanning && messageIndex > 0) {
      setComplete(true);
    }
  }, [isScanning, messageIndex]);

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
          className={`h-2 w-2 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`}
          role="status"
          aria-label={isScanning ? 'Scanning in progress' : 'Scan ready'}
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
        ) : (
          // Show completion state
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
            {complete && (
              <p className="text-emerald-400 font-medium">
                ✓ Scan complete — all systems nominal
              </p>
            )}
          </>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-emerald-500/20 flex justify-between text-emerald-500/60">
        <span role="status" aria-label={`Scan status: ${isScanning ? 'Scanning' : 'Ready'}`}>Status: {isScanning ? 'Scanning' : 'Ready'}</span>
        <span aria-label={`Current time: ${clock || 'loading'}`}>{clock || '—:—:—'}</span>
      </div>
    </div>
  );
}
