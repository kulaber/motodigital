import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FaqAccordion, { type FaqItem } from '../support/FaqAccordion'

export const metadata: Metadata = {
  title: 'FAQ — MotoDigital',
  description:
    'Häufige Fragen zu MotoDigital — Allgemein, Custom Werkstatt und Rider. Finde Antworten auf die wichtigsten Fragen zur Plattform.',
  alternates: { canonical: 'https://motodigital.io/faq' },
}

const FAQ_ALLGEMEIN: FaqItem[] = [
  {
    question: 'Was ist MotoDigital?',
    answer:
      'MotoDigital ist die erste digitale Plattform für Custom Motorcycle Culture in Europa. Wir verbinden Custom-Werkstätten, Bike-Käufer und Rider — direkt, kostenlos und ohne Umwege.',
  },
  {
    question: 'Ist MotoDigital kostenlos?',
    answer:
      'Ja! Die Registrierung als Rider oder Werkstatt ist komplett kostenlos. Werkstätten können optional kostenpflichtige Premium-Features nutzen — z. B. hervorgehobene Listings oder erweiterte Analytics.',
  },
  {
    question: 'In welchen Ländern ist MotoDigital verfügbar?',
    answer:
      'Aktuell fokussieren wir uns auf den DACH-Raum (Deutschland, Österreich, Schweiz). Die Expansion in weitere europäische Märkte ist geplant.',
  },
  {
    question: 'Welche Motorrad-Stile gibt es auf MotoDigital?',
    answer:
      'Auf MotoDigital findest du alle gängigen Custom-Stile: Cafe Racer, Bobber, Scrambler, Tracker, Chopper, Street und Enduro. Du kannst nach Stil filtern, um genau das zu finden, was du suchst.',
  },
  {
    question: 'Wie kann ich MotoDigital kontaktieren?',
    answer:
      'Du kannst uns jederzeit über das Kontaktformular auf unserer Support-Seite erreichen oder eine E-Mail an info@motodigital.de senden. Wir antworten in der Regel innerhalb von 48 Stunden.',
  },
]

const FAQ_WERKSTATT: FaqItem[] = [
  {
    question: 'Wie kann ich meine Werkstatt registrieren?',
    answer:
      'Klicke auf „Als Werkstatt registrieren", gib deine E-Mail ein und bestätige den Magic Link. Danach kannst du dein Werkstatt-Profil mit Fotos, Galerie und Standort anlegen — in wenigen Minuten bist du live.',
  },
  {
    question: 'Wie finde ich eine Custom-Werkstatt in meiner Nähe?',
    answer:
      'Auf der Seite „Custom Werkstatt" findest du eine interaktive Karte mit allen registrierten Werkstätten. Du kannst nach Standort, Stil und Spezialisierung filtern.',
  },
  {
    question: 'Wie funktioniert die Kontaktaufnahme mit Werkstätten?',
    answer:
      'Auf jeder Werkstatt-Profilseite findest du einen Kontakt-Button. Darüber kannst du direkt eine Nachricht an die Werkstatt senden — ohne Umwege oder Gebühren.',
  },
]

const FAQ_RIDER: FaqItem[] = [
  {
    question: 'Kann ich als Rider ein Profil erstellen?',
    answer:
      'Ja! Als Rider kannst du dein eigenes Profil mit deinem Custom Bike erstellen, andere Rider entdecken und Teil der Community werden.',
  },
  {
    question: 'Wie kann ich ein Custom Bike verkaufen?',
    answer:
      'Der Custom Bike Marktplatz wird demnächst verfügbar sein. Du kannst dann dein Bike mit Fotos, Beschreibung und Preis einstellen. Käufer kontaktieren dich direkt über die Plattform.',
  },
]

const ALL_FAQ = [...FAQ_ALLGEMEIN, ...FAQ_WERKSTATT, ...FAQ_RIDER]

function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd items={ALL_FAQ} />
      <Header />

      {/* Hero */}
      <section className="bg-[#222222] overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(6,165,165,0.07) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-5">
            FAQ
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-3xl">
            Häufige Fragen
          </h1>
          <p className="text-base text-white/40 max-w-lg leading-relaxed">
            Hier findest du Antworten auf die häufigsten Fragen rund um
            MotoDigital. Falls du nicht fündig wirst, schreib uns über
            unsere{' '}
            <a href="/support" className="text-[#06a5a5] hover:underline">
              Support-Seite
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8">

          {/* Allgemein */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-white mb-6">Allgemein</h2>
            <FaqAccordion items={FAQ_ALLGEMEIN} />
          </div>

          {/* Custom Werkstatt */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-white mb-6">
              Custom Werkstatt
            </h2>
            <FaqAccordion items={FAQ_WERKSTATT} />
          </div>

          {/* Rider */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-white mb-6">Rider</h2>
            <FaqAccordion items={FAQ_RIDER} />
          </div>

        </div>
      </section>

      {/* Contact block */}
      <section className="bg-[#222222] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-4">
            Direkte Anfrage
          </p>
          <p className="text-base text-white/40 leading-relaxed">
            Für alle Anfragen:{' '}
            <a href="mailto:info@motodigital.de" className="text-[#06a5a5] font-semibold hover:text-[#058f8f] transition-colors">
              info@motodigital.de
            </a>
            {' '}— wir antworten innerhalb von 48 Stunden.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
