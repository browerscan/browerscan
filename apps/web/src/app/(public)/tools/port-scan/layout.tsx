import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Port Scanner - Free Network Security Testing Tool',
  description: 'Free online port scanner to check open ports and network security. Detect exposed services like RDP, SSH, FTP, MySQL. Over 3.5 million systems have RDP port 3389 exposed to the internet.',
  keywords: ['port scanner', 'online port scan', 'check open ports', 'network security test', 'rdp port scan', 'ssh port scan', 'firewall test', 'nmap alternative', 'tcp port scanner'],
  openGraph: {
    title: 'Online Port Scanner | BrowserScan',
    description: 'Free online port scanner to check open ports and network security. Detect exposed services and potential vulnerabilities.',
  },
};

export default function PortScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
