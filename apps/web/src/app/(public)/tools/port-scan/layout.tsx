import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/tools/port-scan' },
  title: 'Network Exposure Assessment - IP Reputation & Hosting Signals',
  description: 'Assess an IP address for ASN, hosting, proxy, VPN, Tor, and reputation signals. BrowserScan clearly reports that no TCP port probe is performed.',
  keywords: ['network exposure assessment', 'ip reputation', 'hosting detection', 'proxy detection', 'vpn detection', 'asn lookup', 'port scan limitations'],
  openGraph: {
    title: 'Network Exposure Assessment | BrowserScan',
    description: 'Review public network identity and reputation signals without inventing TCP port results.',
  },
};

export default function PortScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
