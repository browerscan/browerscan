import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id: scanId } = await params;

  if (!HAS_WORKER_ORIGIN) {
    return NextResponse.json(
      { status: 'error', message: 'Scan service is not configured' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${WORKER_ORIGIN}/api/scan/${scanId}`, { cache: 'no-store' });
    const payload = await response.json().catch(() => ({
      status: 'error',
      message: 'Scan service returned an invalid response'
    }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    console.error('Worker scan lookup request failed');
    return NextResponse.json(
      { status: 'error', message: 'Scan service is temporarily unavailable' },
      { status: 502 }
    );
  }
}
