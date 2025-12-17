import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Analyzer - Browser Cookie Security & Privacy Tool',
  description: 'Free cookie analyzer to inspect browser cookies, security attributes, and tracking scripts. Over 92% of websites deploy tracking cookies without user knowledge. Check your cookie privacy now.',
  keywords: ['cookie analyzer', 'browser cookies', 'cookie security', 'third party cookies', 'cookie tracking', 'httponly cookie', 'secure cookie', 'samesite cookie', 'gdpr cookies', 'privacy cookies'],
  openGraph: {
    title: 'Cookie Analyzer | BrowserScan',
    description: 'Free cookie analyzer to inspect browser cookies and security attributes. Identify tracking cookies and privacy risks.',
  },
};

export default function CookieCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
