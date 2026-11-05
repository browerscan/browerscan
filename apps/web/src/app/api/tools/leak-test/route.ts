import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type LeakTestBody = Partial<{ webrtc_ips: string[]; dns_servers: string[]; ipv6_address?: string; ip?: string }>;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LeakTestBody;
  const requestIp = request.headers.get('cf-connecting-ip') ?? undefined;
  const payload = body.ip ? body : { ...body, ip: requestIp };

  if (!HAS_WORKER_ORIGIN) {
    return NextResponse.json(
      { status: 'error', message: 'Leak analysis service is not configured' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${WORKER_ORIGIN}/api/tools/leak-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const responsePayload = await response.json().catch(() => ({
      status: 'error',
      message: 'Leak analysis service returned an invalid response'
    }));
    return NextResponse.json(responsePayload, { status: response.status });
  } catch {
    console.error('Worker leak analysis request failed');
    return NextResponse.json(
      { status: 'error', message: 'Leak analysis service is temporarily unavailable' },
      { status: 502 }
    );
  }
}
