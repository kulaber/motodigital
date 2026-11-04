// Text, FAQ and links for a workshop profile page, built from the workshop's
// own profile fields. Everything here restates what the workshop entered —
// nothing is inferred, so the generated answers stay true for every profile.

import { z } from 'zod'
import type { Builder } from '@/lib/data/builders'

export const FAQ_LIMITS = { max: 10, question: 200, answer: 1500 } as const

/** Mirrors the profiles_faqs_valid check (migration 20261104_profile_faqs.sql) */
export const profileFaqsSchema = z
  .array(z.object({
    q: z.string().trim().min(1).max(FAQ_LIMITS.question),
    a: z.string().trim().min(1).max(FAQ_LIMITS.answer),
  }))
  .max(FAQ_LIMITS.max)

export type ProfileFaq = { q: string; a: string }

/** Workshop FAQ from the DB — drops anything malformed instead of failing the page */
export function parseProfileFaqs(raw: unknown): ProfileFaq[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((f): f is ProfileFaq => typeof f?.q === 'string' && typeof f?.a === 'string')
    .map(f => ({ q: f.q.trim(), a: f.a.trim() }))
    .filter(f => f.q && f.a)
    .slice(0, FAQ_LIMITS.max)
}

// profiles.specialty token → /bikes/<style> hub
const STYLE_SLUG: Record<string, string> = {
  'Cafe-Racer': 'cafe-racer',
  'Bobber':     'bobber',
  'Scrambler':  'scrambler',
  'Tracker':    'tracker',
  'Flat Track': 'tracker',
  'Chopper':    'chopper',
  'Enduro':     'enduro',
  'Street':     'street',
}

function styleTokens(specialty: string): string[] {
  return specialty.split('·').map(s => s.trim()).filter(Boolean)
}

function styleLabel(token: string): string {
  return token === 'Cafe-Racer' ? 'Cafe Racer' : token
}

/** "a", "a und b", "a, b und c" */
function joinDe(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`
}

/** Long lists read badly in prose: "a, b, … und 9 weitere" */
function joinDeCapped(items: string[], max = 8): string {
  return items.length > max ? `${items.slice(0, max).join(', ')} und ${items.length - max} weitere` : joinDe(items)
}

function dayLabel(day: string): string {
  return day.replace('-', '–')
}

function hoursLabel(hours: string): string {
  return hours === 'Geschlossen' ? 'geschlossen' : hours === 'Nur nach Vereinbarung' ? 'nach Vereinbarung' : hours
}

/** The page falls back to "21107 Hamburg" from the address — prose wants the town only */
function townName(city: string): string {
  return city.replace(/^\d{4,5}\s+/, '')
}

export function profileSummary(b: Builder): string[] {
  const styles = styleTokens(b.specialty).map(styleLabel)
  const facts: string[] = []
  if (styles.length === 1) facts.push(`Der Schwerpunkt liegt auf Umbauten im Stil ${styles[0]}.`)
  if (styles.length > 1) facts.push(`Schwerpunkte sind Umbauten im Stil ${joinDe(styles)}.`)
  if (b.tags.length) facts.push(`Zu den Leistungen ${b.tags.length === 1 ? 'gehört' : 'gehören'} ${joinDeCapped(b.tags)}.`)
  if (b.bases.length) facts.push(`Als Basis setzt ${b.name} vor allem auf ${joinDeCapped(b.bases)}.`)
  if (b.featuredBuilds.length) {
    const n = b.featuredBuilds.length
    const examples = b.featuredBuilds.slice(0, 2).map(f => `„${f.title}“`)
    facts.push(n === 1
      ? `Auf MotoDigital zeigt ${b.name} ein Custom Bike: ${examples[0]}.`
      : `Auf MotoDigital zeigt ${b.name} ${n} Custom Bikes, zum Beispiel ${joinDe(examples)}.`)
  }
  // A lone intro sentence adds nothing the hero doesn't already say
  if (!facts.length) return []

  const town = townName(b.city)
  const intro = `${b.name} ist eine Custom-Motorrad-Werkstatt${town ? ` in ${town}` : ''}.${b.since ? ` Die Werkstatt besteht seit ${b.since}.` : ''}`
  return [`${intro} ${facts.join(' ')}`]
}

export function generatedFaqs(b: Builder): ProfileFaq[] {
  const styles = styleTokens(b.specialty).map(styleLabel)
  const faqs: ProfileFaq[] = []

  if (styles.length) {
    faqs.push({
      q: `Welche Umbauten macht ${b.name}?`,
      a: `${b.name} baut Custom Bikes im Stil ${joinDe(styles)}.${b.tags.length ? ` Zu den Leistungen ${b.tags.length === 1 ? 'gehört' : 'gehören'} ${joinDeCapped(b.tags)}.` : ''}`,
    })
  }
  // Einzelabnahme is the registration of a build; Untersuchung is the regular inspection
  if (b.tags.includes('TÜV-Einzelabnahme')) {
    faqs.push({
      q: `Hilft ${b.name} bei der TÜV-Eintragung?`,
      a: `Laut Profil gehört die TÜV-Einzelabnahme zu den Leistungen von ${b.name}. Welche Teile eingetragen werden müssen, klärst du am besten vor dem Umbau mit der Werkstatt.`,
    })
  } else if (b.tags.includes('TÜV-Untersuchung')) {
    faqs.push({
      q: `Bietet ${b.name} TÜV-Untersuchungen an?`,
      a: `Ja, laut Profil gehört die TÜV-Untersuchung zu den Leistungen von ${b.name}.`,
    })
  }
  if (b.bases.length) {
    faqs.push({
      q: `Mit welchen Motorrädern arbeitet ${b.name}?`,
      a: `Als Basis setzt ${b.name} vor allem auf ${joinDeCapped(b.bases)}. Ob dein Motorrad passt, klärst du am besten direkt mit der Werkstatt.`,
    })
  }
  if (b.address || b.city) {
    faqs.push({
      q: `Wo befindet sich ${b.name}?`,
      a: b.address ? `Die Adresse lautet ${b.address}.` : `Die Werkstatt sitzt in ${townName(b.city)}.`,
    })
  }
  if (b.openingHours?.length) {
    faqs.push({
      q: `Wann hat ${b.name} geöffnet?`,
      a: `Öffnungszeiten laut Profil: ${b.openingHours.map(h => `${dayLabel(h.day)} ${hoursLabel(h.hours)}`).join(', ')}.`,
    })
  }
  if (b.id) {
    faqs.push({
      q: `Wie kann ich ${b.name} kontaktieren?`,
      a: `Über den Kontakt-Button auf dieser Seite schreibst du ${b.name} direkt eine Nachricht über MotoDigital.${b.website ? ' Außerdem hat die Werkstatt eine eigene Website, den Link findest du unter „Links“.' : ''}`,
    })
  }
  return faqs
}

/** Workshop's own questions first; generated ones fill in what they don't already ask */
export function profileFaqs(b: Builder): ProfileFaq[] {
  const own = b.faqs ?? []
  const asked = new Set(own.map(f => f.q.toLowerCase()))
  return [...own, ...generatedFaqs(b).filter(f => !asked.has(f.q.toLowerCase()))]
}

export function profileLinks(b: Builder, cityHub?: { slug: string; name: string }): { href: string; label: string }[] {
  const tokens = styleTokens(b.specialty)
  const links: { href: string; label: string }[] = []

  const styleSlugs = new Set<string>()
  for (const t of tokens) {
    const slug = STYLE_SLUG[t]
    if (!slug || styleSlugs.has(slug)) continue
    styleSlugs.add(slug)
    if (styleSlugs.size <= 3) links.push({ href: `/bikes/${slug}`, label: `${styleLabel(t === 'Flat Track' ? 'Tracker' : t)} Custom Bikes` })
  }
  if (cityHub) links.push({ href: `/custom-werkstatt/${cityHub.slug}`, label: `Custom-Werkstätten in ${cityHub.name}` })

  const guides: { href: string; label: string }[] = []
  if (b.tags.includes('TÜV-Einzelabnahme')) guides.push({ href: '/magazine/tuev-eintragung-custom-bike', label: 'TÜV-Eintragung beim Custom Bike' })
  if (tokens.includes('Cafe-Racer')) guides.push({ href: '/magazine/cafe-racer-umbau', label: 'Cafe Racer Umbau: Anleitung und Kosten' })
  if (tokens.includes('Bobber')) guides.push({ href: '/magazine/bobber-kaufen-guide', label: 'Bobber kaufen: der Ratgeber' })
  if (tokens.includes('Scrambler')) guides.push({ href: '/magazine/scrambler-kaufen-guide', label: 'Scrambler kaufen: der Ratgeber' })
  if (b.bases.some(x => /harley/i.test(x))) guides.push({ href: '/magazine/harley-custom-werkstatt-finden', label: 'Harley Custom-Werkstätten' })
  if (b.bases.some(x => /^bmw/i.test(x))) guides.push({ href: '/magazine/bmw-cafe-racer-umbau-werkstaetten', label: 'BMW Cafe Racer Werkstätten' })
  if (guides.length < 2) guides.push({ href: '/magazine/was-kostet-ein-custom-bike', label: 'Was kostet ein Custom Bike?' })

  return [...links, ...guides.slice(0, 3)]
}
