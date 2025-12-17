import { NextResponse } from 'next/server';
import { sampleReport } from '@/lib/sample-report';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function POST(request: Request) {
	const body = await request.json().catch(() => ({} as Record<string, unknown>));

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/scan/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }
    } catch (error) {
      console.error('Worker scan collect failed, using fallback', error);
    }
  }

  const scanId = typeof body === 'object' && body && 'scan_id' in body
    ? String((body as Record<string, unknown>).scan_id)
    : crypto.randomUUID();

  const fallback = {
    ...sampleReport,
    meta: {
      ...sampleReport.meta,
      scan_id: scanId,
      timestamp: Math.floor(Date.now() / 1000)
    }
  };

  return NextResponse.json({ status: 'ok', data: fallback });
}
