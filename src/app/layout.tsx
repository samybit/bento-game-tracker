import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nexus-board.vercel.app'),

  title: {
    default: 'Nexus Board | Master Your Backlog',
    template: '%s | Nexus Board'
  },
  description: 'A high-performance, Bento-styled game completion board powered by Gemini AI. Track achievements and generate roadmaps.',
  applicationName: 'Nexus Board',
  authors: [{ name: 'Samy' }],
  creator: 'Samy',
  publisher: 'Nexus Board',
  formatDetection: { telephone: false },

  // Open Graph (Discord, Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: 'Nexus Board',
    description: 'Master your backlog with intelligence and style.',
    url: 'https://nexus-board.vercel.app',
    siteName: 'Nexus Board',
    locale: 'en_US',
    type: 'website',
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus Board',
    description: 'Master your backlog with intelligence and style.',
    creator: '@samy',
  },

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
  // Keywords for search engines
  keywords: ['gaming', 'backlog', 'achievements', 'tracker', 'nextjs', 'bento grid'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
