import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'reCAPTCHA v3 Score Simulator - Understand Google Bot Detection',
  description: 'Simulate Google reCAPTCHA v3 scores from 0.0 to 1.0. Learn how score thresholds work for bot detection. reCAPTCHA is used on 10M+ websites with ~50% of bot traffic still passing through.',
  keywords: ['recaptcha v3', 'recaptcha score', 'recaptcha simulator', 'google recaptcha', 'bot detection', 'captcha bypass', 'recaptcha threshold', 'invisible captcha', 'recaptcha testing'],
  openGraph: {
    title: 'reCAPTCHA v3 Score Simulator | BrowserScan',
    description: 'Understand how Google reCAPTCHA v3 scores work. Simulate scores from 0.0 (bot) to 1.0 (human) and learn threshold configurations.',
  },
};

export default function RecaptchaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
