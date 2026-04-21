import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',

  // Default locale (DE) served at root ("/"); only EN gets "/en/..." prefix.
  // Preserves every existing indexed URL and matches what most German
  // sites do (Zalando, Otto, etc.) — the best-practice "always prefix"
  // pattern would force a one-time SEO churn for no practical benefit.
  localePrefix: 'as-needed',

  // Detect locale from Accept-Language header on first visit
  localeDetection: true,

  // Translated pathnames (Option 2B) — SEO-friendly per-locale slugs.
  // Technical/internal routes (dashboard, admin, auth, api) stay identical
  // across locales because they're not public-facing SEO surfaces.
  pathnames: {
    '/': '/',

    // Public marketing pages — translated slugs
    '/custom-werkstatt': {
      de: '/custom-werkstatt',
      en: '/workshops',
    },
    '/custom-werkstatt/[slug]': {
      de: '/custom-werkstatt/[slug]',
      en: '/workshops/[slug]',
    },
    '/ueber-motodigital': {
      de: '/ueber-motodigital',
      en: '/about',
    },
    '/vorteile': {
      de: '/vorteile',
      en: '/benefits',
    },
    '/nutzungsbedingungen': {
      de: '/nutzungsbedingungen',
      en: '/terms',
    },
    '/datenschutz': {
      de: '/datenschutz',
      en: '/privacy',
    },
    '/impressum': {
      de: '/impressum',
      en: '/legal-notice',
    },
    '/willkommen': {
      de: '/willkommen',
      en: '/welcome',
    },
    '/marken': {
      de: '/marken',
      en: '/brands',
    },
    '/marken/[slug]': {
      de: '/marken/[slug]',
      en: '/brands/[slug]',
    },
    '/marken/[slug]/[model-slug]': {
      de: '/marken/[slug]/[model-slug]',
      en: '/brands/[slug]/[model-slug]',
    },
    '/sell': {
      de: '/sell',
      en: '/sell',
    },

    // These words work in both languages — keep identical slugs
    '/magazine': '/magazine',
    '/magazine/[slug]': '/magazine/[slug]',
    '/magazine/build-story': '/magazine/build-story',
    '/magazine/guide': '/magazine/guide',
    '/magazine/interview': '/magazine/interview',
    '/events': '/events',
    '/events/[slug]': '/events/[slug]',
    '/bikes': '/bikes',
    '/bikes/new': '/bikes/new',
    '/bikes/[slug]': '/bikes/[slug]',
    '/bikes/[slug]/edit': '/bikes/[slug]/edit',
    '/builds': '/builds',
    '/builds/[slug]': '/builds/[slug]',
    '/custom-bike/[slug]': '/custom-bike/[slug]',
    '/explore': '/explore',
    '/search': '/search',
    '/rider': '/rider',
    '/rider/[slug]': '/rider/[slug]',
    '/partner': '/partner',
    '/faq': '/faq',
    '/support': '/support',
    '/landing': '/landing',

    // Auth flow — identical slugs (short and universal)
    '/auth/login': '/auth/login',
    '/auth/register': '/auth/register',
    '/auth/verify': '/auth/verify',
    '/auth/accept-invite': '/auth/accept-invite',
    '/verify-email': '/verify-email',
    '/account-deleted': '/account-deleted',
    '/onboarding': '/onboarding',
    '/coming-soon': '/coming-soon',

    // Dashboard — internal, keep technical slugs
    '/dashboard': '/dashboard',
    '/dashboard/profile': '/dashboard/profile',
    '/dashboard/messages': '/dashboard/messages',
    '/dashboard/notifications': '/dashboard/notifications',
    '/dashboard/meine-garage': '/dashboard/meine-garage',
    '/dashboard/merkliste': '/dashboard/merkliste',
    '/dashboard/account': '/dashboard/account',

    // Admin — internal, keep slugs
    '/admin/custom-werkstatt': '/admin/custom-werkstatt',
    '/admin/custom-werkstatt/neu': '/admin/custom-werkstatt/neu',
    '/admin/custom-werkstatt/[slug]/edit': '/admin/custom-werkstatt/[slug]/edit',
    '/admin/custom-bikes': '/admin/custom-bikes',
    '/admin/custom-bikes/neu': '/admin/custom-bikes/neu',
    '/admin/magazine': '/admin/magazine',
    '/admin/magazine/new': '/admin/magazine/new',
    '/admin/magazine/[slug]/edit': '/admin/magazine/[slug]/edit',
    '/admin/events': '/admin/events',
    '/admin/events/new': '/admin/events/new',
    '/admin/events/[id]/edit': '/admin/events/[id]/edit',
    '/admin/riders': '/admin/riders',
    '/admin/riders/[id]/edit': '/admin/riders/[id]/edit',
    '/admin/riders/[id]/delete': '/admin/riders/[id]/delete',
  },
})

export type Locale = (typeof routing.locales)[number]
