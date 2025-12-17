import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type WebRTCBody = Partial<{ webrtc_ips: string[] }>;

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as WebRTCBody;

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/tools/webrtc-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }
      console.warn('Worker webrtc-check returned', response.status);
    } catch (error) {
      console.error('Worker webrtc-check failed, using fallback', error);
    }
  }

  const webrtcIps = Array.isArray(body.webrtc_ips) ? body.webrtc_ips : [];
  const publicIp = webrtcIps.find(ip => !isPrivate(ip)) || '';
  const leakedIp = webrtcIps.find(ip => !isPrivate(ip) && ip !== publicIp);

  const status = leakedIp ? 'LEAK' : webrtcIps.length === 0 ? 'UNKNOWN' : 'SAFE';

  return NextResponse.json({
    status: 'ok',
    data: {
      public_ip: publicIp,
      status,
      ip: leakedIp ?? publicIp,
      region: '',
      is_leaked: status === 'LEAK'
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
