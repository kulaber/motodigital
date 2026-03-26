export type Event = {
  id: number
  slug: string
  name: string
  date: string
  location: string
  description: string
  tags: string[]
  url?: string
  image?: string
}

export const EVENTS: Event[] = [
  {
    id: 1,
    slug: 'glemseck-101',
    name: 'Glemseck 101',
    date: 'September 2026',
    location: 'Leonberg, Deutschland',
    description: 'Das legendäre Sprint-Race-Event auf dem Glemseck. Handgefertigte Custom Bikes treten gegeneinander an — 101 Meter, die zählen. Eines der emotionalsten Custom-Moto-Events in Europa.',
    tags: ['Sprint', 'Custom', 'Classic'],
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=85',
  },
  {
    id: 2,
    slug: 'wheels-and-waves',
    name: 'Wheels & Waves',
    date: 'Juni 2026',
    location: 'Biarritz, Frankreich',
    description: 'Motorräder, Surf und Musik am Atlantik. Wheels & Waves ist mehr als ein Event — es ist ein Lifestyle. Custom Bikes, Kultur und das besondere Flair der baskischen Küste.',
    tags: ['Festival', 'Surf', 'Custom'],
    image: 'https://images.unsplash.com/photo-1598099297822-396cbd179125?w=1200&q=85',
  },
  {
    id: 3,
    slug: 'eindhoven-motor-show',
    name: 'Eindhoven Motor Show',
    date: 'November 2026',
    location: 'Eindhoven, Niederlande',
    description: 'Europas kreativste Custom-Bike-Show. Hunderte handgefertigte Unikate, Builder aus ganz Europa und eine Atmosphäre, die ihresgleichen sucht.',
    tags: ['Show', 'Custom', 'Indoor'],
    image: 'https://images.unsplash.com/photo-1536419598693-94435e7f9757?w=1200&q=85',
  },
  {
    id: 4,
    slug: 'cafe-racer-festival',
    name: 'Cafe Racer Festival',
    date: 'Juni 2026',
    location: 'Paris, Frankreich',
    description: 'Das größte Cafe-Racer-Festival Europas im Hippodrome de Vincennes. Rennen, Ausstellung und die beste Custom-Moto-Community Frankreichs auf einem Gelände.',
    tags: ['Cafe Racer', 'Race', 'Festival'],
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
  },
  {
    id: 5,
    slug: 'intermot',
    name: 'Intermot',
    date: 'Oktober 2026',
    location: 'Köln, Deutschland',
    description: 'Die internationale Motorradmesse in Köln — Hersteller, Händler und Custom-Kultur auf der weltweit führenden Zweiradmesse. Unverzichtbar für jeden Motorradfan.',
    tags: ['Messe', 'International', 'Neuheiten'],
    image: 'https://images.unsplash.com/photo-1535050264505-ba17be3ee504?w=1200&q=85',
  },
  {
    id: 6,
    slug: 'amd-world-championship',
    name: 'AMD World Championship',
    date: 'Oktober 2026',
    location: 'Köln, Deutschland',
    description: 'Die Weltmeisterschaft der Custom Bikes — parallel zur Intermot. Builder aus über 30 Ländern zeigen ihre besten Arbeiten. Wer hier gewinnt, hat den Thron der Custom-Welt.',
    tags: ['Championship', 'Custom', 'World'],
    image: 'https://images.unsplash.com/photo-1603096564885-1a332df4f903?w=1200&q=85',
  },
]

export function getEventBySlug(slug: string): Event | undefined {
  return EVENTS.find(e => e.slug === slug)
}
