import { Card, CardTitle } from '@/components/ui/card';
import type { ScoreCard } from '@browserscan/types';

interface ScoreSummaryProps {
  score: ScoreCard;
}

export function ScoreSummary({ score }: ScoreSummaryProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardTitle>Deduction Log</CardTitle>
      <div className="mt-4 space-y-3">
        {score.deductions.map((deduction) => (
          <div key={deduction.code} className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-black/30 px-4 py-2">
            <div>
              <p className="text-sm font-semibold text-zinc-100">{deduction.code}</p>
              <p className="text-xs text-zinc-500">{deduction.desc}</p>
            </div>
            <p className="font-mono text-lg text-rose-400">{deduction.score}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
