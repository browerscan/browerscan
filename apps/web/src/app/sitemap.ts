import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env.server';

const baseUrl = SITE_URL.replace(/\/$/, '');

type RouteConfig = {
  path: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
};

const routes: RouteConfig[] = [
  // Homepage - highest priority
  { path: '/', priority: 1.0, changeFrequency: 'daily' },

  // Main tool pages - high priority (core functionality)
  { path: '/tools', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/tools/ip-lookup', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/tools/leak-test', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/tools/port-scan', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/tools/pdf-gen', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tools/cookie-check', priority: 0.7, changeFrequency: 'weekly' },

  // Simulation pages - high priority (unique content)
  { path: '/simulation', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/simulation/recaptcha', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/simulation/turnstile', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/simulation/behavior', priority: 0.8, changeFrequency: 'weekly' },

  // Report pages - medium priority (require scan to be useful)
  { path: '/report', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/report/network', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/report/software', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/report/hardware', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/report/consistency', priority: 0.5, changeFrequency: 'monthly' },

  // Knowledge base - medium-high priority (SEO content)
  { path: '/knowledge', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/knowledge/privacy', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/knowledge/methodology', priority: 0.7, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
