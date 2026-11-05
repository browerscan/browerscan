import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hardware Report — Canvas, WebGL, Screen & Device',
  description:
    'Hardware section of the BrowserScan report: canvas and WebGL fingerprints, screen geometry, CPU concurrency, and device memory signals.',
  alternates: { canonical: '/report/hardware' },
};

export default function ReportHardwareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
