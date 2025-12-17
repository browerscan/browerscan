'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ScanReport } from '@browserscan/types';
import { sampleReport } from './sample-report';
import { useEffect, useState } from 'react';
import { PUBLIC_WORKER_ORIGIN } from './env.client';

const workerOrigin = typeof window !== 'undefined' ? PUBLIC_WORKER_ORIGIN : '';

/**
 * Fetch a specific scan by ID
 */
async function fetchScan(scanId: string): Promise<ScanReport> {
  const endpoint = workerOrigin ? `${workerOrigin}/api/scan/${scanId}` : `/api/scan/${scanId}`;
  const res = await fetch(endpoint, { cache: 'no-store' });
  if (!res.ok) throw new Error('Scan not found');
  const json = await res.json() as { data: ScanReport };
  return json.data;
}

/**
 * Fetch the latest scan (fallback)
 */
async function fetchLatestReport(): Promise<ScanReport> {
  try {
    const endpoint = workerOrigin ? `${workerOrigin}/api/scan/latest` : '/api/scan/latest';
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) throw new Error('Scan not ready');
    const json = await res.json() as { data: ScanReport };
    return json.data;
  } catch (error) {
    console.warn('Falling back to sample report', error);
    return sampleReport;
  }
}

/**
 * Start a new scan and collect fingerprints
 */
async function performNewScan(): Promise<ScanReport> {
  // Dynamically import fingerprint module (client-side only)
  const { performScan } = await import('./fingerprint');
  const { report } = await performScan(workerOrigin);
  return report as ScanReport;
}

/**
 * Hook for live report with auto-scan on mount
 */
export function useLiveReport() {
  const queryClient = useQueryClient();
  const [pageVisible, setPageVisible] = useState(true);

  // Mutation for triggering new scan
  const scanMutation = useMutation({
    mutationFn: performNewScan,
    onSuccess: (data) => {
      queryClient.setQueryData(['scan-report'], data);
    },
    onError: (error) => {
      console.error('Scan failed:', error);
    }
  });

  // Query for current report
  const query = useQuery({
    queryKey: ['scan-report'],
    queryFn: fetchLatestReport,
    refetchInterval: pageVisible ? 30_000 : false, // Pause polling when hidden
    placeholderData: sampleReport,
    staleTime: 10_000
  });

  // Track page visibility for adaptive polling
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibility = () => {
      setPageVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return {
    ...query,
    isScanning: scanMutation.isPending,
    scanError: scanMutation.error,
    rescan: () => scanMutation.mutate()
  };
}

/**
 * Hook to manually trigger a new scan
 */
export function useScanTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: performNewScan,
    onSuccess: (data) => {
      queryClient.setQueryData(['scan-report'], data);
    }
  });
}

/**
 * Hook to fetch a specific scan by ID
 */
export function useScanById(scanId: string | null) {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => scanId ? fetchScan(scanId) : Promise.reject('No scan ID'),
    enabled: !!scanId,
    placeholderData: sampleReport
  });
}
