export type BuilderMedia = {
  url: string
  type: 'image' | 'video'
  title?: string
}

export type TeamMember = {
  name: string
  role: string
  initials: string
  email?: string
  phone?: string
  avatar?: string
}

export type OpeningHours = {
  day: string
  hours: string
}

export type Builder = {
  id?: string        // Supabase profile UUID (nur für DB-Builder vorhanden)
  slug: string
  initials: string
  name: string
  city: string
  address?: string
  lat?: number
  lng?: number
  specialty: string
  builds: number
  rating: number
  verified: boolean
  featured: boolean
  since: string
  tags: string[]
  bio: string
  bioLong: string
  bases: string[]
  instagram?: string
  website?: string
  avatarUrl?: string
  media: BuilderMedia[]
  galleryImages?: BuilderMedia[]
  team?: TeamMember[]
  openingHours?: OpeningHours[]
  paymentMethods?: string[]
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
    tags: ['Komplettumbau', 'Teileumbau', 'Elektrik', 'Lackierung', 'Folierung', 'Pulverbeschichtung', 'Schweißen', 'Fräsen', 'Sandstrahlen', 'Verzinken', 'Vergaser', 'TÜV-Einzelabnahme', 'TÜV-Untersuchung', 'Motorinstandsetzung', 'Motorrevision', 'Motordiagnose', 'Sattlerarbeiten'],
    bio: 'Spezialist für luftgekühlte Japaner aus den 70ern. Jeder Build ist eine Zusammenarbeit.',
    bioLong: 'Seit 2019 baut Jakob in seiner Berliner Garage Bikes, die Geschichten erzählen. Seine Leidenschaft gilt luftgekühlten Japanermodellen der 70er — CB500, CB750, SR500. Jeder Build entsteht in enger Zusammenarbeit mit dem Kunden. Keine Blaupausen, keine Massenware. Nur handgefertigte Einzelstücke mit Seele.',
    bases: ['Honda CB550', 'Honda CB750', 'Yamaha SR500'],
    instagram: '@jakob.kraft.builds',
    address: 'Greifswalder Str. 212, 10405 Berlin',
    lat: 52.5338,
    lng: 13.4268,
    team: [
      { name: 'Jakob Kraft', role: 'Gründer & Head Builder', initials: 'JK', email: 'jakob@jakobkraft.de', phone: '+49 30 12345678', avatar: 'https://i.pravatar.cc/100?img=12' },
      { name: 'Leon Müller', role: 'Mechaniker', initials: 'LM', email: 'leon@jakobkraft.de', avatar: 'https://i.pravatar.cc/100?img=8' },
    ],
    openingHours: [
      { day: 'Mo – Fr', hours: '10:00 – 18:00' },
      { day: 'Samstag', hours: '11:00 – 15:00' },
      { day: 'Sonntag', hours: 'Geschlossen' },
    ],
    paymentMethods: ['Überweisung', 'Bar', 'PayPal'],
    media: [
      { url: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1200&q=85', type: 'image', title: 'Werkstatt Berlin' },
      { url: 'https://images.unsplash.com/photo-1636761358954-cebc0e5dfebb?w=1200&q=85', type: 'image', title: 'Detail Arbeit' },
      { url: 'https://images.unsplash.com/photo-1657976726773-19c48273e8c1?w=1200&q=85', type: 'image', title: 'Cafe Racer Build' },
      { url: 'https://images.unsplash.com/photo-1568708167256-1f385e6485f5?w=1200&q=85', type: 'image', title: 'Berlin Cafe No. 7' },
      { url: 'https://images.unsplash.com/photo-1558139392-60db7e62e7ed?w=1200&q=85', type: 'image', title: 'SR Ghost' },
    ],
    featuredBuilds: [
      { title: 'The Midnight Scrambler', slug: 'the-midnight-scrambler', base: 'Honda CB550', style: 'Scrambler', year: 2023, img: 'https://images.unsplash.com/photo-1568708167256-1f385e6485f5?w=800&q=80' },
      { title: 'Berlin Cafe No. 7', slug: 'berlin-cafe-no-7', base: 'Honda CB750', style: 'Cafe Racer', year: 2022, img: 'https://images.unsplash.com/photo-1657976726773-19c48273e8c1?w=800&q=80' },
      { title: 'SR Ghost', slug: 'sr-ghost', base: 'Yamaha SR500', style: 'Tracker', year: 2024, img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80' },
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
    tags: ['Komplettumbau', 'Lackierung', 'Pulverbeschichtung', 'Schweißen', 'Sattlerarbeiten', 'Motorrevision'],
    bio: 'Über 20 fertiggestellte Builds. Fokus auf saubere Linien und handlackierte Tanks.',
    bioLong: 'Max ist einer der erfahrensten Builder auf der Plattform — mit 22 fertiggestellten Projekten seit 2017. Sein Markenzeichen: tiefgezogene Bobber mit penibel handlackierten Tanks und cleanen Linien. Keine überflüssigen Anbauteile, keine Kompromisse. Wer ein Max Steiner Custom fährt, fährt Kunst.',
    bases: ['BMW R80', 'BMW R100', 'H-D Sportster'],
    instagram: '@maxsteiner.custom',
    website: 'maxsteinercustom.de',
    address: 'Thalkirchner Str. 88, 80337 München',
    lat: 48.1256,
    lng: 11.5653,
    team: [
      { name: 'Max Steiner', role: 'Gründer & Master Builder', initials: 'MS', email: 'max@maxsteinercustom.de', phone: '+49 89 98765432', avatar: 'https://i.pravatar.cc/100?img=53' },
      { name: 'Tobias Renn', role: 'Lackierung & Finish', initials: 'TR', email: 'tobias@maxsteinercustom.de', avatar: 'https://i.pravatar.cc/100?img=7' },
      { name: 'Sara Hofer', role: 'Design & Konzept', initials: 'SH', email: 'sara@maxsteinercustom.de', phone: '+49 89 98765433', avatar: 'https://i.pravatar.cc/100?img=47' },
    ],
    openingHours: [
      { day: 'Mo – Do', hours: '09:00 – 17:00' },
      { day: 'Freitag', hours: '09:00 – 14:00' },
      { day: 'Sa & So', hours: 'Nur nach Vereinbarung' },
    ],
    paymentMethods: ['Überweisung', 'Bar', 'Kreditkarte', 'Ratenzahlung möglich'],
    media: [
      { url: 'https://images.unsplash.com/photo-1536419598693-94435e7f9757?w=1200&q=85', type: 'image', title: 'Werkstatt München' },
      { url: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1200&q=85', type: 'image', title: 'Motorrad Restaurierung' },
      { url: 'https://images.unsplash.com/photo-1505052533681-2be9d65eade5?w=1200&q=85', type: 'image', title: 'Iron Bastard No. 3' },
      { url: 'https://images.unsplash.com/photo-1535050264505-ba17be3ee504?w=1200&q=85', type: 'image', title: 'Low Rider 1200' },
      { url: 'https://images.unsplash.com/photo-1576183154519-0b780c80f869?w=1200&q=85', type: 'image', title: 'Black Monk Detail' },
      { url: 'https://images.unsplash.com/photo-1567972411080-a8ad4b2fded1?w=1200&q=85', type: 'image', title: 'Chopper Build' },
    ],
    featuredBuilds: [
      { title: 'Iron Bastard No. 3', slug: 'iron-bastard-no-3', base: 'BMW R80', style: 'Bobber', year: 2023, img: 'https://images.unsplash.com/photo-1505052533681-2be9d65eade5?w=800&q=80' },
      { title: 'Black Monk', slug: 'black-monk', base: 'BMW R100', style: 'Chopper', year: 2022, img: 'https://images.unsplash.com/photo-1576183154519-0b780c80f869?w=800&q=80' },
      { title: 'Low Rider 1200', slug: 'low-rider-1200', base: 'H-D Sportster', style: 'Bobber', year: 2024, img: 'https://images.unsplash.com/photo-1531593728368-c44975d66f2e?w=800&q=80' },
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
    tags: ['Teileumbau', 'Elektrik', 'Motordiagnose', 'Motorinstandsetzung', 'TÜV-Untersuchung'],
    bio: 'Kleines Studio im Hamburger Hafen. Tracker und Street Fighter sind unsere Welt.',
    bioLong: 'Studio Nord wurde 2021 von zwei Freunden in einem alten Lagerhaus am Hamburger Hafen gegründet. Die Atmosphäre des Hafens spiegelt sich in jedem Build: rau, funktional, durchdacht. Spezialgebiet sind leichte Tracker und agile Street Fighter — Bikes, die in der Stadt genauso gut funktionieren wie auf der Landstraße.',
    bases: ['Kawasaki Z650', 'Suzuki GS750', 'Honda XR650'],
    instagram: '@studionord.hamburg',
    address: 'Große Elbstraße 45, 22767 Hamburg',
    lat: 53.5450,
    lng: 9.9418,
    team: [
      { name: 'Finn Brandt', role: 'Co-Gründer & Builder', initials: 'FB', email: 'finn@studionord.de', phone: '+49 40 11223344', avatar: 'https://i.pravatar.cc/100?img=3' },
      { name: 'Nils Kruse', role: 'Co-Gründer & Mechaniker', initials: 'NK', email: 'nils@studionord.de', avatar: 'https://i.pravatar.cc/100?img=15' },
    ],
    openingHours: [
      { day: 'Di – Fr', hours: '11:00 – 18:00' },
      { day: 'Samstag', hours: '12:00 – 17:00' },
      { day: 'Mo & So', hours: 'Geschlossen' },
    ],
    paymentMethods: ['Überweisung', 'Bar'],
    media: [
      { url: 'https://images.unsplash.com/photo-1636761358954-cebc0e5dfebb?w=1200&q=85', type: 'image', title: 'Hafengarage' },
      { url: 'https://images.unsplash.com/photo-1650569664566-f0014dcf54e3?w=1200&q=85', type: 'image', title: 'Motor Arbeit' },
      { url: 'https://images.unsplash.com/photo-1598099297822-396cbd179125?w=1200&q=85', type: 'image', title: 'Hamburg Tracker' },
    ],
    featuredBuilds: [
      { title: 'Hamburg Tracker', slug: 'hamburg-tracker', base: 'Kawasaki Z650', style: 'Tracker', year: 2023, img: 'https://images.unsplash.com/photo-1598099297822-396cbd179125?w=800&q=80' },
      { title: 'Berlin Ghost', slug: 'berlin-ghost', base: 'Suzuki GS750', style: 'Street', year: 2022, img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80' },
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
    tags: ['Komplettumbau', 'Teileumbau', 'Folierung', 'Sandstrahlen', 'TÜV-Einzelabnahme', 'Motorrevision', 'Sattlerarbeiten'],
    bio: 'Abenteuermaschinen für Straße und Gelände. Nachhaltige Restaurierungen bevorzugt.',
    bioLong: 'Anna baut Bikes für alle, die nicht nur eine Straße brauchen. Scrambler und Enduro-Umbauten, die echte Geländetauglichkeit mit Stil verbinden. Besonders am Herzen liegen ihr nachhaltige Restaurierungsprojekte — alte Maschinen ein zweites Leben schenken, statt neue zu kaufen.',
    bases: ['Triumph T100', 'Honda XR600', 'Yamaha XT600'],
    instagram: '@anna.wolff.moto',
    address: 'Bahrenfelder Str. 193, 22765 Hamburg',
    lat: 53.5620,
    lng: 9.9195,
    team: [
      { name: 'Anna Wolff', role: 'Gründerin & Builder', initials: 'AW', email: 'anna@annawolff.de', phone: '+49 40 55667788', avatar: 'https://i.pravatar.cc/100?img=49' },
    ],
    openingHours: [
      { day: 'Mo – Fr', hours: '10:00 – 17:00' },
      { day: 'Wochenende', hours: 'Nur nach Vereinbarung' },
    ],
    paymentMethods: ['Überweisung', 'Bar', 'PayPal'],
    media: [
      { url: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?w=1200&q=85', type: 'image', title: 'Werkstatt' },
      { url: 'https://images.unsplash.com/photo-1677435783431-4f81723d5a18?w=1200&q=85', type: 'image', title: 'Desert Fox Scrambler' },
      { url: 'https://images.unsplash.com/photo-1646749699696-bb3e4e7fcdd0?w=1200&q=85', type: 'image', title: 'Green Enduro' },
    ],
    featuredBuilds: [
      { title: 'Desert Fox Scrambler', slug: 'desert-fox-scrambler', base: 'Triumph T100', style: 'Scrambler', year: 2023, img: 'https://images.unsplash.com/photo-1677435783431-4f81723d5a18?w=800&q=80' },
      { title: 'Green Enduro', slug: 'green-enduro', base: 'Honda XR600', style: 'Enduro', year: 2022, img: 'https://images.unsplash.com/photo-1571659517221-76aa53b022d1?w=800&q=80' },
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
    tags: ['Teileumbau', 'Elektrik', 'Vergaser', 'Fräsen', 'Motordiagnose', 'TÜV-Einzelabnahme'],
    bio: 'Flat Track ist eine Lebenseinstellung. Leichte, schnelle Builds ohne Schnickschnack.',
    bioLong: 'René kam vom Rennsport zum Custom-Bau. Flat-Track-Bikes sind seine Leidenschaft: leicht, schnell, kompromisslos. Keine unnötigen Extras, kein überflüssiges Gewicht. René baut Maschinen, die man auf der Oval-Strecke genauso fahren kann wie auf dem Sonntagsausflug.',
    bases: ['Yamaha SR500', 'Honda CB350', 'Kawasaki W800'],
    address: 'Vogelsanger Str. 310, 50827 Köln',
    lat: 50.9530,
    lng: 6.9090,
    team: [
      { name: 'René Bauer', role: 'Gründer & Builder', initials: 'RB', email: 'rene@renebauer.de', phone: '+49 221 33445566', avatar: 'https://i.pravatar.cc/100?img=22' },
    ],
    openingHours: [
      { day: 'Mo – Fr', hours: '09:00 – 18:00' },
      { day: 'Sa', hours: '10:00 – 14:00' },
      { day: 'Sonntag', hours: 'Geschlossen' },
    ],
    paymentMethods: ['Überweisung', 'Bar'],
    media: [
      { url: 'https://images.unsplash.com/photo-1636761358954-cebc0e5dfebb?w=1200&q=85', type: 'image', title: 'Werkstatt Köln' },
      { url: 'https://images.unsplash.com/photo-1603096564885-1a332df4f903?w=1200&q=85', type: 'image', title: 'Flat Track Killer' },
    ],
    featuredBuilds: [
      { title: 'Flat Track Killer', slug: 'flat-track-killer', base: 'Yamaha SR500', style: 'Tracker', year: 2023, img: 'https://images.unsplash.com/photo-1603096564885-1a332df4f903?w=800&q=80' },
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
    tags: ['Komplettumbau', 'Schweißen', 'Lackierung', 'Verzinken', 'Motorinstandsetzung', 'Motorrevision', 'Pulverbeschichtung'],
    bio: 'Old-School-Chopper aus Stuttgart seit 2016. Harley Davidson Experte.',
    bioLong: 'Kai baut seit 2016 Old-School-Chopper in Stuttgart — und kennt jeden Harley-Davidson-Motor in- und auswendig. Seine Bikes sind keine Showstücke. Sie werden gefahren, gelebt, geliebt. Wer einen Chopper will, der nach 30 Jahren noch genauso gut aussieht, kommt zu Kai.',
    bases: ['H-D Sportster', 'H-D FXR', 'H-D Shovelhead'],
    instagram: '@kai.fuchs.custom',
    website: 'kaifuchscustom.de',
    address: 'Böheimstr. 31, 70199 Stuttgart',
    lat: 48.7619,
    lng: 9.1709,
    team: [
      { name: 'Kai Fuchs', role: 'Gründer & Builder', initials: 'KF', email: 'kai@kaifuchscustom.de', phone: '+49 711 99887766', avatar: 'https://i.pravatar.cc/100?img=6' },
      { name: 'Markus Seidel', role: 'Mechaniker & Restaurierung', initials: 'MK', email: 'markus@kaifuchscustom.de', avatar: 'https://i.pravatar.cc/100?img=33' },
    ],
    openingHours: [
      { day: 'Mo – Fr', hours: '08:00 – 17:00' },
      { day: 'Samstag', hours: '09:00 – 13:00' },
      { day: 'Sonntag', hours: 'Geschlossen' },
    ],
    paymentMethods: ['Überweisung', 'Bar', 'Kreditkarte'],
    media: [
      { url: 'https://images.unsplash.com/photo-1536419598693-94435e7f9757?w=1200&q=85', type: 'image', title: 'Werkstatt Stuttgart' },
      { url: 'https://images.unsplash.com/photo-1650569664566-f0014dcf54e3?w=1200&q=85', type: 'image', title: 'Motor Arbeit' },
      { url: 'https://images.unsplash.com/photo-1558981420-bf351ce8e3ca?w=1200&q=85', type: 'image', title: 'Shovel Devil' },
      { url: 'https://images.unsplash.com/photo-1571488522587-59e6a9ee67a5?w=1200&q=85', type: 'image', title: 'FXR Street Punk' },
    ],
    featuredBuilds: [
      { title: 'Low & Slow', slug: 'low-and-slow', base: 'H-D Sportster', style: 'Chopper', year: 2023, img: 'https://images.unsplash.com/photo-1567972411080-a8ad4b2fded1?w=800&q=80' },
      { title: 'Shovel Devil', slug: 'shovel-devil', base: 'H-D Shovelhead', style: 'Old School', year: 2022, img: 'https://images.unsplash.com/photo-1558981420-bf351ce8e3ca?w=800&q=80' },
      { title: 'FXR Street Punk', slug: 'fxr-street-punk', base: 'H-D FXR', style: 'Chopper', year: 2024, img: 'https://images.unsplash.com/photo-1571488522587-59e6a9ee67a5?w=800&q=80' },
    ],
  },
  {
    slug: 'motorrad-ibbenburen',
    initials: 'MI',
    name: 'Motorrad Ibbenbüren',
    city: 'Ibbenbüren',
    address: 'Glücksburger Str. 29a, 49477 Ibbenbüren',
    lat: 52.2778,
    lng: 7.7243,
    specialty: 'Custom Bike Building · Bobber',
    builds: 0,
    rating: 5.0,
    verified: false,
    featured: false,
    since: '',
    tags: [
      'Komplettumbau',
      'Schweißen',
      'Lackierung',
      'Motorinstandsetzung',
      'Motorrevision',
      'Motordiagnose',
      'TÜV-Einzelabnahme',
      'TÜV-Untersuchung',
      'Restaurierung',
    ],
    bio: 'Freie Werkstatt für alle Marken – Spezialist für Custom Bike Building',
    bioLong: 'Als IHK-Ausbildungs- und Meisterbetrieb vereinen wir professionelle Motorradreparatur mit echter Custom-Leidenschaft. Kein Bike verlässt unseren Hof, das nicht unseren eigenen Ansprüchen genügt. Besonders die Diagnose komplizierter Fehler und individuelle Motorradumbauten sind unsere Spezialität.',
    bases: ['BMW', 'Harley-Davidson', 'Alle Marken'],
    website: 'https://xn--motorrad-ibbenbren-06b.de',
    openingHours: [
      { day: 'Montag', hours: '08:00 – 16:00' },
      { day: 'Di – Fr', hours: '08:00 – 17:30' },
      { day: 'Samstag', hours: '09:00 – 12:00' },
      { day: 'Sonntag', hours: 'Geschlossen' },
    ],
    paymentMethods: ['Überweisung', 'Bar', 'EC-Karte'],
    media: [],
    featuredBuilds: [],
  },
]

export function getBuilderBySlug(slug: string): Builder | undefined {
  return BUILDERS.find(b => b.slug === slug)
}
