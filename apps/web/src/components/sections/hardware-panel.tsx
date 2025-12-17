import { Card, CardTitle } from '@/components/ui/card';
import type { ScanReport } from '@browserscan/types';

interface Props {
  report: ScanReport;
}

export function HardwarePanel({ report }: Props) {
  const { hardware } = report.fingerprint;
  const entries = [
    { label: 'Canvas Hash', value: hardware.canvas_hash },
    { label: 'WebGL Vendor', value: hardware.webgl_vendor },
    { label: 'WebGL Renderer', value: hardware.webgl_renderer },
    { label: 'Screen', value: hardware.screen },
    { label: 'Concurrency', value: String(hardware.concurrency) },
    { label: 'Memory (GB)', value: `${hardware.memory}` }
  ];

  return (
    <Card className="space-y-3">
      <CardTitle>Hardware Surface</CardTitle>
      {entries.map((item) => (
        <div key={item.label}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">{item.label}</p>
          <p className="font-mono text-sm text-zinc-100">{item.value}</p>
        </div>
      ))}
    </Card>
  );
}
