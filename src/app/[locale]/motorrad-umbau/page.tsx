import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Motorrad Umbau — Alles was du wissen musst | MotoDigital',
  description:
    'Motorrad Umbau in Deutschland: Stile, Kosten, Basis-Bikes, TÜV-Eintragung und die besten Custom-Werkstätten. Der vollständige Guide von MotoDigital.',
  alternates: { canonical: 'https://motodigital.io/motorrad-umbau' },
  openGraph: {
    title: 'Motorrad Umbau — Alles was du wissen musst | MotoDigital',
    description:
      'Motorrad Umbau in Deutschland: Stile, Kosten, Basis-Bikes, TÜV-Eintragung und die besten Custom-Werkstätten.',
    url: 'https://motodigital.io/motorrad-umbau',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motorrad Umbau — Alles was du wissen musst | MotoDigital',
    description: 'Stile, Kosten, TÜV und die besten Custom-Werkstätten in Deutschland.',
  },
}

const BASE_URL = 'https://motodigital.io'

const STYLES = [
  { slug: 'cafe-racer',    label: 'Café Racer',    desc: 'Stummellenker, Höcker, Rennoptik' },
  { slug: 'bobber',        label: 'Bobber',        desc: 'Solo-Sattel, gebobbte Schutzbleche' },
  { slug: 'scrambler',     label: 'Scrambler',     desc: 'Hochgelegter Auspuff, Stollenreifen' },
  { slug: 'tracker',       label: 'Tracker',       desc: 'Flat-Track-DNA, breiter Lenker' },
  { slug: 'chopper',       label: 'Chopper',       desc: 'Lange Gabel, gestreckte Silhouette' },
  { slug: 'brat-style',    label: 'Brat Style',    desc: 'Japanisch-minimalistisch, kompakt' },
  { slug: 'street-fighter',label: 'Street Fighter',desc: 'Aggresiv, nackt, für die Stadt' },
]

const COST_STEPS = [
  { label: 'Einfacher Teilumbau', range: '1.500 – 4.000 €', desc: 'Lenker, Sitzbank, Auspuff, Beleuchtung' },
  { label: 'Mittlerer Umbau', range: '4.000 – 12.000 €', desc: 'Rahmenmodifikation, Lackierung, TÜV-Eintragung' },
  { label: 'Komplettumbau', range: '12.000 – 30.000 €', desc: 'Komplette Neukonstruktion, Show-Build-Niveau' },
  { label: 'High-End / Show', range: '30.000 €+', desc: 'Internationale Awards, renommierte Werkstätten' },
]

const FAQS = [
  {
    q: 'Was kostet ein Motorrad Umbau in Deutschland?',
    a: 'Die Kosten für einen Motorrad Umbau variieren stark. Einfache Umbauten (Lenker, Sitzbank, Auspuff) starten bei ca. 1.500–3.500 €. Mittlere Umbauten mit Lackierung und TÜV-Eintragung liegen zwischen 5.000 und 12.000 €. Komplette Custom-Builds von renommierten Werkstätten kosten 15.000–35.000 €, Showbikes deutlich mehr.',
  },
  {
    q: 'Welche Motorräder eignen sich am besten für einen Umbau?',
    a: 'Die beliebtesten Basis-Bikes für Umbauten in Deutschland sind Honda CB750/CB550, Yamaha XS650/XS750, BMW R-Serie (Boxer und K-Modelle), Triumph Bonneville und Kawasaki Z-Serie. Für moderne Umbauten empfehlen sich BMW R nineT, Triumph Thruxton, Ducati Scrambler und Royal Enfield-Modelle.',
  },
  {
    q: 'Muss ein Motorrad Umbau zum TÜV?',
    a: 'Ja — in Deutschland sind fast alle sicherheitsrelevanten Umbauten eintragungspflichtig. Das gilt für geänderte Lenker, Auspuffanlagen, Beleuchtung, Bremsanlagen, Federung und Rahmenveränderungen. Die Eintragung erfolgt per Einzelbetriebserlaubnis nach §21 StVZO beim TÜV oder Dekra. Viele Custom-Werkstätten begleiten diesen Prozess vollständig.',
  },
  {
    q: 'Wie lange dauert ein Motorrad Umbau bei einer Werkstatt?',
    a: 'Einfache Umbauten dauern 2–6 Wochen. Mittlere Projekte mit Lackierung und TÜV-Vorbereitung 2–4 Monate. Komplette Custom-Builds von Grund auf können 6–18 Monate in Anspruch nehmen — je nach Komplexität, Wartezeit auf Teile und Auslastung der Werkstatt.',
  },
  {
    q: 'Kann ich ein Custom Bike nach dem Umbau noch normal versichern?',
    a: 'Ja, aber es gibt Besonderheiten. Custom Bikes werden oft als Oldtimer (H-Kennzeichen, ab 30 Jahren) oder mit einer Einzelbetriebserlaubnis zugelassen. Für die Versicherung empfehlen sich auf Motorräder spezialisierte Anbieter wie Hepster, Greenval oder Detlev Louis. Der Wiederherstellungswert muss ggf. gesondert vereinbart werden.',
  },
  {
    q: 'Selbst bauen oder Werkstatt beauftragen?',
    a: 'Wer handwerkliches Geschick mitbringt, kann viele Teile selbst montieren — Lenker, Sitzbank, Beleuchtung. TÜV-relevante Arbeiten (Schweißen am Rahmen, Bremsanlage, Elektrik) sollten immer von einer Fachkraft durchgeführt werden. Der TÜV prüft die gesamte Anlage — auch selbst montierte Teile müssen einwandfrei sein.',
  },
]

export default function MotorradUmbauPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MotoDigital', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Motorrad Umbau', item: `${BASE_URL}/motorrad-umbau` },
    ],
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 pt-12 sm:pt-20 pb-10">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#717171] mb-3">
          MotoDigital · Custom-Bikes
        </p>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#222222] tracking-tight leading-[1.05] mb-5">
          Motorrad Umbau
        </h1>
        <p className="text-base sm:text-xl text-[#717171] leading-relaxed max-w-3xl">
          Alles was du wissen musst: Stile, Kosten, Basis-Bikes, TÜV-Eintragung und die besten Custom-Werkstätten in Deutschland, Österreich und der Schweiz.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            href="/custom-werkstatt"
            className="inline-flex items-center bg-[#2AABAB] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#239393] transition-colors"
          >
            Werkstatt finden
          </Link>
          <Link
            href="/bikes"
            className="inline-flex items-center border border-[#EBEBEB] text-[#222222] text-sm font-semibold px-6 py-3 rounded-full hover:border-[#222] transition-colors"
          >
            Custom Bikes ansehen
          </Link>
        </div>
      </section>

      {/* Umbau-Stile */}
      <section className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-12 border-t border-[#EBEBEB]">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight mb-2">
          Die wichtigsten Umbau-Stile
        </h2>
        <p className="text-[#717171] text-sm mb-8 max-w-2xl">
          Jeder Custom-Stil hat seine eigene DNA — von der Entstehungsgeschichte bis zu den typischen Umbauten. Klick auf einen Stil, um alle Bikes und Werkstätten zu sehen.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {STYLES.map(s => (
            <Link
              key={s.slug}
              href={`/bikes/${s.slug}` as any}
              className="group flex flex-col gap-1 border border-[#EBEBEB] rounded-2xl p-4 hover:border-[#2AABAB] hover:shadow-sm transition-all"
            >
              <span className="font-semibold text-sm text-[#222222] group-hover:text-[#2AABAB] transition-colors">{s.label}</span>
              <span className="text-xs text-[#717171] leading-snug">{s.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Kosten */}
      <section className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-12 border-t border-[#EBEBEB]">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight mb-2">
          Was kostet ein Motorrad Umbau?
        </h2>
        <p className="text-[#717171] text-sm mb-8 max-w-2xl">
          Die Kosten hängen von Komplexität, Materialwahl, Werkstattstandort und Arbeitsumfang ab. Diese Richtwerte gelten für Deutschland 2026.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COST_STEPS.map((c, i) => (
            <div key={i} className="border border-[#EBEBEB] rounded-2xl p-5">
              <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-1">{c.label}</p>
              <p className="text-xl font-bold text-[#222222] mb-2">{c.range}</p>
              <p className="text-sm text-[#555] leading-snug">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TÜV-Hinweis */}
      <section className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-12 border-t border-[#EBEBEB]">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight mb-4">
          TÜV-Eintragung beim Motorrad Umbau
        </h2>
        <div className="prose prose-sm sm:prose-base max-w-3xl text-[#444]">
          <p>
            In Deutschland sind fast alle sicherheitsrelevanten Umbauten eintragungspflichtig — Lenker, Auspuff, Beleuchtung, Bremsen und Rahmenveränderungen. Die Eintragung erfolgt per <strong>Einzelbetriebserlaubnis nach §21 StVZO</strong> beim TÜV oder Dekra.
          </p>
          <p>
            Wer ein Custom Bike kauft, sollte vor dem Kauf immer das <strong>Abnahmeprotokoll und die Fahrzeugpapiere</strong> prüfen. Seriöse Werkstätten liefern alle Unterlagen mit und begleiten den TÜV-Termin auf Wunsch.
          </p>
        </div>
        <Link
          href="/magazine/tuev-eintragung-custom-bike"
          className="inline-flex items-center mt-5 text-sm font-semibold text-[#2AABAB] hover:underline"
        >
          Vollständiger TÜV-Guide lesen →
        </Link>
      </section>

      {/* CTA Werkstatt */}
      <section className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-12 border-t border-[#EBEBEB]">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight mb-2">
          Werkstatt für deinen Umbau finden
        </h2>
        <p className="text-[#717171] text-sm mb-6 max-w-2xl">
          MotoDigital listet verifizierte Custom-Werkstätten in Deutschland, Österreich und der Schweiz — mit Portfolio, Spezialgebieten und Direktkontakt.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/custom-werkstatt" className="inline-flex items-center bg-[#2AABAB] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#239393] transition-colors">
            Alle Werkstätten ansehen
          </Link>
          <Link href={'/custom-werkstatt/muenchen' as any} className="inline-flex items-center border border-[#EBEBEB] text-[#222222] text-sm font-semibold px-5 py-3 rounded-full hover:border-[#222] transition-colors">
            München
          </Link>
          <Link href={'/custom-werkstatt/berlin' as any} className="inline-flex items-center border border-[#EBEBEB] text-[#222222] text-sm font-semibold px-5 py-3 rounded-full hover:border-[#222] transition-colors">
            Berlin
          </Link>
          <Link href={'/custom-werkstatt/hamburg' as any} className="inline-flex items-center border border-[#EBEBEB] text-[#222222] text-sm font-semibold px-5 py-3 rounded-full hover:border-[#222] transition-colors">
            Hamburg
          </Link>
        </div>
      </section>

      {/* Magazine Links */}
      <section className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-12 border-t border-[#EBEBEB]">
        <h2 className="text-2xl font-bold text-[#222222] tracking-tight mb-6">Weiterführende Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/magazine/cafe-racer-kaufen-guide',     label: 'Café Racer kaufen — Der vollständige Leitfaden' },
            { href: '/magazine/bobber-kaufen-guide',          label: 'Bobber kaufen — Kaufratgeber für echte Low-Rider' },
            { href: '/magazine/scrambler-kaufen-guide',       label: 'Scrambler kaufen — Der vollständige Kaufratgeber' },
            { href: '/magazine/tuev-eintragung-custom-bike',  label: 'TÜV-Eintragung: Was in Deutschland wirklich legal ist' },
            { href: '/magazine/was-kostet-ein-custom-bike',   label: 'Was kostet ein Custom Bike? Preise & Kosten' },
            { href: '/magazine/cafe-racer-selber-bauen-basis-bikes', label: 'Café Racer selber bauen: Die 10 besten Basis-Bikes' },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href as any}
              className="flex items-center gap-3 border border-[#EBEBEB] rounded-xl px-4 py-3 hover:border-[#2AABAB] hover:shadow-sm transition-all text-sm font-medium text-[#222222]"
            >
              <span className="text-[#2AABAB] text-base leading-none flex-shrink-0">→</span>
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 pb-20 pt-4 border-t border-[#EBEBEB]">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight mb-6">
          Häufige Fragen zum Motorrad Umbau
        </h2>
        <div className="flex flex-col gap-4 max-w-3xl">
          {FAQS.map((f, i) => (
            <details key={i} className="group border border-[#EBEBEB] rounded-2xl overflow-hidden bg-white">
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 text-sm font-semibold text-[#222222]">
                <span>{f.q}</span>
                <span className="text-[#717171] group-open:rotate-45 transition-transform text-lg leading-none flex-shrink-0">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[#555] leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
