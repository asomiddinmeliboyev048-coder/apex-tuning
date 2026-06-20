import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'APEX TUNING',
  description: "O'zbekiston eng yaxshi virtual avto garaj ilovasi",
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#E63946',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" data-theme="dark">
      <body className={inter.className} style={{ background: '#0d0d0d', color: '#fff' }}>
        {children}
        <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a2e', color: '#fff' } }} />
      </body>
    </html>
  )
}
