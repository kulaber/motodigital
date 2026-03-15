import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MotoDigital — Custom Bikes, Builder & Builds',
    template: '%s | MotoDigital',
  },
  description: 'Die erste Plattform für Custom Motorrad Kultur. Finde Builder, kaufe Builds, starte dein Projekt.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://motodigital.io'),
  openGraph: {
    siteName: 'MotoDigital',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={font.variable}>
      <body>{children}</body>
    </html>
  )
}
