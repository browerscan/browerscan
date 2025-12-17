import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function GET() {
	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/simulation/behavior/history`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }

      console.warn('Worker behavior history returned', response.status);
    } catch (error) {
      console.error('Worker behavior history fetch failed, returning empty set', error);
    }
  }

  return NextResponse.json({ status: 'ok', data: [] });
}
