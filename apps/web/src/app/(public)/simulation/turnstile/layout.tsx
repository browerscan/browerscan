import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloudflare Turnstile Test - Privacy-Focused CAPTCHA Alternative',
  description: 'Test Cloudflare Turnstile bot detection in a safe sandbox. Validate tokens and understand how this privacy-focused reCAPTCHA alternative works without sending data to Google.',
  keywords: ['cloudflare turnstile', 'turnstile test', 'turnstile captcha', 'cloudflare bot detection', 'recaptcha alternative', 'privacy captcha', 'turnstile token', 'invisible captcha'],
  openGraph: {
    title: 'Cloudflare Turnstile Test | BrowserScan',
    description: 'Test and validate Cloudflare Turnstile challenges. A privacy-focused alternative to reCAPTCHA that works without image puzzles.',
  },
};

export default function TurnstileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
