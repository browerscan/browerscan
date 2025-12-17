import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Security Tools - IP Lookup, Leak Tests, Port Scanner & More',
  description: 'Professional security tools for IP intelligence, WebRTC/DNS leak testing, port scanning, cookie analysis, and PDF report generation. With 37% of internet traffic being malicious bots, security visibility is essential.',
  keywords: ['security tools', 'ip lookup tool', 'leak test', 'port scanner', 'cookie analyzer', 'privacy tools', 'network security', 'penetration testing tools', 'free security tools'],
  openGraph: {
    title: 'Free Security Tools | BrowserScan',
    description: 'Professional security utilities: IP lookup, WebRTC/DNS leak tests, port scanner, cookie analyzer, and PDF report generator. All free, no registration required.',
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
