import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust Score Methodology - How Browser Fingerprint Scoring Works',
  description: 'Understand our trust score calculation methodology. Learn how we analyze 50+ signals including browser fingerprints, network characteristics, and consistency checks to calculate risk scores.',
  keywords: ['trust score methodology', 'fingerprint scoring', 'risk calculation', 'browser analysis', 'detection methodology', 'scoring algorithm', 'fraud score calculation'],
  openGraph: {
    title: 'Trust Score Methodology | BrowserScan',
    description: 'Technical deep-dive into how we calculate browser trust scores from fingerprints, network data, and behavioral signals.',
  },
};

export default function MethodologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
