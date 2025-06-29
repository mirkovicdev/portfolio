import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Mirkovic',
  description: 'Portfolio',
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
          <Toaster 
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(39, 39, 42, 0.95)',
                border: '1px solid rgba(63, 63, 70, 0.5)',
                color: 'white',
              },
            }}
          />
      </body>
    </html>
  )
}
