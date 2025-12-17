import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Base - Browser Fingerprinting, Privacy & Security Guides',
  description: 'Educational resources on browser fingerprinting, privacy protection, and online security. Learn how 94% of browsers are uniquely identifiable and what you can do to protect yourself.',
  keywords: ['browser fingerprinting guide', 'privacy guide', 'online security', 'digital privacy', 'browser privacy', 'fingerprint protection', 'tracking prevention', 'security knowledge base'],
  openGraph: {
    title: 'Knowledge Base | BrowserScan',
    description: 'Learn about browser fingerprinting, privacy protection, and online security. Educational guides for privacy-conscious users.',
  },
};

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
