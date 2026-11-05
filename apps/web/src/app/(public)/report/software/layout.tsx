import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software Report — Browser, OS, Fonts & Languages',
  description:
    'Software section of the BrowserScan report: browser and OS identity, declared languages, timezone, and font fingerprint signals.',
  alternates: { canonical: '/report/software' },
};

export default function ReportSoftwareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
