import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import AppLayout from "@/components/layout/AppLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://app.getstacc.org'),
  title: {
    default: "Stacc Roadmap",
    template: "%s | Stacc Roadmap",
  },
  description:
    "Stacc's visual skill tree for data careers — guided paths, curated free resources, real tasks, and progress tracking. Not learning. Just shipping.",
  applicationName: "Stacc Roadmap",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Stacc',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  keywords: [
    "learning roadmap",
    "data engineering",
    "data analytics",
    "data science",
    "AI engineering",
    "career paths",
    "stacc",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Stacc Roadmap",
    description:
      "Choose a direction, follow a focused skill sequence, and track progress through Stacc's data-career skill tree.",
    type: "website",
    siteName: "Stacc Roadmap",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stacc Roadmap",
    description: "Know exactly what to learn next — the visual skill tree for data careers.",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  colorScheme: 'dark light',
  themeColor: '#0a1628',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary selection:text-on-primary`}>
        <AppProviders>
          <AppLayout>{children}</AppLayout>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
