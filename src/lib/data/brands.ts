export type BrandModel = {
  model: string
  cc: number
  yearFrom: number
  yearTo: number | null
  styles: string[]
}

export type Brand = {
  slug: string
  name: string
  country: string
  tagline: string
  models: BrandModel[]
}

export const BRANDS: Brand[] = [
  {
    slug: 'honda',
    name: 'Honda',
    country: 'Japan',
    tagline: 'Zuverlässige Klassiker — perfekte Basis für Café Racer, Scrambler und Bobber.',
    models: [
      { model: 'CB 750',     cc: 750, yearFrom: 1969, yearTo: 2003, styles: ['Cafe Racer', 'Bobber', 'Scrambler'] },
      { model: 'CB 550',     cc: 544, yearFrom: 1974, yearTo: 1978, styles: ['Cafe Racer', 'Scrambler', 'Tracker'] },
      { model: 'Rebel 500',  cc: 471, yearFrom: 2017, yearTo: null, styles: ['Cafe Racer', 'Bobber', 'Scrambler'] },
      { model: 'XR 600',     cc: 591, yearFrom: 1985, yearTo: 2000, styles: ['Scrambler', 'Enduro', 'Tracker'] },
      { model: 'Shadow 600', cc: 583, yearFrom: 1988, yearTo: 2007, styles: ['Bobber', 'Chopper'] },
    ],
  },
  {
    slug: 'bmw',
    name: 'BMW',
    country: 'Deutschland',
    tagline: 'Ikonischer Boxer-Motor — seit Jahrzehnten die Wahl für Premium Custom Builds.',
    models: [
      { model: 'R nineT', cc: 1170, yearFrom: 2013, yearTo: null, styles: ['Cafe Racer', 'Scrambler', 'Bobber'] },
      { model: 'R 80',    cc: 797,  yearFrom: 1977, yearTo: 1994, styles: ['Cafe Racer', 'Scrambler', 'Tracker'] },
      { model: 'R 100',   cc: 980,  yearFrom: 1976, yearTo: 1995, styles: ['Cafe Racer', 'Scrambler', 'Bobber'] },
    ],
  },
  {
    slug: 'triumph',
    name: 'Triumph',
    country: 'Großbritannien',
    tagline: 'Britisches Erbe trifft modernes Custom-Handwerk — Bonneville und Thruxton als Klassiker.',
    models: [
      { model: 'Bonneville', cc: 865, yearFrom: 1959, yearTo: null, styles: ['Cafe Racer', 'Scrambler', 'Bobber'] },
      { model: 'Thruxton',   cc: 865, yearFrom: 2004, yearTo: null, styles: ['Cafe Racer'] },
    ],
  },
  {
    slug: 'harley-davidson',
    name: 'Harley-Davidson',
    country: 'USA',
    tagline: 'Amerikanische Ikone — unschlagbar als Basis für Bobber und Chopper.',
    models: [
      { model: 'Sportster 883',  cc: 883,  yearFrom: 1957, yearTo: 2021, styles: ['Bobber', 'Chopper', 'Cafe Racer'] },
      { model: 'Sportster 1200', cc: 1200, yearFrom: 1988, yearTo: 2021, styles: ['Bobber', 'Chopper', 'Cafe Racer'] },
    ],
  },
  {
    slug: 'yamaha',
    name: 'Yamaha',
    country: 'Japan',
    tagline: 'Von der XSR bis zur SR500 — Yamaha liefert vielseitige Custom-Plattformen.',
    models: [
      { model: 'XSR 700',       cc: 689, yearFrom: 2016, yearTo: null, styles: ['Cafe Racer', 'Tracker', 'Scrambler'] },
      { model: 'XT 500',        cc: 499, yearFrom: 1976, yearTo: 1989, styles: ['Scrambler', 'Tracker', 'Enduro'] },
      { model: 'XV 750 Virago', cc: 748, yearFrom: 1981, yearTo: 1997, styles: ['Bobber', 'Chopper', 'Cafe Racer'] },
      { model: 'XS 650',        cc: 653, yearFrom: 1970, yearTo: 1985, styles: ['Cafe Racer', 'Bobber', 'Scrambler'] },
    ],
  },
  {
    slug: 'kawasaki',
    name: 'Kawasaki',
    country: 'Japan',
    tagline: 'Robuste Technik zu fairen Preisen — ideal für erste Custom-Projekte.',
    models: [
      { model: 'Z 650', cc: 652, yearFrom: 1977, yearTo: 1983, styles: ['Cafe Racer', 'Tracker'] },
      { model: 'ER-5',  cc: 498, yearFrom: 1997, yearTo: 2006, styles: ['Cafe Racer', 'Scrambler'] },
    ],
  },
  {
    slug: 'suzuki',
    name: 'Suzuki',
    country: 'Japan',
    tagline: 'Günstig, zuverlässig, anpassbar — Suzuki ist der Geheimtipp unter Custom Buildern.',
    models: [
      { model: 'GS 500', cc: 487, yearFrom: 1989, yearTo: 2008, styles: ['Cafe Racer', 'Scrambler', 'Tracker'] },
      { model: 'GS 550', cc: 549, yearFrom: 1977, yearTo: 1986, styles: ['Cafe Racer', 'Scrambler'] },
      { model: 'DR 650', cc: 644, yearFrom: 1990, yearTo: null, styles: ['Scrambler', 'Enduro', 'Tracker'] },
    ],
  },
  {
    slug: 'ducati',
    name: 'Ducati',
    country: 'Italien',
    tagline: 'Italienische Leidenschaft — der Ducati Scrambler als moderne Custom-Plattform.',
    models: [
      { model: 'Scrambler', cc: 803, yearFrom: 2015, yearTo: null, styles: ['Scrambler', 'Cafe Racer', 'Tracker'] },
    ],
  },
  {
    slug: 'moto-guzzi',
    name: 'Moto Guzzi',
    country: 'Italien',
    tagline: 'Längseinbau-V2 aus Mandello del Lario — für Custom Builds mit Charakter.',
    models: [
      { model: 'Bellagio 940',             cc: 940, yearFrom: 2007, yearTo: 2012, styles: ['Cafe Racer', 'Bobber'] },
      { model: 'Bellagio 940 Deluxe',      cc: 940, yearFrom: 2007, yearTo: 2012, styles: ['Cafe Racer', 'Bobber'] },
      { model: 'Bellagio 940 Aquila Nera', cc: 940, yearFrom: 2010, yearTo: 2012, styles: ['Cafe Racer', 'Bobber'] },
    ],
  },
]

export function getBrandBySlug(slug: string): Brand | undefined {
  return BRANDS.find(b => b.slug === slug)
}
