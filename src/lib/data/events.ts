export type Event = {
  id: number
  name: string
  date: string
  location: string
  description: string
  tags: string[]
  url?: string
}

export const EVENTS: Event[] = [
  {
    id: 1,
    name: 'Glemseck 101',
    date: 'September 2026',
    location: 'Leonberg, Deutschland',
    description: 'Das legendäre Sprint-Race-Event auf dem Glemseck. Handgefertigte Custom Bikes treten gegeneinander an — 101 Meter, die zählen. Eines der emotionalsten Custom-Moto-Events in Europa.',
    tags: ['Sprint', 'Custom', 'Classic'],
  },
  {
    id: 2,
    name: 'Wheels & Waves',
    date: 'Juni 2026',
    location: 'Biarritz, Frankreich',
    description: 'Motorräder, Surf und Musik am Atlantik. Wheels & Waves ist mehr als ein Event — es ist ein Lifestyle. Custom Bikes, Kultur und das besondere Flair der baskischen Küste.',
    tags: ['Festival', 'Surf', 'Custom'],
  },
  {
    id: 3,
    name: 'Eindhoven Motor Show',
    date: 'November 2026',
    location: 'Eindhoven, Niederlande',
    description: 'Europas kreativste Custom-Bike-Show. Hunderte handgefertigte Unikate, Builder aus ganz Europa und eine Atmosphäre, die ihresgleichen sucht.',
    tags: ['Show', 'Custom', 'Indoor'],
  },
  {
    id: 4,
    name: 'Cafe Racer Festival',
    date: 'Juni 2026',
    location: 'Paris, Frankreich',
    description: 'Das größte Cafe-Racer-Festival Europas im Hippodrome de Vincennes. Rennen, Ausstellung und die beste Custom-Moto-Community Frankreichs auf einem Gelände.',
    tags: ['Cafe Racer', 'Race', 'Festival'],
  },
  {
    id: 5,
    name: 'Intermot',
    date: 'Oktober 2026',
    location: 'Köln, Deutschland',
    description: 'Die internationale Motorradmesse in Köln — Hersteller, Händler und Custom-Kultur auf der weltweit führenden Zweiradmesse. Unverzichtbar für jeden Motorradfan.',
    tags: ['Messe', 'International', 'Neuheiten'],
  },
  {
    id: 6,
    name: 'AMD World Championship',
    date: 'Oktober 2026',
    location: 'Köln, Deutschland',
    description: 'Die Weltmeisterschaft der Custom Bikes — parallel zur Intermot. Builder aus über 30 Ländern zeigen ihre besten Arbeiten. Wer hier gewinnt, hat den Thron der Custom-Welt.',
    tags: ['Championship', 'Custom', 'World'],
  },
]

export function getEventById(id: number): Event | undefined {
  return EVENTS.find(e => e.id === id)
}
