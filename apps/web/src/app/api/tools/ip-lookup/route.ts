import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<{ ip: string }>;
  const requestIp = request.headers.get('cf-connecting-ip') ?? undefined;
  const ip = body.ip?.trim() || requestIp;

  if (!HAS_WORKER_ORIGIN) {
    return NextResponse.json(
      { status: 'error', message: 'IP intelligence service is not configured' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${WORKER_ORIGIN}/api/tools/ip-lookup`, {
      method: 'POST',
      body: JSON.stringify(ip ? { ip } : {}),
      headers: { 'Content-Type': 'application/json' }
    });
    const payload = await response.json().catch(() => ({
      status: 'error',
      message: 'IP intelligence service returned an invalid response'
    }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    console.error('Worker IP lookup request failed');
    return NextResponse.json(
      { status: 'error', message: 'IP intelligence service is temporarily unavailable' },
      { status: 502 }
    );
  }
}
