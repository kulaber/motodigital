import { setRequestLocale } from 'next-intl/server'
import LandingPage from './landing/page'

// Locale-aware root landing. Rider/workshop redirects are handled by
// middleware so we avoid a blocking getUser() call on every landing hit.
export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <LandingPage />
}
