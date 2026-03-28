import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preise — MotoDigital',
  description: 'Übersicht der Rider- und Builder-Preismodelle auf MotoDigital. Kostenloser Einstieg für Rider, Premium-Optionen für Werkstätten.',
  openGraph: {
    title: 'Preise — MotoDigital',
    description: 'Übersicht der Rider- und Builder-Preismodelle auf MotoDigital.',
  },
}

export default function PreiseLayout({ children }: { children: React.ReactNode }) {
  return children
}
