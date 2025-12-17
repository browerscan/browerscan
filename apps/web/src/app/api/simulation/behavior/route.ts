import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type BehaviorScore = {
  factor: string;
  score: number;
  weight: number;
};

export async function POST(request: Request) {
	const body = await request.json().catch(() => ({} as Record<string, unknown>));

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/simulation/behavior`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const json = await response.json() as {
          status: string;
          data: { scores?: Array<{ category?: string; factor?: string }> } & Record<string, unknown>;
        };

        // Normalize score field so the UI can render consistently
        if (json.data?.scores && Array.isArray(json.data.scores)) {
          json.data.scores = json.data.scores.map((item: Record<string, unknown>) => ({
            factor: typeof item.factor === 'string' ? item.factor : typeof item.category === 'string' ? item.category : 'Unclassified',
            score: typeof item.score === 'number' ? item.score : 0,
            weight: typeof item.weight === 'number' ? item.weight : 0
          } satisfies BehaviorScore));
        }

        return NextResponse.json(json, { status: response.status });
      }

      console.warn('Worker behavior analysis returned', response.status);
    } catch (error) {
      console.error('Worker behavior analysis failed, using heuristic fallback', error);
    }
  }

  const events = Array.isArray((body as Record<string, unknown>).events)
    ? ((body as Record<string, unknown>).events as unknown[])
    : [];

  const humanProbability = Math.min(95, Math.max(5, Math.round(Math.min(events.length * 7, 90))));
  const botProbability = 100 - humanProbability;
  const verdict = humanProbability >= 70 ? 'HUMAN' : humanProbability >= 45 ? 'SUSPICIOUS' : events.length < 5 ? 'UNKNOWN' : 'BOT';

  const fallbackScores: BehaviorScore[] = [
    { factor: 'Interaction Depth', score: Math.min(100, events.length * 10), weight: 0.4 },
    { factor: 'Motion Entropy', score: Math.min(80, events.length * 5), weight: 0.3 },
    { factor: 'Timing Variance', score: 55, weight: 0.3 }
  ];

  return NextResponse.json({
    status: 'ok',
    data: {
      session_id: (body as Record<string, unknown>).session_id ?? crypto.randomUUID(),
      timestamp: Math.floor(Date.now() / 1000),
      human_probability: humanProbability,
      bot_probability: botProbability,
      verdict,
      mouse_entropy: Number((events.length * 0.08).toFixed(2)),
      click_entropy: Number((events.length * 0.05).toFixed(2)),
      keyboard_entropy: Number((events.length * 0.04).toFixed(2)),
      scroll_entropy: Number((events.length * 0.03).toFixed(2)),
      scores: fallbackScores
    }
  });
}
