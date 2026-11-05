import { Card, CardTitle } from '@/components/ui/card';
import type { ScanReport } from '@browserscan/types';

interface Props {
  report: ScanReport;
}

export function NetworkProtocols({ report }: Props) {
  const { protocols } = report.network;
  const tlsProfile = protocols.tls_profile ?? protocols.tls_ja3 ?? 'Unavailable';
  const entries = [
    { label: 'Edge TLS Profile', value: tlsProfile },
    { label: 'TLS Cipher', value: protocols.tls_cipher ?? 'Unavailable' },
    { label: 'TLS Version', value: protocols.tls_version },
    { label: 'HTTP Version', value: protocols.http_version },
    { label: 'TCP OS Guess', value: protocols.tcp_os_guess }
  ];

  return (
    <Card className="col-span-1">
      <CardTitle>Protocol Fingerprints</CardTitle>
      <div className="mt-4 space-y-3">
        {entries.map((entry) => (
          <div key={entry.label}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{entry.label}</p>
            <p className="font-mono text-sm text-zinc-100">{entry.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        Built from Cloudflare edge metadata. This is not a JA3 or JA4 ClientHello fingerprint.
      </p>
    </Card>
  );
}
