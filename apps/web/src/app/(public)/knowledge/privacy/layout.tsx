import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Protection Guide - Defend Against Browser Fingerprinting',
  description: 'Comprehensive guide to protecting your privacy online. Learn how to reduce browser fingerprinting, prevent tracking, and maintain anonymity. Over 70% of users are concerned about tracking.',
  keywords: ['privacy protection', 'anti fingerprinting', 'browser privacy', 'tracking protection', 'privacy guide', 'online anonymity', 'fingerprint prevention', 'privacy tools'],
  openGraph: {
    title: 'Privacy Protection Guide | BrowserScan',
    description: 'Learn how to protect your privacy from browser fingerprinting and online tracking. Practical tips and tool recommendations.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
