import { Card } from '@/components/ui/card';
import type { ConsistencySection } from '@browserscan/types';

interface Props {
  consistency: ConsistencySection;
}

export function ConsistencyMatrix({ consistency }: Props) {
  const tests = [
    { key: 'timezone_check', label: 'Timezone vs IP' },
    { key: 'language_check', label: 'Language vs Locale' },
    { key: 'os_check', label: 'OS Consistency' }
  ] as const;

  return (
    <Card className="col-span-1 md:col-span-2">
      <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Consistency Matrix</p>
      <div className="mt-4 space-y-3">
        {tests.map((test) => {
          const data = consistency[test.key];
          return (
            <div key={test.key} className="flex flex-col gap-1 rounded-2xl border border-zinc-800/80 bg-black/30 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{test.label}</p>
                <p className="text-xs text-zinc-500">{data.evidence}</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-400">{data.status}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
