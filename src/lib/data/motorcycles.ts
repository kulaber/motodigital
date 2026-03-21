export type EngineType =
  | 'Einzylinder'
  | 'Zweizylinder parallel'
  | 'Zweizylinder V'
  | 'Zweizylinder Boxer'
  | 'Dreizylinder'
  | 'Vierzylinder Reihe'
  | 'Vierzylinder V'
  | 'Sechszylinder'

export type BikeCategory =
  | 'Naked'
  | 'Roadster'
  | 'Cafe Racer'
  | 'Scrambler'
  | 'Bobber'
  | 'Chopper'
  | 'Tracker'
  | 'Cruiser'
  | 'Sport'
  | 'Enduro'
  | 'Adventure'
  | 'Touring'
  | 'Retro'

export type Make = {
  id: string
  name: string
  country: string
}

export type ModelVariant = {
  displacement: number // cc
  name?: string        // z.B. "500" oder "CB500 Four"
  power?: string       // z.B. "48 PS"
  torque?: string      // z.B. "44 Nm"
  engine: EngineType
}

export type MotorcycleModel = {
  id: string
  makeId: string
  name: string
  yearFrom: number
  yearTo?: number       // undefined = noch in Produktion
  variants: ModelVariant[]
  categories: BikeCategory[]
}

// ─────────────────────────────────────────────
// MAKES
// ─────────────────────────────────────────────

export const MAKES: Make[] = [
  { id: 'honda',          name: 'Honda',           country: 'JP' },
  { id: 'yamaha',         name: 'Yamaha',          country: 'JP' },
  { id: 'kawasaki',       name: 'Kawasaki',        country: 'JP' },
  { id: 'suzuki',         name: 'Suzuki',          country: 'JP' },
  { id: 'bmw',            name: 'BMW Motorrad',    country: 'DE' },
  { id: 'triumph',        name: 'Triumph',         country: 'GB' },
  { id: 'harley',         name: 'Harley-Davidson', country: 'US' },
  { id: 'ducati',         name: 'Ducati',          country: 'IT' },
  { id: 'ktm',            name: 'KTM',             country: 'AT' },
  { id: 'royal-enfield',  name: 'Royal Enfield',   country: 'IN' },
  { id: 'moto-guzzi',     name: 'Moto Guzzi',      country: 'IT' },
  { id: 'norton',         name: 'Norton',          country: 'GB' },
  { id: 'indian',         name: 'Indian Motorcycle', country: 'US' },
  { id: 'husqvarna',      name: 'Husqvarna',       country: 'SE' },
  { id: 'benelli',        name: 'Benelli',         country: 'IT' },
  { id: 'aprilia',        name: 'Aprilia',         country: 'IT' },
  { id: 'mv-agusta',      name: 'MV Agusta',       country: 'IT' },
  { id: 'bsa',            name: 'BSA',             country: 'GB' },
  { id: 'vincent',        name: 'Vincent',         country: 'GB' },
  { id: 'andere',         name: 'Andere / Eigenbau', country: '' },
]

// ─────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────

export const MODELS: MotorcycleModel[] = [

  // ── HONDA ────────────────────────────────
  {
    id: 'honda-cb350',
    makeId: 'honda',
    name: 'CB350',
    yearFrom: 1968, yearTo: 1973,
    categories: ['Cafe Racer', 'Tracker', 'Bobber'],
    variants: [{ displacement: 325, engine: 'Zweizylinder parallel', power: '32 PS', torque: '28 Nm' }],
  },
  {
    id: 'honda-cb360',
    makeId: 'honda',
    name: 'CB360',
    yearFrom: 1974, yearTo: 1977,
    categories: ['Cafe Racer', 'Tracker'],
    variants: [{ displacement: 356, engine: 'Zweizylinder parallel', power: '34 PS', torque: '29 Nm' }],
  },
  {
    id: 'honda-cb400',
    makeId: 'honda',
    name: 'CB400 Four',
    yearFrom: 1975, yearTo: 1977,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 408, engine: 'Vierzylinder Reihe', power: '37 PS', torque: '32 Nm' }],
  },
  {
    id: 'honda-cb450',
    makeId: 'honda',
    name: 'CB450',
    yearFrom: 1965, yearTo: 1974,
    categories: ['Cafe Racer', 'Tracker'],
    variants: [{ displacement: 444, engine: 'Zweizylinder parallel', power: '43 PS', torque: '38 Nm' }],
  },
  {
    id: 'honda-cb500',
    makeId: 'honda',
    name: 'CB500 Four',
    yearFrom: 1971, yearTo: 1977,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 498, engine: 'Vierzylinder Reihe', power: '48 PS', torque: '42 Nm' }],
  },
  {
    id: 'honda-cb550',
    makeId: 'honda',
    name: 'CB550',
    yearFrom: 1974, yearTo: 1978,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 544, engine: 'Vierzylinder Reihe', power: '50 PS', torque: '44 Nm' }],
  },
  {
    id: 'honda-cb650',
    makeId: 'honda',
    name: 'CB650',
    yearFrom: 1979, yearTo: 1982,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 627, engine: 'Vierzylinder Reihe', power: '63 PS', torque: '52 Nm' }],
  },
  {
    id: 'honda-cb750',
    makeId: 'honda',
    name: 'CB750',
    yearFrom: 1969, yearTo: 2003,
    categories: ['Cafe Racer', 'Naked', 'Bobber'],
    variants: [
      { displacement: 736, name: 'CB750 (K/F)', engine: 'Vierzylinder Reihe', power: '67 PS', torque: '59 Nm' },
      { displacement: 747, name: 'CB750 Nighthawk', engine: 'Vierzylinder Reihe', power: '70 PS', torque: '63 Nm' },
    ],
  },
  {
    id: 'honda-cb900',
    makeId: 'honda',
    name: 'CB900F',
    yearFrom: 1979, yearTo: 1984,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 901, engine: 'Vierzylinder Reihe', power: '95 PS', torque: '82 Nm' }],
  },
  {
    id: 'honda-cb1100',
    makeId: 'honda',
    name: 'CB1100',
    yearFrom: 2010,
    categories: ['Retro', 'Naked', 'Cafe Racer'],
    variants: [{ displacement: 1140, engine: 'Vierzylinder Reihe', power: '89 PS', torque: '91 Nm' }],
  },
  {
    id: 'honda-cl350',
    makeId: 'honda',
    name: 'CL350 Scrambler',
    yearFrom: 1968, yearTo: 1973,
    categories: ['Scrambler', 'Tracker'],
    variants: [{ displacement: 325, engine: 'Zweizylinder parallel', power: '32 PS', torque: '27 Nm' }],
  },
  {
    id: 'honda-cl450',
    makeId: 'honda',
    name: 'CL450 Scrambler',
    yearFrom: 1967, yearTo: 1974,
    categories: ['Scrambler'],
    variants: [{ displacement: 444, engine: 'Zweizylinder parallel', power: '40 PS', torque: '35 Nm' }],
  },
  {
    id: 'honda-cx500',
    makeId: 'honda',
    name: 'CX500',
    yearFrom: 1977, yearTo: 1983,
    categories: ['Cafe Racer', 'Bobber'],
    variants: [{ displacement: 496, engine: 'Zweizylinder V', power: '50 PS', torque: '44 Nm' }],
  },
  {
    id: 'honda-cmx500',
    makeId: 'honda',
    name: 'CMX500 Rebel',
    yearFrom: 2017,
    categories: ['Bobber', 'Cruiser'],
    variants: [{ displacement: 471, engine: 'Zweizylinder parallel', power: '46 PS', torque: '43 Nm' }],
  },
  {
    id: 'honda-cmx1100',
    makeId: 'honda',
    name: 'CMX1100 Rebel',
    yearFrom: 2021,
    categories: ['Bobber', 'Cruiser'],
    variants: [{ displacement: 1084, engine: 'Zweizylinder parallel', power: '87 PS', torque: '98 Nm' }],
  },

  // ── YAMAHA ───────────────────────────────
  {
    id: 'yamaha-xs650',
    makeId: 'yamaha',
    name: 'XS650',
    yearFrom: 1969, yearTo: 1985,
    categories: ['Cafe Racer', 'Bobber', 'Tracker', 'Chopper'],
    variants: [{ displacement: 653, engine: 'Zweizylinder parallel', power: '53 PS', torque: '53 Nm' }],
  },
  {
    id: 'yamaha-xs400',
    makeId: 'yamaha',
    name: 'XS400',
    yearFrom: 1977, yearTo: 1982,
    categories: ['Cafe Racer', 'Tracker'],
    variants: [{ displacement: 391, engine: 'Zweizylinder parallel', power: '37 PS', torque: '33 Nm' }],
  },
  {
    id: 'yamaha-sr500',
    makeId: 'yamaha',
    name: 'SR500',
    yearFrom: 1978, yearTo: 1999,
    categories: ['Cafe Racer', 'Tracker', 'Bobber'],
    variants: [{ displacement: 499, engine: 'Einzylinder', power: '32 PS', torque: '39 Nm' }],
  },
  {
    id: 'yamaha-sr400',
    makeId: 'yamaha',
    name: 'SR400',
    yearFrom: 1978, yearTo: 2021,
    categories: ['Cafe Racer', 'Bobber', 'Tracker'],
    variants: [{ displacement: 399, engine: 'Einzylinder', power: '27 PS', torque: '32 Nm' }],
  },
  {
    id: 'yamaha-virago',
    makeId: 'yamaha',
    name: 'Virago',
    yearFrom: 1981, yearTo: 2003,
    categories: ['Bobber', 'Chopper', 'Cruiser'],
    variants: [
      { displacement: 535, name: 'XV535', engine: 'Zweizylinder V', power: '45 PS', torque: '47 Nm' },
      { displacement: 750, name: 'XV750', engine: 'Zweizylinder V', power: '62 PS', torque: '60 Nm' },
      { displacement: 1000, name: 'XV1000', engine: 'Zweizylinder V', power: '68 PS', torque: '78 Nm' },
      { displacement: 1100, name: 'XV1100', engine: 'Zweizylinder V', power: '70 PS', torque: '82 Nm' },
    ],
  },
  {
    id: 'yamaha-rd350',
    makeId: 'yamaha',
    name: 'RD350',
    yearFrom: 1972, yearTo: 1975,
    categories: ['Cafe Racer'],
    variants: [{ displacement: 347, engine: 'Zweizylinder parallel', power: '39 PS', torque: '33 Nm' }],
  },
  {
    id: 'yamaha-xjr1300',
    makeId: 'yamaha',
    name: 'XJR1300',
    yearFrom: 1999, yearTo: 2016,
    categories: ['Cafe Racer', 'Naked', 'Bobber'],
    variants: [{ displacement: 1251, engine: 'Vierzylinder Reihe', power: '97 PS', torque: '108 Nm' }],
  },
  {
    id: 'yamaha-xsr700',
    makeId: 'yamaha',
    name: 'XSR700',
    yearFrom: 2016,
    categories: ['Retro', 'Cafe Racer', 'Scrambler'],
    variants: [{ displacement: 689, engine: 'Zweizylinder parallel', power: '75 PS', torque: '68 Nm' }],
  },
  {
    id: 'yamaha-xsr900',
    makeId: 'yamaha',
    name: 'XSR900',
    yearFrom: 2016,
    categories: ['Retro', 'Cafe Racer', 'Naked'],
    variants: [{ displacement: 890, engine: 'Dreizylinder', power: '119 PS', torque: '93 Nm' }],
  },

  // ── KAWASAKI ─────────────────────────────
  {
    id: 'kawasaki-z1',
    makeId: 'kawasaki',
    name: 'Z1 / Z900',
    yearFrom: 1972, yearTo: 1977,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 903, engine: 'Vierzylinder Reihe', power: '82 PS', torque: '74 Nm' }],
  },
  {
    id: 'kawasaki-z650',
    makeId: 'kawasaki',
    name: 'Z650',
    yearFrom: 1976, yearTo: 1980,
    categories: ['Cafe Racer', 'Tracker'],
    variants: [{ displacement: 652, engine: 'Vierzylinder Reihe', power: '64 PS', torque: '57 Nm' }],
  },
  {
    id: 'kawasaki-z650-neu',
    makeId: 'kawasaki',
    name: 'Z650 (neu)',
    yearFrom: 2017,
    categories: ['Naked', 'Cafe Racer'],
    variants: [{ displacement: 649, engine: 'Zweizylinder parallel', power: '68 PS', torque: '64 Nm' }],
  },
  {
    id: 'kawasaki-w650',
    makeId: 'kawasaki',
    name: 'W650 / W800',
    yearFrom: 1999,
    categories: ['Cafe Racer', 'Bobber', 'Retro'],
    variants: [
      { displacement: 675, name: 'W650', engine: 'Zweizylinder parallel', power: '52 PS', torque: '58 Nm' },
      { displacement: 773, name: 'W800', engine: 'Zweizylinder parallel', power: '52 PS', torque: '63 Nm' },
    ],
  },
  {
    id: 'kawasaki-z900rs',
    makeId: 'kawasaki',
    name: 'Z900RS',
    yearFrom: 2018,
    categories: ['Retro', 'Cafe Racer', 'Naked'],
    variants: [{ displacement: 948, engine: 'Vierzylinder Reihe', power: '111 PS', torque: '98 Nm' }],
  },
  {
    id: 'kawasaki-vulcan',
    makeId: 'kawasaki',
    name: 'Vulcan',
    yearFrom: 1985,
    categories: ['Bobber', 'Chopper', 'Cruiser'],
    variants: [
      { displacement: 500, name: 'EN500', engine: 'Zweizylinder V', power: '40 PS', torque: '40 Nm' },
      { displacement: 800, name: 'VN800', engine: 'Zweizylinder V', power: '55 PS', torque: '64 Nm' },
      { displacement: 900, name: 'VN900', engine: 'Zweizylinder V', power: '53 PS', torque: '72 Nm' },
      { displacement: 1500, name: 'VN1500', engine: 'Zweizylinder V', power: '67 PS', torque: '112 Nm' },
      { displacement: 1700, name: 'VN1700', engine: 'Zweizylinder V', power: '78 PS', torque: '128 Nm' },
    ],
  },

  // ── SUZUKI ───────────────────────────────
  {
    id: 'suzuki-gs550',
    makeId: 'suzuki',
    name: 'GS550',
    yearFrom: 1976, yearTo: 1986,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 549, engine: 'Vierzylinder Reihe', power: '50 PS', torque: '46 Nm' }],
  },
  {
    id: 'suzuki-gs750',
    makeId: 'suzuki',
    name: 'GS750',
    yearFrom: 1976, yearTo: 1983,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 748, engine: 'Vierzylinder Reihe', power: '68 PS', torque: '62 Nm' }],
  },
  {
    id: 'suzuki-gs1000',
    makeId: 'suzuki',
    name: 'GS1000',
    yearFrom: 1978, yearTo: 1981,
    categories: ['Cafe Racer', 'Naked'],
    variants: [{ displacement: 997, engine: 'Vierzylinder Reihe', power: '90 PS', torque: '82 Nm' }],
  },
  {
    id: 'suzuki-gt380',
    makeId: 'suzuki',
    name: 'GT380',
    yearFrom: 1972, yearTo: 1977,
    categories: ['Cafe Racer'],
    variants: [{ displacement: 371, engine: 'Dreizylinder', power: '38 PS', torque: '32 Nm' }],
  },
  {
    id: 'suzuki-sv650',
    makeId: 'suzuki',
    name: 'SV650',
    yearFrom: 1999,
    categories: ['Naked', 'Cafe Racer', 'Scrambler'],
    variants: [{ displacement: 645, engine: 'Zweizylinder V', power: '75 PS', torque: '64 Nm' }],
  },
  {
    id: 'suzuki-boulevard',
    makeId: 'suzuki',
    name: 'Boulevard',
    yearFrom: 2005,
    categories: ['Cruiser', 'Bobber', 'Chopper'],
    variants: [
      { displacement: 805, name: 'C50 (M50)', engine: 'Zweizylinder V', power: '53 PS', torque: '66 Nm' },
      { displacement: 1462, name: 'M90 (C90)', engine: 'Zweizylinder V', power: '73 PS', torque: '117 Nm' },
      { displacement: 1783, name: 'M109R', engine: 'Zweizylinder V', power: '123 PS', torque: '160 Nm' },
    ],
  },

  // ── BMW ──────────────────────────────────
  {
    id: 'bmw-r60',
    makeId: 'bmw',
    name: 'R60',
    yearFrom: 1955, yearTo: 1984,
    categories: ['Cafe Racer', 'Bobber'],
    variants: [
      { displacement: 594, name: 'R60/2', engine: 'Zweizylinder Boxer', power: '30 PS', torque: '44 Nm' },
      { displacement: 594, name: 'R60/5 & /6', engine: 'Zweizylinder Boxer', power: '40 PS', torque: '47 Nm' },
    ],
  },
  {
    id: 'bmw-r75',
    makeId: 'bmw',
    name: 'R75',
    yearFrom: 1969, yearTo: 1977,
    categories: ['Cafe Racer', 'Bobber'],
    variants: [{ displacement: 745, engine: 'Zweizylinder Boxer', power: '50 PS', torque: '56 Nm' }],
  },
  {
    id: 'bmw-r80',
    makeId: 'bmw',
    name: 'R80',
    yearFrom: 1977, yearTo: 1995,
    categories: ['Cafe Racer', 'Bobber', 'Scrambler'],
    variants: [
      { displacement: 797, name: 'R80', engine: 'Zweizylinder Boxer', power: '50 PS', torque: '60 Nm' },
      { displacement: 797, name: 'R80 G/S', engine: 'Zweizylinder Boxer', power: '50 PS', torque: '56 Nm' },
      { displacement: 797, name: 'R80 RT', engine: 'Zweizylinder Boxer', power: '50 PS', torque: '60 Nm' },
    ],
  },
  {
    id: 'bmw-r90',
    makeId: 'bmw',
    name: 'R90',
    yearFrom: 1973, yearTo: 1976,
    categories: ['Cafe Racer'],
    variants: [
      { displacement: 898, name: 'R90S', engine: 'Zweizylinder Boxer', power: '67 PS', torque: '73 Nm' },
      { displacement: 898, name: 'R90/6', engine: 'Zweizylinder Boxer', power: '60 PS', torque: '70 Nm' },
    ],
  },
  {
    id: 'bmw-r100',
    makeId: 'bmw',
    name: 'R100',
    yearFrom: 1976, yearTo: 1995,
    categories: ['Cafe Racer', 'Bobber', 'Scrambler'],
    variants: [
      { displacement: 980, name: 'R100S', engine: 'Zweizylinder Boxer', power: '70 PS', torque: '78 Nm' },
      { displacement: 980, name: 'R100RS', engine: 'Zweizylinder Boxer', power: '70 PS', torque: '78 Nm' },
      { displacement: 980, name: 'R100R', engine: 'Zweizylinder Boxer', power: '60 PS', torque: '74 Nm' },
      { displacement: 980, name: 'R100 GS', engine: 'Zweizylinder Boxer', power: '60 PS', torque: '74 Nm' },
    ],
  },
  {
    id: 'bmw-r-ninet',
    makeId: 'bmw',
    name: 'R nineT',
    yearFrom: 2014,
    categories: ['Cafe Racer', 'Scrambler', 'Bobber', 'Naked'],
    variants: [
      { displacement: 1170, name: 'R nineT', engine: 'Zweizylinder Boxer', power: '110 PS', torque: '116 Nm' },
      { displacement: 1170, name: 'R nineT Scrambler', engine: 'Zweizylinder Boxer', power: '110 PS', torque: '116 Nm' },
      { displacement: 1170, name: 'R nineT Pure', engine: 'Zweizylinder Boxer', power: '110 PS', torque: '116 Nm' },
      { displacement: 1170, name: 'R nineT Racer', engine: 'Zweizylinder Boxer', power: '110 PS', torque: '116 Nm' },
      { displacement: 1170, name: 'R nineT Urban G/S', engine: 'Zweizylinder Boxer', power: '110 PS', torque: '116 Nm' },
    ],
  },
  {
    id: 'bmw-r18',
    makeId: 'bmw',
    name: 'R18',
    yearFrom: 2020,
    categories: ['Bobber', 'Chopper', 'Cruiser'],
    variants: [{ displacement: 1802, engine: 'Zweizylinder Boxer', power: '91 PS', torque: '158 Nm' }],
  },

  // ── TRIUMPH ──────────────────────────────
  {
    id: 'triumph-bonneville',
    makeId: 'triumph',
    name: 'Bonneville',
    yearFrom: 1959,
    categories: ['Cafe Racer', 'Scrambler', 'Bobber', 'Retro'],
    variants: [
      { displacement: 649, name: 'T120 (klassisch)', engine: 'Zweizylinder parallel', power: '46 PS', torque: '53 Nm' },
      { displacement: 790, name: 'T100 (modern)', engine: 'Zweizylinder parallel', power: '55 PS', torque: '72 Nm' },
      { displacement: 1200, name: 'T120 (modern)', engine: 'Zweizylinder parallel', power: '80 PS', torque: '105 Nm' },
    ],
  },
  {
    id: 'triumph-thruxton',
    makeId: 'triumph',
    name: 'Thruxton',
    yearFrom: 2004,
    categories: ['Cafe Racer'],
    variants: [
      { displacement: 865, name: 'Thruxton 900', engine: 'Zweizylinder parallel', power: '69 PS', torque: '68 Nm' },
      { displacement: 1200, name: 'Thruxton 1200', engine: 'Zweizylinder parallel', power: '97 PS', torque: '112 Nm' },
      { displacement: 1200, name: 'Thruxton RS', engine: 'Zweizylinder parallel', power: '105 PS', torque: '112 Nm' },
    ],
  },
  {
    id: 'triumph-scrambler',
    makeId: 'triumph',
    name: 'Scrambler',
    yearFrom: 2006,
    categories: ['Scrambler', 'Enduro'],
    variants: [
      { displacement: 865, name: 'Scrambler 900', engine: 'Zweizylinder parallel', power: '61 PS', torque: '68 Nm' },
      { displacement: 1200, name: 'Scrambler 1200', engine: 'Zweizylinder parallel', power: '90 PS', torque: '110 Nm' },
    ],
  },
  {
    id: 'triumph-trident',
    makeId: 'triumph',
    name: 'Trident 660',
    yearFrom: 2021,
    categories: ['Naked', 'Cafe Racer'],
    variants: [{ displacement: 660, engine: 'Dreizylinder', power: '81 PS', torque: '64 Nm' }],
  },
  {
    id: 'triumph-speed-twin',
    makeId: 'triumph',
    name: 'Speed Twin',
    yearFrom: 2019,
    categories: ['Naked', 'Cafe Racer', 'Retro'],
    variants: [
      { displacement: 900, name: 'Speed Twin 900', engine: 'Zweizylinder parallel', power: '65 PS', torque: '80 Nm' },
      { displacement: 1200, name: 'Speed Twin 1200', engine: 'Zweizylinder parallel', power: '100 PS', torque: '112 Nm' },
    ],
  },
  {
    id: 'triumph-t100',
    makeId: 'triumph',
    name: 'T100 / Tiger 100',
    yearFrom: 1939, yearTo: 1973,
    categories: ['Cafe Racer', 'Scrambler'],
    variants: [{ displacement: 649, engine: 'Zweizylinder parallel', power: '42 PS', torque: '52 Nm' }],
  },

  // ── HARLEY-DAVIDSON ──────────────────────
  {
    id: 'harley-sportster',
    makeId: 'harley',
    name: 'Sportster',
    yearFrom: 1957, yearTo: 2022,
    categories: ['Bobber', 'Cafe Racer', 'Tracker', 'Chopper'],
    variants: [
      { displacement: 883, name: 'XL883 Ironhead (bis 1985)', engine: 'Zweizylinder V', power: '48 PS', torque: '68 Nm' },
      { displacement: 883, name: 'XL883 Evolution', engine: 'Zweizylinder V', power: '50 PS', torque: '68 Nm' },
      { displacement: 1200, name: 'XL1200', engine: 'Zweizylinder V', power: '67 PS', torque: '100 Nm' },
      { displacement: 1200, name: 'XL1200C Custom', engine: 'Zweizylinder V', power: '67 PS', torque: '100 Nm' },
      { displacement: 1200, name: 'XL1200X Forty-Eight', engine: 'Zweizylinder V', power: '67 PS', torque: '100 Nm' },
    ],
  },
  {
    id: 'harley-sportster-s',
    makeId: 'harley',
    name: 'Sportster S',
    yearFrom: 2021,
    categories: ['Naked', 'Tracker'],
    variants: [{ displacement: 1252, engine: 'Zweizylinder V', power: '121 PS', torque: '127 Nm' }],
  },
  {
    id: 'harley-softail',
    makeId: 'harley',
    name: 'Softail',
    yearFrom: 1984,
    categories: ['Bobber', 'Chopper', 'Cruiser'],
    variants: [
      { displacement: 1450, name: 'Fat Boy (EVO/TC88)', engine: 'Zweizylinder V', power: '65 PS', torque: '105 Nm' },
      { displacement: 1690, name: 'Fat Boy (Twin Cam 96)', engine: 'Zweizylinder V', power: '72 PS', torque: '120 Nm' },
      { displacement: 1745, name: 'Fat Boy 114', engine: 'Zweizylinder V', power: '93 PS', torque: '155 Nm' },
      { displacement: 1745, name: 'Breakout', engine: 'Zweizylinder V', power: '93 PS', torque: '155 Nm' },
      { displacement: 1745, name: 'Street Bob', engine: 'Zweizylinder V', power: '93 PS', torque: '135 Nm' },
    ],
  },
  {
    id: 'harley-dyna',
    makeId: 'harley',
    name: 'Dyna',
    yearFrom: 1991, yearTo: 2017,
    categories: ['Bobber', 'Chopper', 'Cruiser'],
    variants: [
      { displacement: 1340, name: 'Evo', engine: 'Zweizylinder V', power: '58 PS', torque: '96 Nm' },
      { displacement: 1450, name: 'Twin Cam 88', engine: 'Zweizylinder V', power: '65 PS', torque: '108 Nm' },
      { displacement: 1584, name: 'Twin Cam 96', engine: 'Zweizylinder V', power: '68 PS', torque: '117 Nm' },
    ],
  },
  {
    id: 'harley-iron',
    makeId: 'harley',
    name: 'Iron 883 / 1200',
    yearFrom: 2009,
    categories: ['Bobber', 'Tracker'],
    variants: [
      { displacement: 883, name: 'Iron 883', engine: 'Zweizylinder V', power: '50 PS', torque: '73 Nm' },
      { displacement: 1200, name: 'Iron 1200', engine: 'Zweizylinder V', power: '67 PS', torque: '100 Nm' },
    ],
  },

  // ── DUCATI ───────────────────────────────
  {
    id: 'ducati-scrambler',
    makeId: 'ducati',
    name: 'Scrambler',
    yearFrom: 1962, yearTo: 1975,
    categories: ['Scrambler'],
    variants: [
      { displacement: 250, name: '250 Scrambler', engine: 'Einzylinder', power: '21 PS', torque: '19 Nm' },
      { displacement: 350, name: '350 Scrambler', engine: 'Einzylinder', power: '27 PS', torque: '26 Nm' },
    ],
  },
  {
    id: 'ducati-scrambler-neu',
    makeId: 'ducati',
    name: 'Scrambler (modern)',
    yearFrom: 2015,
    categories: ['Scrambler', 'Cafe Racer', 'Bobber'],
    variants: [
      { displacement: 803, name: 'Scrambler Icon / Sixty2', engine: 'Zweizylinder V', power: '73 PS', torque: '65 Nm' },
      { displacement: 1100, name: 'Scrambler 1100', engine: 'Zweizylinder V', power: '86 PS', torque: '88 Nm' },
    ],
  },
  {
    id: 'ducati-monster',
    makeId: 'ducati',
    name: 'Monster',
    yearFrom: 1993,
    categories: ['Naked', 'Cafe Racer'],
    variants: [
      { displacement: 620, name: 'Monster 620', engine: 'Zweizylinder V', power: '62 PS', torque: '56 Nm' },
      { displacement: 796, name: 'Monster 796', engine: 'Zweizylinder V', power: '87 PS', torque: '78 Nm' },
      { displacement: 900, name: 'Monster 900', engine: 'Zweizylinder V', power: '73 PS', torque: '78 Nm' },
      { displacement: 1000, name: 'Monster 1000', engine: 'Zweizylinder V', power: '95 PS', torque: '90 Nm' },
      { displacement: 1078, name: 'Monster 1100', engine: 'Zweizylinder V', power: '95 PS', torque: '103 Nm' },
    ],
  },

  // ── KTM ──────────────────────────────────
  {
    id: 'ktm-duke',
    makeId: 'ktm',
    name: 'Duke',
    yearFrom: 1994,
    categories: ['Naked', 'Tracker'],
    variants: [
      { displacement: 125, name: '125 Duke', engine: 'Einzylinder', power: '15 PS', torque: '12 Nm' },
      { displacement: 390, name: '390 Duke', engine: 'Einzylinder', power: '45 PS', torque: '37 Nm' },
      { displacement: 690, name: '690 Duke', engine: 'Einzylinder', power: '73 PS', torque: '70 Nm' },
      { displacement: 890, name: '890 Duke', engine: 'Zweizylinder parallel', power: '115 PS', torque: '99 Nm' },
    ],
  },
  {
    id: 'ktm-790',
    makeId: 'ktm',
    name: '790 / 890 Duke R',
    yearFrom: 2018,
    categories: ['Naked', 'Cafe Racer'],
    variants: [
      { displacement: 799, name: '790 Duke', engine: 'Zweizylinder parallel', power: '105 PS', torque: '87 Nm' },
      { displacement: 889, name: '890 Duke R', engine: 'Zweizylinder parallel', power: '121 PS', torque: '99 Nm' },
    ],
  },

  // ── ROYAL ENFIELD ────────────────────────
  {
    id: 'royal-enfield-bullet',
    makeId: 'royal-enfield',
    name: 'Bullet',
    yearFrom: 1931,
    categories: ['Bobber', 'Cafe Racer', 'Scrambler'],
    variants: [
      { displacement: 346, name: 'Bullet 350', engine: 'Einzylinder', power: '20 PS', torque: '28 Nm' },
      { displacement: 499, name: 'Bullet 500', engine: 'Einzylinder', power: '27 PS', torque: '41 Nm' },
    ],
  },
  {
    id: 'royal-enfield-interceptor',
    makeId: 'royal-enfield',
    name: 'Interceptor 650',
    yearFrom: 2018,
    categories: ['Cafe Racer', 'Bobber', 'Scrambler'],
    variants: [{ displacement: 648, engine: 'Zweizylinder parallel', power: '47 PS', torque: '52 Nm' }],
  },
  {
    id: 'royal-enfield-continental',
    makeId: 'royal-enfield',
    name: 'Continental GT 650',
    yearFrom: 2018,
    categories: ['Cafe Racer'],
    variants: [{ displacement: 648, engine: 'Zweizylinder parallel', power: '47 PS', torque: '52 Nm' }],
  },
  {
    id: 'royal-enfield-meteor',
    makeId: 'royal-enfield',
    name: 'Meteor 350',
    yearFrom: 2020,
    categories: ['Cruiser', 'Bobber'],
    variants: [{ displacement: 349, engine: 'Einzylinder', power: '21 PS', torque: '27 Nm' }],
  },

  // ── MOTO GUZZI ───────────────────────────
  {
    id: 'moto-guzzi-v7',
    makeId: 'moto-guzzi',
    name: 'V7',
    yearFrom: 1967,
    categories: ['Cafe Racer', 'Bobber', 'Scrambler', 'Retro'],
    variants: [
      { displacement: 700, name: 'V7 Classic', engine: 'Zweizylinder V', power: '40 PS', torque: '55 Nm' },
      { displacement: 744, name: 'V7 III', engine: 'Zweizylinder V', power: '52 PS', torque: '60 Nm' },
      { displacement: 853, name: 'V7 Stone (2021+)', engine: 'Zweizylinder V', power: '65 PS', torque: '73 Nm' },
    ],
  },
  {
    id: 'moto-guzzi-v9',
    makeId: 'moto-guzzi',
    name: 'V9 Bobber / Roamer',
    yearFrom: 2016,
    categories: ['Bobber', 'Cruiser'],
    variants: [{ displacement: 853, engine: 'Zweizylinder V', power: '55 PS', torque: '68 Nm' }],
  },
  {
    id: 'moto-guzzi-le-mans',
    makeId: 'moto-guzzi',
    name: 'Le Mans',
    yearFrom: 1976, yearTo: 1993,
    categories: ['Cafe Racer', 'Sport'],
    variants: [
      { displacement: 844, name: 'Le Mans I/II', engine: 'Zweizylinder V', power: '71 PS', torque: '74 Nm' },
      { displacement: 949, name: 'Le Mans III/IV', engine: 'Zweizylinder V', power: '79 PS', torque: '83 Nm' },
    ],
  },
  {
    id: 'moto-guzzi-california',
    makeId: 'moto-guzzi',
    name: 'California',
    yearFrom: 1971,
    categories: ['Cruiser', 'Touring', 'Bobber'],
    variants: [
      { displacement: 844, name: 'California II', engine: 'Zweizylinder V', power: '68 PS', torque: '70 Nm' },
      { displacement: 949, name: 'California III', engine: 'Zweizylinder V', power: '71 PS', torque: '75 Nm' },
      { displacement: 1064, name: 'California EV / Special', engine: 'Zweizylinder V', power: '74 PS', torque: '85 Nm' },
      { displacement: 1380, name: 'California 1400 Touring', engine: 'Zweizylinder V', power: '96 PS', torque: '121 Nm' },
      { displacement: 1380, name: 'California 1400 Custom', engine: 'Zweizylinder V', power: '96 PS', torque: '121 Nm' },
    ],
  },

  // ── NORTON ───────────────────────────────
  {
    id: 'norton-commando',
    makeId: 'norton',
    name: 'Commando',
    yearFrom: 1967, yearTo: 1977,
    categories: ['Cafe Racer', 'Scrambler'],
    variants: [
      { displacement: 745, name: '750 Commando', engine: 'Zweizylinder parallel', power: '58 PS', torque: '62 Nm' },
      { displacement: 828, name: '850 Commando', engine: 'Zweizylinder parallel', power: '60 PS', torque: '68 Nm' },
    ],
  },
  {
    id: 'norton-dominator',
    makeId: 'norton',
    name: 'Dominator',
    yearFrom: 1949, yearTo: 1968,
    categories: ['Cafe Racer'],
    variants: [
      { displacement: 497, name: 'Model 88 (500)', engine: 'Zweizylinder parallel', power: '30 PS', torque: '37 Nm' },
      { displacement: 596, name: 'Model 99 (600)', engine: 'Zweizylinder parallel', power: '36 PS', torque: '44 Nm' },
    ],
  },

  // ── INDIAN ───────────────────────────────
  {
    id: 'indian-scout',
    makeId: 'indian',
    name: 'Scout',
    yearFrom: 1920,
    categories: ['Bobber', 'Chopper', 'Cruiser'],
    variants: [
      { displacement: 999, name: 'Scout (modern)', engine: 'Zweizylinder V', power: '100 PS', torque: '98 Nm' },
      { displacement: 1133, name: 'Scout Bobber Sixty', engine: 'Zweizylinder V', power: '78 PS', torque: '90 Nm' },
    ],
  },
  {
    id: 'indian-chief',
    makeId: 'indian',
    name: 'Chief',
    yearFrom: 1922,
    categories: ['Cruiser', 'Chopper', 'Bobber'],
    variants: [
      { displacement: 1811, name: 'Chief Classic', engine: 'Zweizylinder V', power: '90 PS', torque: '139 Nm' },
      { displacement: 1811, name: 'Chief Dark Horse', engine: 'Zweizylinder V', power: '90 PS', torque: '139 Nm' },
    ],
  },

  // ── BSA ──────────────────────────────────
  {
    id: 'bsa-a65',
    makeId: 'bsa',
    name: 'A65 Lightning / Thunderbolt',
    yearFrom: 1962, yearTo: 1973,
    categories: ['Cafe Racer', 'Scrambler'],
    variants: [{ displacement: 646, engine: 'Zweizylinder parallel', power: '50 PS', torque: '53 Nm' }],
  },
  {
    id: 'bsa-a10',
    makeId: 'bsa',
    name: 'A10 Golden Flash',
    yearFrom: 1950, yearTo: 1963,
    categories: ['Cafe Racer', 'Bobber'],
    variants: [{ displacement: 646, engine: 'Zweizylinder parallel', power: '34 PS', torque: '48 Nm' }],
  },
]

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export function getModelsByMake(makeId: string): MotorcycleModel[] {
  return MODELS.filter(m => m.makeId === makeId)
}

export function getModelById(id: string): MotorcycleModel | undefined {
  return MODELS.find(m => m.id === id)
}

/** Alle Baujahre für ein Modell als Array */
export function getYearsForModel(model: MotorcycleModel): number[] {
  const to = model.yearTo ?? new Date().getFullYear()
  return Array.from({ length: to - model.yearFrom + 1 }, (_, i) => model.yearFrom + i).reverse()
}
