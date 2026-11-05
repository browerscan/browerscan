import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consistency Report — Timezone, Language & OS Cross-Checks',
  description:
    'Consistency section of the BrowserScan report: timezone vs IP, declared language vs geolocation, and OS vs user-agent cross-checks used to flag spoofing.',
  alternates: { canonical: '/report/consistency' },
};

export default function ReportConsistencyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
