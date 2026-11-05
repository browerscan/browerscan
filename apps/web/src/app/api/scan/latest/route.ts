import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function GET() {
  if (!HAS_WORKER_ORIGIN) {
    return NextResponse.json(
      { status: 'error', message: 'Scan service is not configured' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${WORKER_ORIGIN}/api/scan/latest`, { cache: 'no-store' });
    const payload = await response.json().catch(() => ({
      status: 'error',
      message: 'Scan service returned an invalid response'
    }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    console.error('Worker latest-scan request failed');
    return NextResponse.json(
      { status: 'error', message: 'Scan service is temporarily unavailable' },
      { status: 502 }
    );
  }
}
