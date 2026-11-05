import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function POST(request: Request) {
	const body = await request.json().catch(() => ({} as Record<string, unknown>));

  if (!HAS_WORKER_ORIGIN) {
    return NextResponse.json(
      { status: 'error', message: 'Scan service is not configured' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${WORKER_ORIGIN}/api/scan/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({
      status: 'error',
      message: 'Scan service returned an invalid response'
    }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    console.error('Worker scan collect request failed');
    return NextResponse.json(
      { status: 'error', message: 'Scan service is temporarily unavailable' },
      { status: 502 }
    );
  }
}
