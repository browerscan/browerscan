import { Card, CardTitle } from '@/components/ui/card';
import type { ScanReport } from '@browserscan/types';

interface Props {
  report: ScanReport;
}

export function NetworkProtocols({ report }: Props) {
  const { protocols } = report.network;
  const entries = [
    { label: 'TLS JA3', value: protocols.tls_ja3 },
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
    </Card>
  );
}
