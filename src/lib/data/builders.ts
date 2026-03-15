export type BuilderMedia = {
  url: string
  type: 'image' | 'video'
  title?: string
}

export type Builder = {
  slug: string
  initials: string
  name: string
  city: string
  specialty: string
  builds: number
  rating: number
  verified: boolean
  featured: boolean
  since: string
  tags: string[]
  bio: string
  bioLong: string
  bases: string[]        // preferred base bikes
  instagram?: string
  website?: string
  media: BuilderMedia[]
  featuredBuilds: {
    title: string
    slug?: string
    base: string
    style: string
    year: number
    img: string
  }[]
}

export const BUILDERS: Builder[] = [
  {
    slug: 'jakob-kraft',
    initials: 'JK',
    name: 'Jakob Kraft',
    city: 'Berlin',
    specialty: 'Cafe Racer · Scrambler',
    builds: 14,
    rating: 4.9,
    verified: true,
    featured: true,
    since: '2019',
    tags: ['Cafe Racer', 'Scrambler', 'Restaurierung'],
    bio: 'Spezialist für luftgekühlte Japaner aus den 70ern. Jeder Build ist eine Zusammenarbeit.',
    bioLong: 'Seit 2019 baut Jakob in seiner Berliner Garage Bikes, die Geschichten erzählen. Seine Leidenschaft gilt luftgekühlten Japanermodellen der 70er — CB500, CB750, SR500. Jeder Build entsteht in enger Zusammenarbeit mit dem Kunden. Keine Blaupausen, keine Massenware. Nur handgefertigte Einzelstücke mit Seele.',
    bases: ['Honda CB550', 'Honda CB750', 'Yamaha SR500'],
    instagram: '@jakob.kraft.builds',
    media: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85', type: 'image', title: 'Garage Shot' },
      { url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85', type: 'image', title: 'Berlin Cafe No. 7' },
      { url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85', type: 'image', title: 'Detail Tank' },
      { url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85', type: 'image', title: 'SR Ghost' },
      { url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=85', type: 'image', title: 'Werkstatt' },
    ],
    featuredBuilds: [
      { title: 'The Midnight Scrambler', slug: 'the-midnight-scrambler', base: 'Honda CB550', style: 'Scrambler', year: 2023, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
      { title: 'Berlin Cafe No. 7', slug: 'berlin-cafe-no-7', base: 'Honda CB750', style: 'Cafe Racer', year: 2022, img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80' },
      { title: 'SR Ghost', slug: 'sr-ghost', base: 'Yamaha SR500', style: 'Tracker', year: 2024, img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80' },
    ],
  },
  {
    slug: 'max-steiner',
    initials: 'MS',
    name: 'Max Steiner',
    city: 'München',
    specialty: 'Bobber · Chopper',
    builds: 22,
    rating: 5.0,
    verified: true,
    featured: true,
    since: '2017',
    tags: ['Bobber', 'Chopper', 'Custom Paint'],
    bio: 'Über 20 fertiggestellte Builds. Fokus auf saubere Linien und handlackierte Tanks.',
    bioLong: 'Max ist einer der erfahrensten Builder auf der Plattform — mit 22 fertiggestellten Projekten seit 2017. Sein Markenzeichen: tiefgezogene Bobber mit penibel handlackierten Tanks und cleanen Linien. Keine überflüssigen Anbauteile, keine Kompromisse. Wer ein Max Steiner Custom fährt, fährt Kunst.',
    bases: ['BMW R80', 'BMW R100', 'H-D Sportster'],
    instagram: '@maxsteiner.custom',
    website: 'maxsteinercustom.de',
    media: [
      { url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85', type: 'image', title: 'Iron Bastard No. 3' },
      { url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1200&q=85', type: 'image', title: 'Black Monk Detail' },
      { url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=85', type: 'image', title: 'Tank Lackierung' },
      { url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85', type: 'image', title: 'Werkstatt München' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85', type: 'image', title: 'Low Rider 1200' },
      { url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85', type: 'image', title: 'Auspuff Custom' },
    ],
    featuredBuilds: [
      { title: 'Iron Bastard No. 3', slug: 'iron-bastard-no-3', base: 'BMW R80', style: 'Bobber', year: 2023, img: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80' },
      { title: 'Black Monk', slug: 'black-monk', base: 'BMW R100', style: 'Chopper', year: 2022, img: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&q=80' },
      { title: 'Low Rider 1200', slug: 'low-rider-1200', base: 'H-D Sportster', style: 'Bobber', year: 2024, img: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80' },
    ],
  },
  {
    slug: 'studio-nord',
    initials: 'SN',
    name: 'Studio Nord',
    city: 'Hamburg',
    specialty: 'Street · Tracker',
    builds: 8,
    rating: 4.7,
    verified: true,
    featured: false,
    since: '2021',
    tags: ['Street', 'Tracker'],
    bio: 'Kleines Studio im Hamburger Hafen. Tracker und Street Fighter sind unsere Welt.',
    bioLong: 'Studio Nord wurde 2021 von zwei Freunden in einem alten Lagerhaus am Hamburger Hafen gegründet. Die Atmosphäre des Hafens spiegelt sich in jedem Build: rau, funktional, durchdacht. Spezialgebiet sind leichte Tracker und agile Street Fighter — Bikes, die in der Stadt genauso gut funktionieren wie auf der Landstraße.',
    bases: ['Kawasaki Z650', 'Suzuki GS750', 'Honda XR650'],
    instagram: '@studionord.hamburg',
    media: [
      { url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85', type: 'image', title: 'Hamburg Tracker' },
      { url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85', type: 'image', title: 'Berlin Ghost' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85', type: 'image', title: 'Hafengarage' },
    ],
    featuredBuilds: [
      { title: 'Hamburg Tracker', slug: 'hamburg-tracker', base: 'Kawasaki Z650', style: 'Tracker', year: 2023, img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80' },
      { title: 'Berlin Ghost', slug: 'berlin-ghost', base: 'Suzuki GS750', style: 'Street', year: 2022, img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80' },
    ],
  },
  {
    slug: 'anna-wolff-moto',
    initials: 'AW',
    name: 'Anna Wolff Moto',
    city: 'Hamburg',
    specialty: 'Scrambler · Enduro',
    builds: 11,
    rating: 4.8,
    verified: false,
    featured: false,
    since: '2020',
    tags: ['Scrambler', 'Enduro', 'Off-Road'],
    bio: 'Abenteuermaschinen für Straße und Gelände. Nachhaltige Restaurierungen bevorzugt.',
    bioLong: 'Anna baut Bikes für alle, die nicht nur eine Straße brauchen. Scrambler und Enduro-Umbauten, die echte Geländetauglichkeit mit Stil verbinden. Besonders am Herzen liegen ihr nachhaltige Restaurierungsprojekte — alte Maschinen ein zweites Leben schenken, statt neue zu kaufen.',
    bases: ['Triumph T100', 'Honda XR600', 'Yamaha XT600'],
    instagram: '@anna.wolff.moto',
    media: [
      { url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=85', type: 'image', title: 'Desert Fox' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85', type: 'image', title: 'Green Enduro' },
      { url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85', type: 'image', title: 'Restaurierung' },
    ],
    featuredBuilds: [
      { title: 'Desert Fox Scrambler', slug: 'desert-fox-scrambler', base: 'Triumph T100', style: 'Scrambler', year: 2023, img: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80' },
      { title: 'Green Enduro', slug: 'green-enduro', base: 'Honda XR600', style: 'Enduro', year: 2022, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
    ],
  },
  {
    slug: 'rene-bauer-cycles',
    initials: 'RB',
    name: 'René Bauer Cycles',
    city: 'Köln',
    specialty: 'Tracker · Flat Track',
    builds: 6,
    rating: 4.6,
    verified: false,
    featured: false,
    since: '2022',
    tags: ['Tracker', 'Flat Track'],
    bio: 'Flat Track ist eine Lebenseinstellung. Leichte, schnelle Builds ohne Schnickschnack.',
    bioLong: 'René kam vom Rennsport zum Custom-Bau. Flat-Track-Bikes sind seine Leidenschaft: leicht, schnell, kompromisslos. Keine unnötigen Extras, kein überflüssiges Gewicht. René baut Maschinen, die man auf der Oval-Strecke genauso fahren kann wie auf dem Sonntagsausflug.',
    bases: ['Yamaha SR500', 'Honda CB350', 'Kawasaki W800'],
    media: [
      { url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85', type: 'image', title: 'Flat Track Killer' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85', type: 'image', title: 'Oval Strecke' },
    ],
    featuredBuilds: [
      { title: 'Flat Track Killer', slug: 'flat-track-killer', base: 'Yamaha SR500', style: 'Tracker', year: 2023, img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80' },
    ],
  },
  {
    slug: 'kai-fuchs-custom',
    initials: 'KF',
    name: 'Kai Fuchs Custom',
    city: 'Stuttgart',
    specialty: 'Chopper · Old School',
    builds: 18,
    rating: 4.9,
    verified: true,
    featured: false,
    since: '2016',
    tags: ['Chopper', 'Old School', 'H-D'],
    bio: 'Old-School-Chopper aus Stuttgart seit 2016. Harley Davidson Experte.',
    bioLong: 'Kai baut seit 2016 Old-School-Chopper in Stuttgart — und kennt jeden Harley-Davidson-Motor in- und auswendig. Seine Bikes sind keine Showstücke. Sie werden gefahren, gelebt, geliebt. Wer einen Chopper will, der nach 30 Jahren noch genauso gut aussieht, kommt zu Kai.',
    bases: ['H-D Sportster', 'H-D FXR', 'H-D Shovelhead'],
    instagram: '@kai.fuchs.custom',
    website: 'kaifuchscustom.de',
    media: [
      { url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1200&q=85', type: 'image', title: 'Low & Slow' },
      { url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85', type: 'image', title: 'Shovel Devil' },
      { url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85', type: 'image', title: 'FXR Street Punk' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85', type: 'image', title: 'Werkstatt Stuttgart' },
    ],
    featuredBuilds: [
      { title: 'Low & Slow', slug: 'low-and-slow', base: 'H-D Sportster', style: 'Chopper', year: 2023, img: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&q=80' },
      { title: 'Shovel Devil', slug: 'shovel-devil', base: 'H-D Shovelhead', style: 'Old School', year: 2022, img: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80' },
      { title: 'FXR Street Punk', slug: 'fxr-street-punk', base: 'H-D FXR', style: 'Chopper', year: 2024, img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80' },
    ],
  },
]

export function getBuilderBySlug(slug: string): Builder | undefined {
  return BUILDERS.find(b => b.slug === slug)
}
