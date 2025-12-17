import { NextResponse } from 'next/server';
import { sampleReport } from '@/lib/sample-report';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function GET() {
	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/scan/latest`);
      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (error) {
      console.error('Worker fetch failed, serving sample', error);
    }
  }

  return NextResponse.json({ status: 'ok', data: sampleReport });
}
