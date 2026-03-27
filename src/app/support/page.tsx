import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FaqAccordion, { type FaqItem } from './FaqAccordion'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Support & FAQ — MotoDigital',
  description:
    'Häufige Fragen zu MotoDigital — Werkstatt registrieren, Custom Bike verkaufen, Rider-Profil erstellen. Kontaktiere uns bei weiteren Fragen.',
  alternates: { canonical: 'https://motodigital.io/support' },
}

const FAQ: FaqItem[] = [
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
    question: 'Kann ich als Rider ein Profil erstellen?',
    answer:
      'Ja! Als Rider kannst du dein eigenes Profil mit deinem Custom Bike erstellen, andere Rider entdecken und Teil der Community werden.',
  },
  {
    question: 'Wie kann ich ein Custom Bike verkaufen?',
    answer:
      'Der Custom Bike Marktplatz wird demnächst verfügbar sein. Du kannst dann dein Bike mit Fotos, Beschreibung und Preis einstellen. Käufer kontaktieren dich direkt über die Plattform.',
  },
  {
    question: 'Welche Motorrad-Stile gibt es auf MotoDigital?',
    answer:
      'Auf MotoDigital findest du alle gängigen Custom-Stile: Cafe Racer, Bobber, Scrambler, Tracker, Chopper, Street und Enduro. Du kannst nach Stil filtern, um genau das zu finden, was du suchst.',
  },
  {
    question: 'Wie funktioniert die Kontaktaufnahme mit Werkstätten?',
    answer:
      'Auf jeder Werkstatt-Profilseite findest du einen Kontakt-Button. Darüber kannst du direkt eine Nachricht an die Werkstatt senden — ohne Umwege oder Gebühren.',
  },
  {
    question: 'In welchen Ländern ist MotoDigital verfügbar?',
    answer:
      'Aktuell fokussieren wir uns auf den DACH-Raum (Deutschland, Österreich, Schweiz). Die Expansion in weitere europäische Märkte ist geplant.',
  },
  {
    question: 'Wie kann ich MotoDigital kontaktieren?',
    answer:
      'Du kannst uns jederzeit über das Kontaktformular auf dieser Seite erreichen oder eine E-Mail an info@motodigital.de senden. Wir antworten in der Regel innerhalb von 24 Stunden.',
  },
]

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

export default function SupportPage() {
  return (
    <>
      <FaqJsonLd items={FAQ} />
      <Header />

      <main className="bg-[#222222] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-24">

          {/* Hero */}
          <p className="text-xs font-bold uppercase tracking-widest text-[#2AABAB] mb-5">
            Support &amp; FAQ
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            Wie können wir dir helfen?
          </h1>
          <p className="text-sm text-white/40 leading-relaxed mb-16 max-w-lg">
            Hier findest du Antworten auf die häufigsten Fragen. Falls du
            nicht fündig wirst, schreib uns einfach über das Kontaktformular.
          </p>

          {/* FAQ */}
          <section className="mb-20">
            <h2 className="text-lg font-bold text-white mb-6">
              Häufige Fragen
            </h2>
            <FaqAccordion items={FAQ} />
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              Kontakt
            </h2>
            <p className="text-sm text-white/40 mb-8">
              Du hast eine Frage, Feedback oder brauchst Hilfe? Schreib uns
              — wir melden uns innerhalb von 24 Stunden.
            </p>
            <ContactForm />
          </section>

        </div>
      </main>

      <Footer />
    </>
  )
}
