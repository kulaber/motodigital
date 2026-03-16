import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'MotoDigital Magazin — Stories, Builds, Culture',
  description: 'Stories aus der Custom-Motorcycle-Welt: Builder-Interviews, Build Stories und Guides für die Community.',
}

const ARTICLES = [
  {
    id: 1,
    category: 'Build Story',
    title: 'Von der Scheune auf die Straße: Wie Jakob Kraft eine CB750 wiedergeboren hat',
    description: 'Acht Monate, ein rostiger Rahmen und eine Vision: die Geschichte hinter dem Berlin Cafe No. 7.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    readTime: '8 min',
  },
  {
    id: 2,
    category: 'Interview',
    title: '"Ein Bike ohne Geschichte ist nur ein Fahrzeug" — Max Steiner im Gespräch',
    description: 'Der Münchner Builder über Bobber-Philosophie, handlackierte Tanks und warum er nie Kompromisse eingeht.',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
    readTime: '12 min',
  },
  {
    id: 3,
    category: 'Guide',
    title: 'Cafe Racer kaufen: Worauf du wirklich achten musst',
    description: 'Von der Rahmenprüfung bis zur Zulassung — unser vollständiger Leitfaden für Custom-Bike-Käufer.',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
    readTime: '15 min',
  },
  {
    id: 4,
    category: 'Build Story',
    title: 'Shovelhead Revival: Kai Fuchs und der Shovel Devil',
    description: 'Ein 1976er Shovelhead, 16 Monate Arbeit und eine klare Haltung. Old School ist keine Nostalgie.',
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
    readTime: '10 min',
  },
  {
    id: 5,
    category: 'Guide',
    title: 'Scrambler vs. Tracker: Welcher Stil passt zu dir?',
    description: 'Beide Stile sind vielseitig — aber der Unterschied liegt im Detail. Wir erklären, was dich erwartet.',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
    readTime: '7 min',
  },
  {
    id: 6,
    category: 'Interview',
    title: 'Studio Nord: Warum Tracker das ehrlichste Custom-Format sind',
    description: 'Das Hamburger Duo über Hafenluft, schlanke Builds und die Kunst des Weglassens.',
    image: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&q=80',
    readTime: '9 min',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Build Story': 'bg-[#C8A96E]/15 text-[#C8A96E] border-[#C8A96E]/20',
  'Interview':   'bg-[#2AABAB]/12 text-[#2AABAB] border-[#2AABAB]/20',
  'Guide':       'bg-[#F0EDE4]/8 text-[#F0EDE4]/60 border-[#F0EDE4]/12',
}

export default function MagazinePage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header activePage="magazine" />

      {/* Hero */}
      <section className="pt-28 pb-14 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <p className="text-xs font-semibold text-[#C8A96E] uppercase tracking-widest mb-3">Magazin</p>
          <h1 className="font-bold text-[#F0EDE4] leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em' }}>
            MotoDigital Magazin
          </h1>
          <p className="text-[#F0EDE4]/40 text-base max-w-lg leading-relaxed">
            Stories, Builds, Culture — Einblicke in die Custom-Motorcycle-Welt aus erster Hand.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ARTICLES.map(article => (
              <article
                key={article.id}
                className="group bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
              >
                {/* Cover */}
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[article.category] ?? ''}`}>
                      {article.category}
                    </span>
                    <span className="text-[10px] text-[#F0EDE4]/25">{article.readTime} Lesezeit</span>
                  </div>
                  <h2 className="text-sm font-semibold text-[#F0EDE4] leading-snug mb-2 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-xs text-[#F0EDE4]/40 leading-relaxed line-clamp-2 mb-4">
                    {article.description}
                  </p>
                  <Link
                    href="#"
                    className="text-xs font-semibold text-[#C8A96E] hover:text-[#D4B87A] transition-colors"
                  >
                    Lesen →
                  </Link>
                </div>
              </article>
            ))}
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
