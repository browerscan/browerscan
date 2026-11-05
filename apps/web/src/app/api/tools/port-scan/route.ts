import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type PortScanBody = Partial<{ ip: string; ports: number[] }>;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PortScanBody;
  const requestIp = request.headers.get('cf-connecting-ip') ?? undefined;
  const ip = body.ip?.trim() || requestIp;
  const ports = Array.isArray(body.ports) && body.ports.length > 0
    ? body.ports
    : [22, 80, 443, 3389, 8080];

  if (!HAS_WORKER_ORIGIN) {
    return NextResponse.json(
      { status: 'error', message: 'Network assessment service is not configured' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${WORKER_ORIGIN}/api/tools/port-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ip ? { ip, ports } : { ports })
    });
    const payload = await response.json().catch(() => ({
      status: 'error',
      message: 'Network assessment service returned an invalid response'
    }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    console.error('Worker network assessment request failed');
    return NextResponse.json(
      { status: 'error', message: 'Network assessment service is temporarily unavailable' },
      { status: 502 }
    );
  }
}
