import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type RecaptchaBody = Partial<{ score: number; action: string }>;

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as RecaptchaBody;
	const score = typeof body.score === 'number' ? body.score : 0.7;
	const action = typeof body.action === 'string' ? body.action : 'homepage';

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/simulation/recaptcha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, action })
      });

      if (response.ok) {
        return NextResponse.json(await response.json(), { status: response.status });
      }
      console.warn('Worker recaptcha simulation returned', response.status);
    } catch (error) {
      console.error('Worker recaptcha simulation failed, using fallback', error);
    }
  }

  const verdict = score >= 0.7 ? 'Likely human' : score >= 0.3 ? 'Suspicious' : 'Likely bot';

  return NextResponse.json({
    status: 'ok',
    data: {
      id: crypto.randomUUID(),
      score,
      timestamp: Math.floor(Date.now() / 1000),
      action,
      verdict,
      risk_level: score >= 0.7 ? 'low' : score >= 0.3 ? 'medium' : 'high',
      interpretation: {
        '0.0-0.3': 'Very likely a bot - block or challenge',
        '0.3-0.7': 'Suspicious - additional verification recommended',
        '0.7-1.0': 'Likely legitimate user - allow'
      }
    }
  });
}
