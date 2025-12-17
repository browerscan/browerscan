import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type TurnstileBody = Partial<{ token: string }>;

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as TurnstileBody;
	const token = typeof body.token === 'string' ? body.token : '';

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/tools/turnstile-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }
      console.warn('Worker turnstile-verify returned', response.status);
    } catch (error) {
      console.error('Worker turnstile-verify failed, using fallback', error);
    }
  }

  // Lightweight offline fallback: treat any non-empty token as success
  return NextResponse.json({
    status: 'ok',
    data: {
      success: Boolean(token),
      challenge_timestamp: new Date().toISOString(),
      hostname: 'localhost',
      errors: token ? undefined : ['missing-input-response']
    }
  });
}
