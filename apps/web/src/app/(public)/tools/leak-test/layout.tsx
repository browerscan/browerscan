import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/tools/leak-test' },
  title: 'WebRTC & DNS Leak Test - Free VPN Leak Detection Tool',
  description: 'Check WebRTC IP evidence and IPv6 reachability. DNS is reported as unknown unless resolver-path evidence is actually available.',
  keywords: ['webrtc leak test', 'dns leak test', 'vpn leak test', 'ip leak test', 'ipv6 leak test', 'webrtc ip leak', 'dns leak protection', 'vpn leak detection', 'browser privacy test'],
  openGraph: {
    title: 'WebRTC & DNS Leak Test | BrowserScan',
    description: 'Check WebRTC IP evidence and IPv6 reachability with explicit unknown states when DNS resolver evidence is unavailable.',
  },
};

export default function LeakTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
