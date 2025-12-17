import { Card, CardTitle } from '@/components/ui/card';
import type { ScanReport } from '@browserscan/types';

interface LeakPanelsProps {
  report: ScanReport;
}

export function LeakPanels({ report }: LeakPanelsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardTitle>WebRTC</CardTitle>
        <div className="mt-3 space-y-1 text-sm text-zinc-300">
          <p>Status: {report.network.leaks.webrtc.status}</p>
          <p>IP: {report.network.leaks.webrtc.ip}</p>
          <p>Region: {report.network.leaks.webrtc.region}</p>
        </div>
      </Card>
      <Card>
        <CardTitle>DNS</CardTitle>
        <div className="mt-3 space-y-1 text-sm text-zinc-300">
          <p>Status: {report.network.leaks.dns.status}</p>
          <p>Servers: {report.network.leaks.dns.servers.join(', ')}</p>
        </div>
      </Card>
    </div>
  );
}
