import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IP Address Lookup & Geolocation Tool',
  description: 'Free IP lookup tool with geolocation, ASN, proxy detection, and fraud scoring. Check any IP address for VPN, Tor, hosting provider, and risk assessment.',
  keywords: ['ip lookup', 'ip geolocation', 'ip address lookup', 'ip fraud score', 'vpn detection', 'proxy detection', 'tor detection', 'ip intelligence', 'asn lookup'],
  openGraph: {
    title: 'IP Address Lookup & Geolocation Tool | BrowserScan',
    description: 'Free IP lookup tool with geolocation, ASN, proxy detection, and fraud scoring. Check any IP address for VPN, Tor, and risk assessment.',
  },
};

export default function IpLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
