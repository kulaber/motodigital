export type Build = {
  slug: string
  title: string
  tagline: string
  style: string
  base: string
  year: number
  price: string
  city: string
  verified: boolean
  buildYear: number
  buildDuration: string
  description: string
  modifications: string[]
  engine: string
  displacement: string
  builder: {
    name: string
    slug: string
    initials: string
    city: string
    specialty: string
    verified: boolean
  }
  coverImg: string
  images: string[]
  videoUrl?: string
}

export const BUILDS: Build[] = [
  {
    slug: 'the-midnight-scrambler',
    title: 'The Midnight Scrambler',
    tagline: 'Ein Café Racer, der die Nacht verschluckt.',
    style: 'Cafe Racer',
    base: 'Honda CB550',
    year: 1974,
    price: '14.500 €',
    city: 'Berlin',
    verified: true,
    buildYear: 2023,
    buildDuration: '8 Monate',
    description: 'Die Honda CB550 von 1974 war ein Wrack — rostiger Rahmen, tote Elektrik, kein Vergaser mehr original. Was als Winterprojekt begann, wurde zur Obsession. Ziel war ein schlankes, schnelles Bike das trotzdem alltagstauglich bleibt. Kein Café-Racer-Klischee, sondern eine ehrliche Interpretation des Stils.',
    modifications: [
      'Komplette Rahmenaufbereitung + Pulverbeschichtung',
      'Mikuni VM32 Vergaser (4x)',
      'Alu-Stummellenker, handgefertigt',
      'Einsitzer-Seat aus Alcantara',
      'Clip-on Fußrasten, rückversetzt',
      'LED-Scheinwerfer (Bates-Style)',
      'Öhlins-Federelemente hinten',
      'Galfer Bremsscheiben + Stahlflexleitungen',
      'Moto Guzzi-Tank (Umbau)',
      'Komplette Neuverdrahtung (Motogadget m.unit)',
    ],
    engine: 'Honda CB550 SOHC',
    displacement: '544 cc',
    builder: {
      name: 'Jakob Kraft',
      slug: 'jakob-kraft',
      initials: 'JK',
      city: 'Berlin',
      specialty: 'Cafe Racer · Scrambler',
      verified: true,
    },
    coverImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=85',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
      'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1200&q=85',
    ],
  },
  {
    slug: 'iron-bastard-no-3',
    title: 'Iron Bastard No. 3',
    tagline: 'Alte BMW. Neues Leben. Keine Kompromisse.',
    style: 'Bobber',
    base: 'BMW R80',
    year: 1981,
    price: '18.900 €',
    city: 'München',
    verified: true,
    buildYear: 2024,
    buildDuration: '11 Monate',
    description: 'Die R80 ist ein Arbeitstier. Luftgekühlt, unzerstörbar, ehrlich. Der Iron Bastard No. 3 ist der dritte Bobber aus der Werkstatt — jedes Mal eine Spur tiefer, roher, konsequenter. Diesmal: kein Chrom, kein Glanz. Nur Schwarz, Stahl und Funktion.',
    modifications: [
      'Tiefer gelegter Rahmen (handgeschweißt)',
      'Solositzbank aus Naturleder',
      'Flachlenker, Stahl poliert',
      'Vergaser: Bing 64mm rebuild',
      'Komplett neue Auspuffanlage (2-in-1, Edelstahl)',
      'Vorderrad: 21" Speichenrad',
      'Hinterrad: 16" Fat Tire',
      'Motogadget m.unit + m.lock',
      'Peashooter LED-Blinker',
      'Blackout-Lackierung (Satin)',
    ],
    engine: 'BMW Airhead Boxer',
    displacement: '797 cc',
    builder: {
      name: 'Max Steiner',
      slug: 'max-steiner',
      initials: 'MS',
      city: 'München',
      specialty: 'Bobber · Chopper',
      verified: true,
    },
    coverImg: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=85',
    ],
  },
  {
    slug: 'desert-fox-scrambler',
    title: 'Desert Fox Scrambler',
    tagline: 'Gebaut für Asphalt. Bereit für alles andere.',
    style: 'Scrambler',
    base: 'Triumph T100',
    year: 2003,
    price: '11.200 €',
    city: 'Hamburg',
    verified: false,
    buildYear: 2023,
    buildDuration: '5 Monate',
    description: 'Die Triumph T100 hat gute Knochen. Der Umbau zur Desert Fox war ein klarer Auftrag: mehr Bodenfreiheit, Enduro-Feeling, aber Alltagsnutzen behalten. Herausgekommen ist ein vielseitiges Bike das sowohl auf dem Feldweg als auch auf der Landstraße seinen Platz hat.',
    modifications: [
      'High-Pipe Auspuffanlage',
      'Scrambler-Sitzbank, flach',
      'Breitreifen (Metzeler Tourance)',
      '+ 40mm Federweg (Federbeine)',
      'Lenkererhöhung + Crossbar',
      'Verstärkter Hauptständer',
      'Scheinwerfergitter',
      'Verkürztes Heck',
      'Motogadget Instrumente',
    ],
    engine: 'Triumph Parallel Twin',
    displacement: '790 cc',
    builder: {
      name: 'Anna Wolff Moto',
      slug: 'anna-wolff-moto',
      initials: 'AW',
      city: 'Hamburg',
      specialty: 'Scrambler · Enduro',
      verified: false,
    },
    coverImg: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=85',
      'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1200&q=85',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&q=85',
      'https://images.unsplash.com/photo-1609899537878-d7f95a37d5bd?w=1200&q=85',
    ],
  },
  {
    slug: 'flat-track-killer',
    title: 'Flat Track Killer',
    tagline: 'Oval-Feeling auf der Straße.',
    style: 'Tracker',
    base: 'Yamaha SR500',
    year: 1986,
    price: '9.800 €',
    city: 'Köln',
    verified: true,
    buildYear: 2022,
    buildDuration: '4 Monate',
    description: 'Der SR500 Single ist ein Klassiker. Simpel, direkt, laut. Der Umbau zum Tracker war konsequent: raus mit allem Überflüssigen, rein mit allem was Spaß macht. Das Ergebnis klingt wie eine Trommel und fährt wie auf Schienen.',
    modifications: [
      'TT-Lenker (niedrig, breit)',
      'Keihin FCR Vergaser',
      'Pirelli MT60 RS (vorne & hinten)',
      'Nummernschild-Halter vorne (Tracker-Style)',
      'Entfernung Soziusrasten + Griffe',
      'Direktansaugung',
      'Kurzer Auspuff, Megaphone',
      'Flat-Track Sitzbank',
    ],
    engine: 'Yamaha XT/SR Single',
    displacement: '499 cc',
    builder: {
      name: 'René Bauer Cycles',
      slug: 'rene-bauer-cycles',
      initials: 'RB',
      city: 'Köln',
      specialty: 'Tracker · Flat Track',
      verified: false,
    },
    coverImg: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
    ],
  },
  {
    slug: 'low-and-slow',
    title: 'Low & Slow',
    tagline: 'Tief. Breit. Unübersehbar.',
    style: 'Chopper',
    base: 'H-D Sportster',
    year: 1998,
    price: '22.000 €',
    city: 'Stuttgart',
    verified: false,
    buildYear: 2024,
    buildDuration: '14 Monate',
    description: 'Ein Sportster ist kein Chopper — bis jemand wie Kai anfängt zu schneiden. Der Rahmen wurde gestreckt, das Frontend verlängert, alles tiefergelegt. Low & Slow ist keine schnelle Maschine. Es ist ein Statement.',
    modifications: [
      'Gestreckter Hardtail-Rahmen',
      '18° Raketenwinkel Frontend',
      '21" Vorderrad, Drahtspeichen',
      'Springer-Gabel (gefertigt)',
      'Öltank: extern, Custom',
      'Peanut-Tank',
      'Brutale Sissy Bar',
      'Komplett neue Elektrik',
      'Hand-Pinstripe Lackierung',
    ],
    engine: 'Harley-Davidson Evolution',
    displacement: '883 cc',
    builder: {
      name: 'Kai Fuchs Custom',
      slug: 'kai-fuchs-custom',
      initials: 'KF',
      city: 'Stuttgart',
      specialty: 'Chopper · Old School',
      verified: true,
    },
    coverImg: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=1200&q=85',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&q=85',
      'https://images.unsplash.com/photo-1609899537878-d7f95a37d5bd?w=1200&q=85',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=85',
    ],
  },
  {
    slug: 'berlin-ghost',
    title: 'Berlin Ghost',
    tagline: 'Schwarz. Schnell. Spurlos.',
    style: 'Street',
    base: 'Suzuki GS750',
    year: 1979,
    price: '13.400 €',
    city: 'Berlin',
    verified: true,
    buildYear: 2023,
    buildDuration: '6 Monate',
    description: 'Studio Nord nimmt keine Aufträge für Showbikes. Der GS750 sollte ein Alltagsgerät werden — gefahren, nicht ausgestellt. Die Berliner Straßen verlangen Zuverlässigkeit und Charakter. Der Ghost hat beides.',
    modifications: [
      'Kompletter Motor-Rebuild (Ventile, Kolben)',
      'Mikuni BS34 Vergaser (4x)',
      'Stainless Steel Auspuffanlage',
      'Bates Scheinwerfer',
      'Superbike-Lenker',
      'Acewell Tacho',
      'Rücklicht: LED Bar',
      'Neue Bereifung (Dunlop GT601)',
      'Schwarz-Satin Rahmen + Teile',
    ],
    engine: 'Suzuki GS DOHC Inline-4',
    displacement: '748 cc',
    builder: {
      name: 'Studio Nord',
      slug: 'studio-nord',
      initials: 'SN',
      city: 'Hamburg',
      specialty: 'Street · Tracker',
      verified: true,
    },
    coverImg: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
    ],
  },
]

export function getBuildBySlug(slug: string): Build | undefined {
  return BUILDS.find(b => b.slug === slug)
}
