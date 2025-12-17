import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browser Fingerprint PDF Report Generator - Export Your Analysis',
  description: 'Generate professional PDF reports of your browser fingerprint analysis. Export trust scores, leak test results, hardware fingerprints, and privacy assessments for audits and documentation.',
  keywords: ['browser fingerprint report', 'pdf export', 'fingerprint analysis', 'security audit report', 'privacy report', 'trust score export', 'browser scan report'],
  openGraph: {
    title: 'PDF Report Generator | BrowserScan',
    description: 'Export your browser fingerprint analysis as a professional PDF report for security audits, compliance documentation, and privacy research.',
  },
};

export default function PdfGenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
