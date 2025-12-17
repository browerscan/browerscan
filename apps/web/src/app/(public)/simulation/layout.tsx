import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bot Detection Simulations - reCAPTCHA, Turnstile & Behavioral Analysis',
  description: 'Test bot detection systems in a safe sandbox. Simulate reCAPTCHA v3 scores, Cloudflare Turnstile challenges, and behavioral telemetry analysis. With 51% of web traffic now from bots, understanding detection is critical.',
  keywords: ['bot detection', 'recaptcha simulation', 'turnstile test', 'captcha testing', 'behavioral analysis', 'bot vs human', 'anti-bot testing', 'captcha sandbox', 'detection simulation'],
  openGraph: {
    title: 'Bot Detection Simulations | BrowserScan',
    description: 'Test and understand bot detection systems. Simulate reCAPTCHA scores, Turnstile challenges, and behavioral biometrics in a safe environment.',
  },
};

export default function SimulationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
