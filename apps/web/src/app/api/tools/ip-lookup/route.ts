import { NextResponse } from 'next/server';
import { WORKER_ORIGIN, HAS_WORKER_ORIGIN } from '@/lib/env.server';

type IpIntelResult = {
	ip: string;
	asn: string;
	org: string;
	country: string;
	country_code: string;
	region: string;
	city: string;
	timezone: string;
	is_proxy: boolean;
	is_vpn: boolean;
	is_tor: boolean;
	is_hosting: boolean;
	fraud_score: number;
	coordinates: { lat: number; lon: number } | null;
};

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as Partial<{ ip: string }>;
	const ip = body.ip ?? '8.8.8.8';

	if (HAS_WORKER_ORIGIN) {
		try {
			const response = await fetch(`${WORKER_ORIGIN}/api/tools/ip-lookup`, {
				method: 'POST',
				body: JSON.stringify({ ip }),
				headers: { 'Content-Type': 'application/json' }
			});
      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (error) {
      console.error('Worker ip lookup failed, using fallback', error);
    }
  }

	const fallback: IpIntelResult = {
		ip,
		asn: 'AS13335 Cloudflare',
		org: 'Cloudflare',
		country: 'United States',
		country_code: 'US',
		region: 'California',
		city: 'Los Angeles',
		timezone: 'America/Los_Angeles',
		is_proxy: false,
		is_vpn: false,
		is_tor: false,
		is_hosting: false,
		fraud_score: ip.startsWith('64.') ? 85 : 12,
		coordinates: { lat: 34.0522, lon: -118.2437 }
	};

	return NextResponse.json({
		status: 'ok',
		data: fallback
	});
}
