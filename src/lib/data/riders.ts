export type RiderBike = {
  id: string
  title: string
  make: string
  model: string
  year: number
  coverUrl?: string
}

export type Rider = {
  id?: string
  slug: string
  lastSeenAt?: string
  initials: string
  name: string
  city: string
  country: string
  lat?: number
  lng?: number
  bike: string
  style: string
  styles: string[]
  avatar?: string
  bio: string
  verified: boolean
  since: string
  instagram?: string
  bikes?: RiderBike[]
}

export const RIDERS: Rider[] = [
  {
    slug: 'lukas-bauer',
    initials: 'LB',
    name: 'Lukas Bauer',
    city: 'Berlin',
    country: 'Deutschland',
    lat: 52.52,
    lng: 13.405,
    bike: 'Honda CB750 Cafe Racer',
    style: 'Cafe Racer',
    styles: ['Cafe Racer', 'Street'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    bio: 'Berliner durch und durch. Ich baue und fahre seit 2015 Cafe Racer, meist auf alten Honda- und Triumph-Bases. Bin bei jedem Wetter auf dem Rad.',
    verified: true,
    since: '2015',
    instagram: 'lukasbauer.moto',
  },
  {
    slug: 'nico-schreiber',
    initials: 'NS',
    name: 'Nico Schreiber',
    city: 'Hamburg',
    country: 'Deutschland',
    lat: 53.5753,
    lng: 10.0153,
    bike: 'Triumph Bonneville Bobber',
    style: 'Bobber',
    styles: ['Bobber', 'Chopper'],
    avatar: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=400&h=600&fit=crop',
    bio: 'Hamburger Hafen, Regen und Bobber – das ist mein Alltag. Seit fast zehn Jahren auf zwei Rädern, immer mit einem Lächeln unter dem Helm.',
    verified: true,
    since: '2014',
    instagram: 'nico.schreiber.rides',
  },
  {
    slug: 'felix-hoffmann',
    initials: 'FH',
    name: 'Felix Hoffmann',
    city: 'München',
    country: 'Deutschland',
    lat: 48.1351,
    lng: 11.582,
    bike: 'Royal Enfield Himalayan Scrambler',
    style: 'Scrambler',
    styles: ['Scrambler', 'Enduro'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
    bio: 'Die Alpen vor der Haustür sind mein Spielplatz. Scrambler und Enduro sind für mich keine Styles – es ist ein Lebensgefühl.',
    verified: false,
    since: '2018',
    instagram: 'felix.scrambles',
  },
  {
    slug: 'sascha-klein',
    initials: 'SK',
    name: 'Sascha Klein',
    city: 'Köln',
    country: 'Deutschland',
    lat: 50.9333,
    lng: 6.95,
    bike: 'Yamaha XSR700 Tracker',
    style: 'Tracker',
    styles: ['Tracker', 'Street'],
    avatar: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=600&fit=crop',
    bio: 'Flat-Track-Enthusiast aus Köln. Meine XSR700 ist mein tägliches Stadtmotorrad – schnell, leicht und immer startklar.',
    verified: true,
    since: '2019',
  },
  {
    slug: 'markus-weber',
    initials: 'MW',
    name: 'Markus Weber',
    city: 'Frankfurt',
    country: 'Deutschland',
    lat: 50.1109,
    lng: 8.6821,
    bike: 'Harley-Davidson Sportster Chopper',
    style: 'Chopper',
    styles: ['Chopper', 'Bobber'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face',
    bio: 'Chopper-Fahrer aus Frankfurt. Für mich zählt Stil mehr als Geschwindigkeit. Meine Harley ist ein rollendes Kunstwerk.',
    verified: false,
    since: '2012',
    instagram: 'weber.chopper',
  },
  {
    slug: 'julian-braun',
    initials: 'JB',
    name: 'Julian Braun',
    city: 'Stuttgart',
    country: 'Deutschland',
    lat: 48.7758,
    lng: 9.1829,
    bike: 'Kawasaki Z900 Street Fighter',
    style: 'Street',
    styles: ['Street', 'Cafe Racer'],
    avatar: 'https://images.unsplash.com/photo-1558980394-da1f85d3b540?w=400&h=600&fit=crop',
    bio: 'Street-Riding ist meine Leidenschaft. Durch Stuttgart, auf den Schwäbischen Alb und zurück – am liebsten mit einer kleinen Gruppe Gleichgesinnter.',
    verified: true,
    since: '2017',
    instagram: 'julian.streetrider',
  },
  {
    slug: 'thomas-mueller',
    initials: 'TM',
    name: 'Thomas Müller',
    city: 'Wien',
    country: 'Österreich',
    lat: 48.2082,
    lng: 16.3738,
    bike: 'KTM 690 Enduro R',
    style: 'Enduro',
    styles: ['Enduro', 'Scrambler'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face',
    bio: 'Wien bis Niederösterreich und weiter in die Berge. Mit der KTM bin ich auf jedem Untergrund zu Hause – Asphalt oder Schotter, egal.',
    verified: true,
    since: '2016',
    instagram: 'thomas.enduro.at',
  },
  {
    slug: 'andreas-fischer',
    initials: 'AF',
    name: 'Andreas Fischer',
    city: 'Zürich',
    country: 'Schweiz',
    lat: 47.3769,
    lng: 8.5417,
    bike: 'BMW R nineT Cafe Racer',
    style: 'Cafe Racer',
    styles: ['Cafe Racer', 'Bobber'],
    avatar: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=400&h=600&fit=crop',
    bio: 'Zürich als Basis, Europa als Spielfeld. Meine BMW R nineT wurde von einem lokalen Builder zum Cafe Racer umgebaut – und jetzt liebe ich sie noch mehr.',
    verified: true,
    since: '2020',
    instagram: 'andreas.fischer.moto',
  },
]
