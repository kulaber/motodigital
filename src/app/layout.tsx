import type { Metadata } from 'next'
import { Bodoni_Moda, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import './globals.css'

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '700'], // nur tatsächlich genutzte Gewichte
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'MotoDigital — Custom Bikes, Builder & Builds',
    template: '%s | MotoDigital',
  },
  description: 'Die erste Plattform für Custom Motorrad Kultur. Finde Builder, kaufe Builds, starte dein Projekt.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://motodigital.vercel.app'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    siteName: 'MotoDigital',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
  themeColor: '#2AABAB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${bodoniModa.variable} ${inter.variable}`}>
      <body>
        {children}
        <MobileBottomNav />
        <Analytics />
      </body>
    </html>
  )
}
