import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type PortScanBody = Partial<{ ip: string; ports: number[] }>;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PortScanBody;
	const ip = body.ip ?? '';
	const ports = Array.isArray(body.ports) && body.ports.length > 0
		? body.ports
		: [22, 80, 443, 3389, 8080];

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/tools/port-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, ports })
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }

      console.warn('Worker port-scan returned', response.status);
    } catch (error) {
      console.error('Worker port-scan failed, using fallback', error);
    }
  }

  // Browser cannot truly port-scan; return deterministic placeholder
  const fallbackPorts = ports.map((port) => ({
    port,
    status: port === 80 || port === 443 ? 'open' : 'unknown',
    service: guessService(port)
  }));

  return NextResponse.json({
    status: 'ok',
    data: {
      target_ip: ip || 'local',
      ports: fallbackPorts,
      note: 'Edge fallback — real TCP port probing requires the worker or backend service.'
    }
  });
}

function guessService(port: number): string {
  const map: Record<number, string> = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC',
    6379: 'Redis',
    8080: 'HTTP-ALT',
    8443: 'HTTPS-ALT'
  };
  return map[port] ?? 'Unknown';
}
