import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Support — MotoDigital',
  description:
    'Kontaktiere das MotoDigital-Team — wir helfen dir bei Fragen rund um Werkstätten, Custom Bikes und dein Rider-Profil.',
  alternates: { canonical: 'https://motodigital.io/support' },
}

export default function SupportPage() {
  return (
    <>
      <Header />

      <main className="bg-[#222222] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-24">

          {/* Hero */}
          <p className="text-xs font-bold uppercase tracking-widest text-[#2AABAB] mb-5">
            Support
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            Wie können wir dir helfen?
          </h1>
          <p className="text-sm text-white/40 leading-relaxed mb-16 max-w-lg">
            Du hast eine Frage, Feedback oder brauchst Hilfe? Schreib uns
            — wir melden uns innerhalb von 24 Stunden. Oder schau in
            unseren{' '}
            <a href="/faq" className="text-[#2AABAB] hover:underline">
              FAQ
            </a>{' '}
            vorbei.
          </p>

          {/* Contact Form */}
          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              Kontakt
            </h2>
            <p className="text-sm text-white/40 mb-8">
              Füll einfach das Formular aus — wir kümmern uns um den Rest.
            </p>
            <ContactForm />
          </section>

        </div>
      </main>

      <Footer />
    </>
  )
}
