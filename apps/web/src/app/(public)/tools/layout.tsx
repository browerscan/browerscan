import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/tools' },
  title: 'Free Security Tools - IP Lookup, Leak Tests & Exposure Assessment',
  description: 'Security tools for IP intelligence, WebRTC evidence, DNS capability status, network exposure assessment, cookie analysis, and PDF report generation.',
  keywords: ['security tools', 'ip lookup tool', 'leak test', 'network exposure assessment', 'cookie analyzer', 'privacy tools', 'network security', 'free security tools'],
  openGraph: {
    title: 'Free Security Tools | BrowserScan',
    description: 'Security utilities for IP intelligence, WebRTC evidence, network exposure assessment, cookie analysis, and PDF reports.',
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
