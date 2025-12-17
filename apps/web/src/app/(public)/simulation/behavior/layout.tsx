import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Behavioral Telemetry Analysis - Bot vs Human Detection Tool',
  description: 'Test bot detection systems with behavioral biometrics. Analyze mouse movements, typing patterns, and click behavior. In 2024, automated bots make up 51% of internet traffic - see how detection works.',
  keywords: ['bot detection', 'behavioral biometrics', 'mouse tracking', 'bot vs human', 'captcha alternative', 'fraud detection', 'entropy analysis', 'behavioral analysis', 'anti-bot'],
  openGraph: {
    title: 'Behavioral Telemetry Analysis | BrowserScan',
    description: 'Understand how bot detection works using behavioral biometrics. Test mouse movements, clicks, and typing patterns against real detection algorithms.',
  },
};

export default function BehaviorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
