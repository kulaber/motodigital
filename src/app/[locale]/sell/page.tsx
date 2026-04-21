import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Globe, Shield, Zap } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Custom Bike verkaufen — MotoDigital',
  description: 'Verkaufe dein Custom Bike auf MotoDigital — weltweit sichtbar, verifizierte Käufer, einfach hochladen.',
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
    description: 'Build in wenigen Minuten hochladen. Fotos hinzufügen, Specs eingeben, fertig. Wir kümmern uns um den Rest.',
  },
]

export default function SellPage() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="sell" />

      {/* Hero */}
      <section className="pt-28 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <h1 className="font-bold text-[#222222] leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', letterSpacing: '-0.03em' }}>
            Dein Custom Bike.<br />
            Weltweit sichtbar.
          </h1>
          <p className="text-[#222222]/45 text-base max-w-[55ch] mx-auto leading-relaxed mb-10">
            Zeig der Welt, was du gebaut hast — MotoDigital bringt dein Unikat zu den richtigen Käufern.
          </p>
          <Link
            href="/bikes/new"
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-base font-bold px-8 py-4 rounded-full hover:bg-[#064f4f] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#06a5a5]/20"
          >
            Bike hinzufügen
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-t border-[#222222]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <h2 className="text-center text-xl font-bold text-[#222222] mb-3">Warum MotoDigital?</h2>
          <p className="text-center text-sm text-[#222222]/35 mb-12 max-w-md mx-auto">
            Die Plattform, die Custom-Bike-Builder und Käufer zusammenbringt.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BENEFITS.map(benefit => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="bg-white border border-[#222222]/6 rounded-2xl p-8">
                  <div className="w-12 h-12 rounded-xl bg-[#222222]/12 border border-[#DDDDDD]/20 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#717171]" />
                  </div>
                  <h3 className="text-base font-bold text-[#222222] mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#222222]/40 leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 border-t border-[#222222]/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#222222] mb-4">Bereit, dein Bike zu verkaufen?</h2>
          <p className="text-sm text-[#222222]/40 mb-8 leading-relaxed">
            Lade deinen Build in wenigen Minuten hoch. Keine versteckten Gebühren, keine Überraschungen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/bikes/new"
              className="inline-flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-bold px-8 py-3.5 rounded-full hover:bg-[#064f4f] transition-all hover:-translate-y-0.5"
            >
              Bike hinzufügen
            </Link>
            <Link
              href="/bikes"
              className="inline-flex items-center justify-center gap-2 border border-[#222222]/12 text-[#222222]/60 text-sm font-medium px-8 py-3.5 rounded-full hover:border-[#222222]/25 hover:text-[#222222] transition-all"
            >
              Alle Bikes ansehen
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
