import type { Metadata } from 'next'
import Link from 'next/link'
import { Globe, Shield, Zap } from 'lucide-react'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Custom Bike inserieren — MotoDigital',
  description: 'Verkaufe dein Custom Bike auf MotoDigital — weltweit sichtbar, verifizierte Käufer, einfaches Inserieren.',
}

const BENEFITS = [
  {
    icon: Globe,
    title: 'Weltweite Reichweite',
    description: 'Dein Build wird von Custom-Enthusiasten aus ganz Europa und darüber hinaus gesehen. Keine lokalen Grenzen — echte internationale Sichtbarkeit.',
  },
  {
    icon: Shield,
    title: 'Verifizierte Käufer',
    description: 'Unsere Community besteht aus echten Motorrad-Enthusiasten. Keine Spam-Anfragen, keine Zeitverschwendung — nur ernsthafte Interessenten.',
  },
  {
    icon: Zap,
    title: 'Schnell & einfach',
    description: 'Inserat in wenigen Minuten erstellen. Fotos hochladen, Specs eingeben, fertig. Wir kümmern uns um den Rest.',
  },
]

export default function SellPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header activePage="sell" />

      {/* Hero */}
      <section className="pt-28 pb-20 bg-[#141414]">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <p className="text-xs font-semibold text-[#C8A96E] uppercase tracking-widest mb-4">Inserieren</p>
          <h1 className="font-bold text-[#F0EDE4] leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', letterSpacing: '-0.03em' }}>
            Dein Custom Bike.<br />
            <span className="text-[#C8A96E]">Weltweit sichtbar.</span>
          </h1>
          <p className="text-[#F0EDE4]/45 text-base max-w-xl mx-auto leading-relaxed mb-10">
            Zeig der Welt, was du gebaut hast. MotoDigital bringt dein Unikat zu den richtigen Käufern — schnell, einfach, ohne Kompromisse.
          </p>
          <Link
            href="/bikes/new"
            className="inline-flex items-center gap-2 bg-[#C8A96E] text-[#141414] text-base font-bold px-8 py-4 rounded-full hover:bg-[#D4B87A] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#C8A96E]/20"
          >
            Jetzt inserieren
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-t border-[#F0EDE4]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <h2 className="text-center text-xl font-bold text-[#F0EDE4] mb-3">Warum MotoDigital?</h2>
          <p className="text-center text-sm text-[#F0EDE4]/35 mb-12 max-w-md mx-auto">
            Die Plattform, die Custom-Bike-Builder und Käufer zusammenbringt.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BENEFITS.map(benefit => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-8">
                  <div className="w-12 h-12 rounded-xl bg-[#C8A96E]/12 border border-[#C8A96E]/20 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#C8A96E]" />
                  </div>
                  <h3 className="text-base font-bold text-[#F0EDE4] mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#F0EDE4]/40 leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 border-t border-[#F0EDE4]/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#F0EDE4] mb-4">Bereit, dein Bike zu verkaufen?</h2>
          <p className="text-sm text-[#F0EDE4]/40 mb-8 leading-relaxed">
            Erstelle dein Inserat in wenigen Minuten. Keine versteckten Gebühren, keine Überraschungen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/bikes/new"
              className="inline-flex items-center justify-center gap-2 bg-[#C8A96E] text-[#141414] text-sm font-bold px-8 py-3.5 rounded-full hover:bg-[#D4B87A] transition-all hover:-translate-y-0.5"
            >
              Jetzt inserieren
            </Link>
            <Link
              href="/bikes"
              className="inline-flex items-center justify-center gap-2 border border-[#F0EDE4]/12 text-[#F0EDE4]/60 text-sm font-medium px-8 py-3.5 rounded-full hover:border-[#F0EDE4]/25 hover:text-[#F0EDE4] transition-all"
            >
              Alle Bikes ansehen
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-5 sm:gap-6">
            {['Impressum', 'Datenschutz', 'Kontakt'].map(l => (
              <Link key={l} href="#" className="text-xs text-[#F0EDE4]/25 hover:text-[#F0EDE4]/60 transition-colors">{l}</Link>
            ))}
          </nav>
          <p className="text-xs text-[#F0EDE4]/15">© 2026 MotoDigital</p>
        </div>
      </footer>
    </div>
  )
}
