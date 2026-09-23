import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

// Self-hosted by Next.js at build time. Inter for UI, JetBrains Mono for the name and section headings
const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Antonije Mirkovic',
  description: 'Systems response to constraint.',
  keywords: ['quantitative finance', 'software engineer', 'mathematics', 'trading systems', 'machine learning', 'portfolio optimization'],
  authors: [{ name: 'Antonije Mirkovic' }],
  creator: 'Antonije Mirkovic',
  metadataBase: new URL('https://mirkovic.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mirkovic.dev',
    title: 'Antonije Mirkovic',
    description: 'Systems response to constraint.',
    siteName: 'Antonije Mirkovic',
  },
  twitter: {
    card: 'summary',
    title: 'Antonije Mirkovic',
    description: 'Systems response to constraint.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
  },
  other: {
    'theme-color': '#09090b',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
