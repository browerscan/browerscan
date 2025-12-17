import { NextResponse } from 'next/server';
import { PUBLIC_WORKER_ORIGIN, HAS_PUBLIC_WORKER } from '@/lib/env.server';

export const runtime = 'edge'; // Use edge runtime for low latency

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: string; context?: unknown };

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message is required'
        }
      }, { status: 400 });
    }

    if (!HAS_PUBLIC_WORKER) {
      return NextResponse.json({
        status: 'error',
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'AI chat service not configured'
        }
      }, { status: 503 });
    }

    // Forward to worker
    const response = await fetch(`${PUBLIC_WORKER_ORIGIN}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('AI chat proxy error:', error);
    return NextResponse.json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process chat request'
      }
    }, { status: 500 });
  }
}
