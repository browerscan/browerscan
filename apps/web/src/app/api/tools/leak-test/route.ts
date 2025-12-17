import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type LeakTestBody = Partial<{ webrtc_ips: string[]; dns_servers: string[]; ipv6_address?: string; ip?: string }>;

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as LeakTestBody;

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/tools/leak-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }
      console.warn('Worker leak-test returned', response.status);
    } catch (error) {
      console.error('Worker leak-test failed, using fallback', error);
    }
  }

  const webrtcIps = Array.isArray(body.webrtc_ips) ? body.webrtc_ips : [];
  const publicIp = body.ip ?? webrtcIps.find(ip => !isPrivate(ip)) ?? '127.0.0.1';
  const leakedIp = webrtcIps.find(ip => !isPrivate(ip) && ip !== publicIp);

  return NextResponse.json({
    status: 'ok',
    data: {
      webrtc: leakedIp
        ? { status: 'LEAK', ip: leakedIp, region: 'Unknown' }
        : webrtcIps.length === 0
          ? { status: 'UNKNOWN', ip: '', region: '' }
          : { status: 'SAFE', ip: publicIp, region: '' },
      dns: {
        status: 'SAFE',
        servers: Array.isArray(body.dns_servers) && body.dns_servers.length > 0
          ? body.dns_servers
          : ['1.1.1.1']
      },
      ipv6: body.ipv6_address ? { status: 'LEAK', address: body.ipv6_address } : { status: 'SAFE', address: null }
    }
  });
}

function isPrivate(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127
  );
}
