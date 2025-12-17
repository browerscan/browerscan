import { Card, CardTitle } from '@/components/ui/card';
import type { ScanReport } from '@browserscan/types';

interface Props {
  report: ScanReport;
}

export function SoftwarePanel({ report }: Props) {
  const { software } = report.fingerprint;
  return (
    <Card className="space-y-3">
      <CardTitle>Software Surface</CardTitle>
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Fonts Hash</p>
        <p className="font-mono text-sm text-zinc-100">{software.fonts_hash}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Timezone</p>
        <p className="font-mono text-sm text-zinc-100">{software.timezone_name}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Languages</p>
        <p className="font-mono text-sm text-zinc-100">{software.languages.join(', ')}</p>
      </div>
    </Card>
  );
}
