import type { NextRequest } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id: scanId } = await params;

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/scan/${scanId}/pdf`, { method: 'POST' });

      if (response.ok) {
        const contentType = response.headers.get('content-type') ?? 'text/html; charset=utf-8';
        const body = await response.text();
        return new Response(body, {
          status: response.status,
          headers: {
            'Content-Type': contentType
          }
        });
      }

      console.warn('Worker PDF proxy returned', response.status);
    } catch (error) {
      console.error('Worker PDF proxy failed, using fallback', error);
    }
  }

  const fallbackHtml = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>BrowserScan Report Placeholder</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0b0b0f; color: #e5e7eb; padding: 40px; }
        .card { max-width: 720px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 28px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: #1e293b; color: #38bdf8; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">Preview Only</div>
        <h1>Report not ready yet</h1>
        <p>The PDF for scan <strong>${scanId}</strong> is not available. If you just triggered a scan, wait a few seconds and try again.</p>
      </div>
    </body>
  </html>`;

  return new Response(fallbackHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
