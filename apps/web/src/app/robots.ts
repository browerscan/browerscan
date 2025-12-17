import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env.server';

const baseUrl = SITE_URL.replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/report/*', // Dynamic scan report pages
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'], // Block OpenAI crawler
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'], // Block Common Crawl for AI training
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'], // Block Google AI training
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'], // Block Anthropic crawler
      },
      {
        userAgent: 'ClaudeBot',
        disallow: ['/'], // Block Claude crawler
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
