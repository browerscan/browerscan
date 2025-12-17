import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function POST() {
	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/scan/start`, { method: 'POST' });
      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (error) {
      console.error('Worker scan start failed, falling back', error);
    }
  }

  return NextResponse.json({
    status: 'ok',
    data: {
      scan_id: crypto.randomUUID(),
      eta_seconds: 2
    }
  });
}
