import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { QueryProvider } from '@/components/layout/query-provider';
import { ToastProvider } from '@/components/ui/toast';
import { SITE_URL } from '@/lib/env.server';

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: 'BrowserScan — Browser Fingerprint & Trust Score Analyzer | Free Online Tool',
		template: '%s | BrowserScan',
	},
	description: 'Free browser fingerprint analyzer and trust score calculator. Detect VPNs, proxies, WebRTC leaks, DNS leaks, bot signatures, and spoofing attempts with real-time JA3/JA4 TLS fingerprinting and 50+ detection signals.',
	metadataBase: new URL(SITE_URL),
	keywords: [
		'browser fingerprint',
		'browser fingerprint test',
		'trust score',
		'bot detection',
		'webrtc leak test',
		'dns leak test',
		'ip lookup',
		'fingerprint analysis',
		'canvas fingerprint',
		'webgl fingerprint',
		'ja3 fingerprint',
		'ja4 fingerprint',
		'vpn detection',
		'proxy detection',
		'browser privacy test',
		'anti-detect browser test',
	],
	authors: [{ name: 'BrowserScan', url: 'https://browserscan.org' }],
	creator: 'BrowserScan',
	publisher: 'BrowserScan',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		title: 'BrowserScan — Free Browser Fingerprint & Trust Score Analyzer',
		description: 'Analyze your browser fingerprint and get a trust score. Detect WebRTC leaks, DNS leaks, VPNs, proxies, and bot signatures in real-time.',
		type: 'website',
		siteName: 'BrowserScan',
		locale: 'en_US',
		url: SITE_URL,
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'BrowserScan - Browser Fingerprint & Trust Score Analyzer',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'BrowserScan — Browser Fingerprint & Trust Score Analyzer',
		description: 'Free browser fingerprint test. Check your trust score, detect leaks, and see what websites see about you.',
		creator: '@browserscan',
		images: ['/og-image.png'],
	},
	alternates: {
		canonical: SITE_URL,
	},
	category: 'technology',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/site.webmanifest" />
				<meta name="theme-color" content="#10b981" media="(prefers-color-scheme: light)" />
				<meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
				>
					Skip to main content
				</a>
				<QueryProvider>
					<ToastProvider>
						<div className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100">
							<Header />
							<main id="main-content" className="flex-1">{children}</main>
							<Footer />
						</div>
					</ToastProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
