import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Network & IP Report — WebRTC, DNS & VPN/Proxy Signals',
  description:
    'Network section of the BrowserScan report: WebRTC exposure, DNS resolver status, IPv6 reachability, and VPN/proxy/Tor signals observed at the edge.',
  alternates: { canonical: '/report/network' },
};

export default function ReportNetworkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
