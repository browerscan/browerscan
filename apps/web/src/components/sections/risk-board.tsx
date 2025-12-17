import { StatusDot } from '@/components/ui/status-dot';
import { cn } from '@/lib/utils';
import type { ScanReport } from '@browserscan/types';

const riskItems = (
  report: ScanReport
): Array<{ label: string; description: string; status: string; tone: 'safe' | 'risk' | 'warn' }> => [
  {
    label: 'WebRTC Leak',
    description: report.network.leaks.webrtc.status === 'LEAK' ? `${report.network.leaks.webrtc.ip} (${report.network.leaks.webrtc.region})` : 'No leak detected',
    status: report.network.leaks.webrtc.status,
    tone: report.network.leaks.webrtc.status === 'LEAK' ? 'risk' : 'safe'
  },
  {
    label: 'Proxy Detection',
    description: report.network.risk.is_proxy ? 'Proxy signature detected' : 'No proxy signals',
    status: report.network.risk.is_proxy ? 'Detected' : 'Clear',
    tone: report.network.risk.is_proxy ? 'warn' : 'safe'
  },
  {
    label: 'Timezone Consistency',
    description: report.consistency.timezone_check.evidence,
    status: report.consistency.timezone_check.status,
    tone: report.consistency.timezone_check.status === 'FAIL' ? 'risk' : 'warn'
  },
  {
    label: 'Bot Posture',
    description: report.network.risk.is_tor ? 'TOR indicator present' : 'Human-like behavior',
    status: report.network.risk.is_tor ? 'TOR' : 'Human',
    tone: report.network.risk.is_tor ? 'risk' : 'safe'
  }
];

interface RiskBoardProps {
  report: ScanReport;
  className?: string;
}

export function RiskBoard({ report, className }: RiskBoardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-2xl border border-zinc-800/80 bg-rose-500/5 p-5">
        <p className="text-xs uppercase tracking-[0.4em] text-rose-300">Risk Board</p>
        <div className="mt-4 grid gap-4">
          {riskItems(report).map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-4">
              <div>
                <p className="text-sm font-semibold text-zinc-200">{item.label}</p>
                <p className="text-xs text-zinc-500">{item.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <StatusDot tone={item.tone} />
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
