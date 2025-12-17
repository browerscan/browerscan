import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebRTC & DNS Leak Test - Free VPN Leak Detection Tool',
  description: 'Free WebRTC leak test, DNS leak test, and IPv6 leak detection. Check if your VPN is leaking your real IP address. Over 1.75 billion VPN users worldwide need protection from leaks.',
  keywords: ['webrtc leak test', 'dns leak test', 'vpn leak test', 'ip leak test', 'ipv6 leak test', 'webrtc ip leak', 'dns leak protection', 'vpn leak detection', 'browser privacy test'],
  openGraph: {
    title: 'WebRTC & DNS Leak Test | BrowserScan',
    description: 'Free WebRTC leak test, DNS leak test, and IPv6 leak detection. Check if your VPN is properly protecting your real IP address.',
  },
};

export default function LeakTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
