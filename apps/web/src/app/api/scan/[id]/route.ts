import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sampleReport } from '@/lib/sample-report';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id: scanId } = await params;

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/scan/${scanId}`, { cache: 'no-store' });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }

      console.warn('Worker scan fetch returned', response.status);
    } catch (error) {
      console.error('Worker scan fetch failed, using fallback', error);
    }
  }

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
