/**
 * Matches custom builds to the base bike catalogue (/marken).
 *
 * Builds store make and model as free text ("BMW Motorrad", "CB750"), the
 * catalogue groups variants ("BMW", "CB 750", "Monster 400/600/620"). Both
 * sides are compared as token lists, so spacing and punctuation don't matter.
 */

type Tokens = string[]

// A build year may be off by a model year or two from the catalogue range
const YEAR_TOLERANCE = 2

function tokenize(value: string): Tokens {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .match(/[a-z]+|\d+/g) ?? []
}

function startsWithTokens(tokens: Tokens, prefix: Tokens, at = 0): boolean {
  return prefix.every((t, i) => tokens[at + i] === t)
}

function containsTokens(tokens: Tokens, part: Tokens): boolean {
  for (let i = 0; i + part.length <= tokens.length; i++) {
    if (startsWithTokens(tokens, part, i)) return true
  }
  return false
}

/**
 * Catalogue variants: "Monster 400/600" → [monster 400], [monster 600];
 * "Le Mans I / II" → [le mans i], [le mans ii]. A slash between two letters
 * ("G/S") belongs to the name.
 */
function modelVariants(model: string): Tokens[] {
  const parts = model.split(/(?<![a-z])\/|\/(?![a-z])/i).map(tokenize).filter((t) => t.length > 0)
  const family = parts[0]?.slice(0, -1) ?? []
  return parts.map((t) => (t.length === 1 ? [...family, ...t] : t))
}

/** First word of the brand, for a coarse `ilike` prefilter on `bikes.make`. */
export function makePrefixPattern(brandName: string): string {
  return `${brandName.split(/[\s-]/)[0]}%`
}

/** "BMW" matches the make "BMW Motorrad", "Harley-Davidson" matches "Harley Davidson". */
export function makeMatchesBrand(make: string | null | undefined, brandName: string): boolean {
  const brand = tokenize(brandName)
  return !!make && brand.length > 0 && startsWithTokens(tokenize(make), brand)
}

/** Model pages are indexed once they have more than the spec sheet: builds or editorial notes. */
export function hasModelPageContent(buildCount: number, notes: string | null | undefined): boolean {
  return buildCount > 0 || !!notes?.trim()
}

export function bikeMatchesBaseModel(
  bike: { model: string | null; year: number | null },
  base: { model: string; year_from: number | null; year_to: number | null },
): boolean {
  const tokens = tokenize(bike.model ?? '')
  if (tokens.length === 0) return false

  if (bike.year && base.year_from) {
    const to = base.year_to ?? Infinity
    if (bike.year < base.year_from - YEAR_TOLERANCE || bike.year > to + YEAR_TOLERANCE) return false
  }

  // A bare family name ("Monster", "Le Mans") also covers its numbered variants
  const familyOnly = tokens.every((t) => !/\d/.test(t))
  return modelVariants(base.model).some(
    (variant) => containsTokens(tokens, variant) || (familyOnly && startsWithTokens(variant, tokens)),
  )
}
