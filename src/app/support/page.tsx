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

      {/* Hero */}
      <section className="bg-[#222222] overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(6,165,165,0.07) 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-5">
            Support
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-3xl">
            Wie können wir dir helfen?
          </h1>
          <p className="text-base text-white/40 max-w-lg leading-relaxed">
            Du hast eine Frage, Feedback oder brauchst Hilfe? Schreib uns
            — wir antworten innerhalb von 48 Stunden. Oder schau in
            unseren{' '}
            <a href="/faq" className="text-[#06a5a5] hover:underline">
              FAQ
            </a>{' '}
            vorbei.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8">
          <h2 className="text-lg font-bold text-white mb-2">
            Kontakt
          </h2>
          <p className="text-sm text-white/40 mb-8">
            Füll einfach das Formular aus — wir kümmern uns um den Rest.
          </p>
          <ContactForm />
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
