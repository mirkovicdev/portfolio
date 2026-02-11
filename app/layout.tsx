import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

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
    'theme-color': '#000000',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
